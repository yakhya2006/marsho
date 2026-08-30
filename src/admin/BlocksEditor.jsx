import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Trash2, Plus, Copy, GripVertical, X, LayoutTemplate,
} from 'lucide-react';
import { BLOCKS, BLOCK_GROUPS, newBlock } from '../config/blocks';
import { BlockView } from '../blocks';
import FieldRenderer from './FieldRenderer';
import { uid } from '../config/helpers';

// Contenu de démonstration pour les aperçus de la modal d'ajout —
// uniquement pour montrer le rendu, jamais enregistré dans la page.
const demoImg = { src: '/media/carte-terrain.jpg', lien: '' };
const PREVIEW_SAMPLES = {
  texte: { titre: 'Titre de section', corps: '<p>Un paragraphe de texte riche, avec <strong>gras</strong> et mise en forme.</p>' },
  apropos: {
    tag: 'Étiquette', titre: 'Titre', corps: '<p>Texte présentant votre sujet, image à droite.</p>',
    image: demoImg, valeurs: [{ id: 'd1', icon: '🌿', titre: 'Valeur', texte: 'Description courte' }],
  },
  icones: {
    titre: 'Infos pratiques',
    items: [
      { id: 'd1', icon: '🎯', titre: 'Format', texte: 'Description' },
      { id: 'd2', icon: '🌲', titre: 'Terrain', texte: 'Description' },
      { id: 'd3', icon: '👤', titre: 'Âge', texte: 'Description' },
    ],
  },
  html: { titre: 'Bloc HTML', corps: '<p>Contenu HTML libre.</p>' },
  activites: {
    cartes: [{ id: 'd1', titre: 'Activité', texte: 'Description de l’activité.', badge: 'Badge', features: 'Point fort 1\nPoint fort 2', image: demoImg, lien: '/' }],
  },
  terrains: {
    terrains: [{ id: 'd1', nom: 'Terrain', lieu: '📍 Localisation', texte: 'Description du lieu.', badge: 'Site', tags: 'Tag 1\nTag 2', image: demoImg }],
  },
  galerie: { images: [1, 2, 3, 4].map((i) => ({ id: 'd' + i, image: demoImg })) },
  tarifs: {
    colonnes: [{ id: 'd1', icon: '🎯', nom: 'Formule', lignes: 'Prestation | 15€\nOption | 25€', highlight: false, badge: '' }],
  },
  tarifs_table: { lignes: 'Prestation | 15€\nAutre prestation | 25€', note: 'Note sous le tableau' },
  logos: { logos: [{ id: 'd1', nom: 'Partenaire', image: { src: '/media/logo-avalon.svg', lien: '' } }, { id: 'd2', nom: 'Partenaire', image: { src: '', lien: '' } }] },
  actualites: {
    articles: [{ id: 'd1', titre: 'Titre de l’article', date: '2026-07-14', contenu: 'Contenu de l’article avec image et lien optionnels.', image: demoImg, lien: '', lien_label: '' }],
  },
  sessions_calendrier: {
    sessions: [{ id: 'd1', nom: 'Session de démonstration', categorie: 'airsoft', description: '', date: new Date().toISOString().slice(0, 10), heure_debut: '09:00', heure_fin: '18:00', lieu: 'Le Moulin Berra', image: { src: '', lien: '' }, lien_helloasso: '' }],
  },
  carte_points: { image: demoImg, points: [{ id: 'd1', label: 'Zone', desc: 'Description', x: 40, y: 50, image: { src: '', lien: '' } }] },
  hero: { image: demoImg, desc: 'Texte de description du bandeau principal.' },
  activite_hero: { titre: 'Titre', intro: 'Phrase d’introduction de la page.', image: demoImg },
};

// Aperçu d'un bloc = le VRAI composant de rendu du site, en miniature.
// Fidélité garantie : c'est le même code que côté client.
export function BlockPreview({ type, props, data }) {
  const block = {
    id: 'preview',
    type,
    props: props || { ...BLOCKS[type].defaults(), ...(PREVIEW_SAMPLES[type] || {}) },
  };
  return (
    <div className="block-preview">
      <div className="block-preview-scale avalon-tdj-body">
        <BlockView block={block} data={data} isFirst={false} />
      </div>
    </div>
  );
}

// Modal de choix de gabarit : ajout d'une section, ou changement de
// gabarit d'une section existante (mode `replace`).
export function AddBlockModal({ data, onAdd, onClose, replaceType }) {
  const [selected, setSelected] = useState(replaceType || 'hero');

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal add-block-modal" onClick={(e) => e.stopPropagation()}>
        <div className="media-picker-head">
          <h3>{replaceType ? 'Changer le gabarit de cette section' : 'Choisir un gabarit de section'}</h3>
          <button type="button" className="admin-btn-ghost" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        <div className="add-block-layout">
          <div className="add-block-list">
            {BLOCK_GROUPS.map((group) => (
              <div key={group}>
                <div className="tree-section-title">{group}</div>
                {Object.entries(BLOCKS)
                  .filter(([, def]) => def.group === group)
                  .map(([type, def]) => (
                    <button
                      key={type}
                      type="button"
                      className={`add-block-option ${selected === type ? 'selected' : ''}`}
                      onClick={() => setSelected(type)}
                      onDoubleClick={() => onAdd(type)}
                    >
                      <strong>{def.label}</strong>
                      <span>{def.description}</span>
                    </button>
                  ))}
              </div>
            ))}
          </div>

          <div className="add-block-preview">
            <p className="add-block-preview-label">
              Aperçu réel — exactement le rendu côté visiteurs
            </p>
            <BlockPreview type={selected} data={data} />
            <button type="button" className="admin-btn-primary admin-btn-full" onClick={() => onAdd(selected)}>
              {replaceType ? <LayoutTemplate size={14} /> : <Plus size={14} />}
              {replaceType ? ` Passer au gabarit « ${BLOCKS[selected].label} »` : ` Ajouter « ${BLOCKS[selected].label} »`}
            </button>
            {replaceType && (
              <p className="add-block-preview-label" style={{ opacity: 0.7 }}>
                Les champs communs (titres, textes, images, ancre…) sont conservés.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Titre lisible d'un bloc replié (son contenu principal)
const blockSummary = (block) => {
  const p = block.props || {};
  return p.titre || p.titre_1 || p.tag || (p.boutons?.[0]?.label) || '';
};

// Éditeur de la pile de sections d'une page :
// réordonner (drag & drop), plier/déplier, dupliquer, supprimer, ajouter.
// `autoOpenAnchor` : déplie automatiquement le bloc portant cette ancre
// (utilisé par « Modifier la section… » depuis un raccourci de menu).
export default function BlocksEditor({ blocks, data, onChange, autoOpenAnchor }) {
  const [open, setOpen] = useState(() => {
    if (!autoOpenAnchor) return {};
    const target = blocks.find((b) => b.props?.anchor === autoOpenAnchor);
    return target ? { [target.id]: true } : {};
  });
  const [addOpen, setAddOpen] = useState(false);
  const [changeTypeFor, setChangeTypeFor] = useState(null); // id du bloc dont on change le gabarit
  const [draggedId, setDraggedId] = useState(null);
  const [dropId, setDropId] = useState(null); // { id, pos }
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const updateProps = (id, props) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, props } : b)));

  const duplicate = (block) => {
    const idx = blocks.findIndex((b) => b.id === block.id);
    const copy = { ...JSON.parse(JSON.stringify(block)), id: uid('blk') };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  };

  const remove = (id) => {
    setConfirmDelete(null);
    onChange(blocks.filter((b) => b.id !== id));
  };

  // Changer le gabarit d'une section : les champs de même nom
  // (titre, tag, desc, image, boutons, ancre…) sont conservés.
  const changeType = (id, newType) => {
    onChange(blocks.map((b) => {
      if (b.id !== id) return b;
      const defaults = BLOCKS[newType].defaults();
      const props = { ...defaults };
      for (const key of Object.keys(defaults)) {
        if (b.props?.[key] !== undefined && b.props[key] !== '' && !(Array.isArray(b.props[key]) && b.props[key].length === 0)) {
          props[key] = b.props[key];
        }
      }
      return { ...b, type: newType, props };
    }));
    setChangeTypeFor(null);
    setOpen((prev) => ({ ...prev, [id]: true }));
  };

  const handleDrop = () => {
    if (!draggedId || !dropId || draggedId === dropId.id) {
      setDraggedId(null);
      setDropId(null);
      return;
    }
    const item = blocks.find((b) => b.id === draggedId);
    const without = blocks.filter((b) => b.id !== draggedId);
    const idx = without.findIndex((b) => b.id === dropId.id);
    without.splice(dropId.pos === 'before' ? idx : idx + 1, 0, item);
    onChange(without);
    setDraggedId(null);
    setDropId(null);
  };

  return (
    <div className="blocks-editor">
      <p className="blocks-editor-hint">
        Cette page est composée de <strong>sections empilées</strong> (de haut en bas, comme sur le site).
        Cliquez sur une section pour modifier son contenu · glissez ⣿ pour réordonner ·
        « Ajouter une section » propose tous les gabarits avec aperçu.
      </p>
      {blocks.map((block) => {
        const def = BLOCKS[block.type];
        const isOpen = !!open[block.id];
        const summary = blockSummary(block);
        const dropClass = dropId?.id === block.id ? `drop-${dropId.pos}` : '';
        return (
          <div
            key={block.id}
            className={`block-item ${draggedId === block.id ? 'dragging' : ''} ${dropClass}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!draggedId || draggedId === block.id) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientY - rect.top) / rect.height < 0.5 ? 'before' : 'after';
              setDropId({ id: block.id, pos });
            }}
            onDrop={(e) => { e.preventDefault(); handleDrop(); }}
          >
            <div
              className="block-item-head"
              draggable
              onDragStart={(e) => { setDraggedId(block.id); e.dataTransfer.effectAllowed = 'move'; }}
              onDragEnd={() => { setDraggedId(null); setDropId(null); }}
              onClick={() => toggle(block.id)}
            >
              <GripVertical size={14} className="grip" />
              {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              <span className="block-item-label">{def?.label || block.type}</span>
              {summary && summary !== def?.label && <span className="block-item-summary">« {summary} »</span>}
              {block.props?.anchor && <span className="block-item-anchor">#{block.props.anchor}</span>}
              <div className="block-item-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" title="Changer le gabarit" onClick={() => setChangeTypeFor(block.id)}>
                  <LayoutTemplate size={13} />
                </button>
                <button type="button" title="Dupliquer" onClick={() => duplicate(block)}><Copy size={13} /></button>
                <button type="button" title="Supprimer" className="danger" onClick={() => setConfirmDelete(block.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {isOpen && def && (
              <div className="block-item-body">
                <BlockPreview type={block.type} props={block.props} data={data} />
                <FieldRenderer
                  schema={def.schema}
                  value={block.props}
                  onChange={(props) => updateProps(block.id, props)}
                />
              </div>
            )}
          </div>
        );
      })}

      <button type="button" className="repeat-add block-add" onClick={() => setAddOpen(true)}>
        <Plus size={15} /> Ajouter une section (choisir un gabarit)
      </button>

      {addOpen && (
        <AddBlockModal
          data={data}
          onAdd={(type) => {
            const block = newBlock(type);
            onChange([...blocks, block]);
            setOpen((prev) => ({ ...prev, [block.id]: true }));
            setAddOpen(false);
          }}
          onClose={() => setAddOpen(false)}
        />
      )}

      {changeTypeFor && (
        <AddBlockModal
          data={data}
          replaceType={blocks.find((b) => b.id === changeTypeFor)?.type}
          onAdd={(type) => changeType(changeTypeFor, type)}
          onClose={() => setChangeTypeFor(null)}
        />
      )}

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Supprimer ce bloc ?</h3>
            <p className="admin-modal-sub">Son contenu sera perdu à la prochaine publication.</p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button type="button" className="admin-btn-danger" onClick={() => remove(confirmDelete)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
