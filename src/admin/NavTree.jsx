import React, { useState } from 'react';
import {
  GripVertical, FileText, Folder, ChevronDown, ChevronRight, Plus, Link2,
} from 'lucide-react';

// ---- Opérations sur l'arbre de navigation ----

export const removeNavItem = (nav, id) => {
  let removed = null;
  const result = [];
  for (const item of nav) {
    if (item.id === id) {
      removed = item;
      continue;
    }
    if (item.children) {
      const idx = item.children.findIndex((c) => c.id === id);
      if (idx !== -1) {
        removed = item.children[idx];
        result.push({ ...item, children: item.children.filter((c) => c.id !== id) });
        continue;
      }
    }
    result.push(item);
  }
  return [result, removed];
};

export const insertNavItem = (nav, item, target) => {
  if (!target) return [...nav, item];
  const { id, pos } = target;

  if (pos === 'inside') {
    return nav.map((n) =>
      n.id === id ? { ...n, children: [...(n.children || []), item] } : n
    );
  }

  // before / after — au niveau racine
  const rootIdx = nav.findIndex((n) => n.id === id);
  if (rootIdx !== -1) {
    const copy = [...nav];
    copy.splice(pos === 'before' ? rootIdx : rootIdx + 1, 0, item);
    return copy;
  }

  // before / after — dans les enfants d'un dropdown
  return nav.map((n) => {
    if (!n.children) return n;
    const idx = n.children.findIndex((c) => c.id === id);
    if (idx === -1) return n;
    const children = [...n.children];
    children.splice(pos === 'before' ? idx : idx + 1, 0, item);
    return { ...n, children };
  });
};

const findNavItem = (nav, id) => {
  for (const item of nav) {
    if (item.id === id) return item;
    if (item.children) {
      const child = item.children.find((c) => c.id === id);
      if (child) return child;
    }
  }
  return null;
};

// ---- Composant arbre avec drag & drop natif HTML5 ----

export default function NavTree({ navigation, selectedId, onSelect, onChange, onAddPageInside }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { id, pos: 'before'|'after'|'inside' }
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, item, isChild) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === item.id) return;

    const dragged = findNavItem(navigation, draggedId);
    if (!dragged) return;
    // Un dropdown ne peut pas être imbriqué dans un dropdown
    if (isChild && dragged.type === 'dropdown') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;

    let pos;
    const canNest = item.type === 'dropdown' && dragged.type !== 'dropdown';
    if (canNest && ratio > 0.3 && ratio < 0.7) {
      pos = 'inside';
    } else {
      pos = ratio < 0.5 ? 'before' : 'after';
    }
    setDropTarget({ id: item.id, pos });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || !dropTarget || draggedId === dropTarget.id) {
      setDraggedId(null);
      setDropTarget(null);
      return;
    }
    const [without, item] = removeNavItem(navigation, draggedId);
    if (item) {
      onChange(insertNavItem(without, item, dropTarget));
      if (dropTarget.pos === 'inside') {
        setExpanded((prev) => ({ ...prev, [dropTarget.id]: true }));
      }
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  const renderRow = (item, isChild = false) => {
    const isSelected = selectedId === item.id;
    const isDropdown = item.type === 'dropdown';
    const isExpanded = expanded[item.id] !== false; // ouvert par défaut
    const dropClass =
      dropTarget && dropTarget.id === item.id ? `drop-${dropTarget.pos}` : '';

    return (
      <div key={item.id}>
        <div
          className={`tree-row ${isSelected ? 'selected' : ''} ${draggedId === item.id ? 'dragging' : ''} ${dropClass}`}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item, isChild)}
          onDragLeave={() => setDropTarget((t) => (t && t.id === item.id ? null : t))}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onClick={() => onSelect(item.id)}
        >
          <div className="tree-row-main">
            <GripVertical size={13} className="grip" />
            {isDropdown ? (
              <>
                <button
                  type="button"
                  className="tree-chevron"
                  onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                  aria-label={isExpanded ? 'Replier' : 'Déplier'}
                >
                  {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                <Folder size={15} className="tree-icon" />
              </>
            ) : item.type === 'lien' ? (
              <Link2 size={15} className="tree-icon tree-icon--lien" />
            ) : (
              <FileText size={15} className="tree-icon" />
            )}
            <span className="tree-label">{item.label}</span>
            {item.type === 'lien' && <span className="tree-badge-lien">raccourci</span>}
          </div>

          {isDropdown && (
            <button
              type="button"
              className="tree-add-child"
              title="Ajouter une page dans ce menu"
              onClick={(e) => { e.stopPropagation(); onAddPageInside(item.id); }}
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {isDropdown && isExpanded && (item.children || []).length > 0 && (
          <div className="tree-children">
            {item.children.map((child) => renderRow(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div onDragOver={(e) => e.preventDefault()}>
      {navigation.map((item) => renderRow(item))}
      <p className="admin-tree-hint">
        Glissez-déposez pour réordonner · déposez au centre d'un dossier pour imbriquer
      </p>
    </div>
  );
}
