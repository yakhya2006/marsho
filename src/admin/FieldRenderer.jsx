import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus, ArrowUp, ArrowDown, ImagePlus, Link2 } from 'lucide-react';
import MediaPicker from './MediaPicker';
import { uid } from '../config/helpers';
import { BUTTON_STYLES } from '../config/blocks';

// =============================================================
// Formulaire générique piloté par le schéma d'un bloc.
// <FieldRenderer schema={...} value={props} onChange={(next) => ...} />
// =============================================================

function Field({ field, value, onChange }) {
  switch (field.type) {
    case 'text':
    case 'date':
      return (
        <div className="admin-field">
          <label className="admin-label">{field.label}</label>
          <input
            className="admin-input"
            type={field.type}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="admin-field">
          <label className="admin-label">{field.label}</label>
          <textarea
            className="admin-textarea"
            rows={3}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'simpletext':
      return (
        <div className="admin-field">
          <label className="admin-label">{field.label}</label>
          <textarea
            className="admin-textarea"
            rows={6}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'richtext':
      return (
        <div className="admin-field">
          <label className="admin-label">{field.label}</label>
          <textarea
            className="admin-textarea admin-textarea--code"
            rows={8}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'checkbox':
      return (
        <div className="admin-field admin-field--checkbox">
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
            {field.label}
          </label>
        </div>
      );

    case 'select':
      return (
        <div className="admin-field">
          <label className="admin-label">{field.label}</label>
          <select className="admin-select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );

    case 'image':
      return <ImageField field={field} value={value} onChange={onChange} />;

    case 'buttons':
      return <ButtonsField field={field} value={value} onChange={onChange} />;

    case 'list':
      return <ListField field={field} value={value} onChange={onChange} />;

    default:
      return null;
  }
}

// Champ image { src, lien } : vignette + sélection médiathèque + lien optionnel
function ImageField({ field, value, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const img = value || { src: '', lien: '' };

  return (
    <div className="admin-field">
      <label className="admin-label">{field.label}</label>
      <div className="image-field">
        <button type="button" className="image-field-thumb" onClick={() => setPickerOpen(true)} title="Choisir une image">
          {img.src ? <img src={img.src} alt="" /> : <ImagePlus size={20} />}
        </button>
        <div className="image-field-body">
          <div className="image-field-row">
            <button type="button" className="admin-btn-ghost" onClick={() => setPickerOpen(true)}>
              {img.src ? "Changer l'image" : 'Choisir dans la médiathèque'}
            </button>
            {img.src && (
              <button type="button" className="admin-btn-ghost danger" onClick={() => onChange({ ...img, src: '' })}>
                Retirer
              </button>
            )}
          </div>
          {!field.noLink && (
            <div className="image-field-link">
              <Link2 size={13} />
              <input
                className="admin-input"
                placeholder="Lien (optionnel) — l'image devient un bouton cliquable"
                value={img.lien || ''}
                onChange={(e) => onChange({ ...img, lien: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker
          onPick={(url) => { onChange({ ...img, src: url }); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

// Liste de boutons { label, href, style }
function ButtonsField({ field, value, onChange }) {
  const boutons = value || [];
  const update = (i, patch) => onChange(boutons.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const move = (i, delta) => {
    const j = i + delta;
    if (j < 0 || j >= boutons.length) return;
    const copy = [...boutons];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="admin-field">
      <label className="admin-label">{field.label}</label>
      {boutons.map((b, i) => (
        <div key={b.id || i} className="button-row">
          <input
            className="admin-input"
            placeholder="Texte du bouton"
            value={b.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <input
            className="admin-input"
            placeholder="Lien (/page, #ancre ou https://…)"
            value={b.href}
            onChange={(e) => update(i, { href: e.target.value })}
          />
          <select className="admin-select" value={b.style} onChange={(e) => update(i, { style: e.target.value })}>
            {BUTTON_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="button-row-actions">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Monter"><ArrowUp size={13} /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === boutons.length - 1} title="Descendre"><ArrowDown size={13} /></button>
            <button type="button" className="danger" onClick={() => onChange(boutons.filter((_, j) => j !== i))} title="Supprimer">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="repeat-add"
        onClick={() => onChange([...boutons, { id: uid('btn'), label: 'Bouton', href: '/', style: 'primary' }])}
      >
        <Plus size={14} /> Ajouter un bouton
      </button>
    </div>
  );
}

// Liste répétable d'objets (cartes, articles, sessions…)
function ListField({ field, value, onChange }) {
  const items = value || [];
  const [open, setOpen] = useState({});
  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const update = (i, key, v) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  const move = (i, delta) => {
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = () => {
    const item = field.newItem();
    onChange([...items, item]);
    setOpen((prev) => ({ ...prev, [item.id]: true }));
  };

  const itemTitle = (it) => it.titre || it.nom || it.label || it.valeur || field.itemLabel;

  return (
    <div className="admin-field">
      <label className="admin-label">{field.label}</label>
      {items.map((it, i) => {
        const isOpen = !!open[it.id];
        return (
          <div key={it.id || i} className="repeat-item">
            <div className="repeat-item-head" onClick={() => toggle(it.id)}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="repeat-item-title">{itemTitle(it)}</span>
              <div className="repeat-item-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Monter"><ArrowUp size={13} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Descendre"><ArrowDown size={13} /></button>
                <button type="button" className="danger" onClick={() => onChange(items.filter((_, j) => j !== i))} title="Supprimer">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="repeat-item-body">
                {field.fields.map((sub) => (
                  <Field key={sub.key} field={sub} value={it[sub.key]} onChange={(v) => update(i, sub.key, v)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="repeat-add" onClick={add}>
        <Plus size={14} /> Ajouter : {field.itemLabel}
      </button>
    </div>
  );
}

export default function FieldRenderer({ schema, value, onChange }) {
  const normal = schema.filter((f) => !f.advanced);
  const advanced = schema.filter((f) => f.advanced);

  const renderField = (field) => (
    <Field
      key={field.key}
      field={field}
      value={value?.[field.key]}
      onChange={(v) => onChange({ ...value, [field.key]: v })}
    />
  );

  return (
    <>
      {normal.map(renderField)}
      {advanced.length > 0 && (
        <details className="admin-advanced">
          <summary>⚙ Options avancées (rarement utile)</summary>
          <div className="admin-advanced-body">{advanced.map(renderField)}</div>
        </details>
      )}
    </>
  );
}
