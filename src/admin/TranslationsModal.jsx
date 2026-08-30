import React, { useMemo, useState } from 'react';
import { Languages, Sparkles, X } from 'lucide-react';
import { OTHER_LANGS, collectStrings } from '../config/i18n';
import { getToken } from '../config/api';
import { BLOCKS } from '../config/blocks';

// Modal « Traductions » d'une page : pour chaque langue (onglets),
// chaque champ texte du contenu français est listé avec un champ de
// saisie — remplissage manuel, ou automatique via /api/translate.
export default function TranslationsModal({ page, onSave, onClose, onToast }) {
  const [lang, setLang] = useState(OTHER_LANGS[0].code);
  const [i18n, setI18n] = useState(() => JSON.parse(JSON.stringify(page.i18n || {})));
  const [busy, setBusy] = useState(false);

  // Champs traduisibles de la page : titre + champs de chaque bloc
  const fields = useMemo(() => {
    const out = [{ blockId: '__page', path: '__title', label: 'Titre de la page', value: page.title }];
    for (const block of page.blocks || []) {
      const def = BLOCKS[block.type];
      for (const { path, value } of collectStrings(block.props)) {
        out.push({ blockId: block.id, path, label: def?.label || block.type, value });
      }
    }
    return out;
  }, [page]);

  const getVal = (f) =>
    f.blockId === '__page'
      ? i18n[lang]?.__title || ''
      : i18n[lang]?.[f.blockId]?.[f.path] || '';

  const setVal = (f, value) => {
    setI18n((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[lang] = next[lang] || {};
      if (f.blockId === '__page') {
        next[lang].__title = value;
      } else {
        next[lang][f.blockId] = next[lang][f.blockId] || {};
        next[lang][f.blockId][f.path] = value;
      }
      return next;
    });
  };

  const filled = fields.filter((f) => getVal(f).trim()).length;

  const autoTranslate = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ texts: fields.map((f) => f.value), target: lang }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Échec de la traduction');
      setI18n((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        next[lang] = next[lang] || {};
        fields.forEach((f, i) => {
          const t = body.translations[i];
          if (!t) return;
          if (f.blockId === '__page') next[lang].__title = t;
          else {
            next[lang][f.blockId] = next[lang][f.blockId] || {};
            next[lang][f.blockId][f.path] = t;
          }
        });
        return next;
      });
      onToast(`✓ ${fields.length} champs traduits (${body.provider === 'ia' ? 'IA' : 'Google Traduction'}) — relisez avant de publier`);
    } catch (err) {
      onToast('Traduction automatique impossible : ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal translations-modal" onClick={(e) => e.stopPropagation()}>
        <div className="media-picker-head">
          <h3><Languages size={16} style={{ verticalAlign: '-3px' }} /> Traductions — {page.title}</h3>
          <button type="button" className="admin-btn-ghost" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>

        <div className="translations-tabs">
          {OTHER_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`translations-tab ${l.code === lang ? 'active' : ''}`}
              onClick={() => setLang(l.code)}
            >
              <span className="lang-option-flag"><l.Flag /></span> {l.label}
            </button>
          ))}
        </div>

        <div className="translations-toolbar">
          <span className="translations-count">{filled}/{fields.length} champs remplis</span>
          <button type="button" className="admin-btn-primary" disabled={busy} onClick={autoTranslate}>
            <Sparkles size={14} /> {busy ? 'Traduction en cours…' : 'Tout traduire automatiquement'}
          </button>
        </div>

        <div className="translations-list">
          {fields.map((f) => (
            <div key={`${f.blockId}:${f.path}`} className="translation-row">
              <div className="translation-src">
                <span className="translation-block">{f.label}</span>
                <p>{f.value}</p>
              </div>
              {f.value.length > 80 ? (
                <textarea
                  className="admin-textarea"
                  rows={Math.min(6, Math.ceil(f.value.length / 70))}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  value={getVal(f)}
                  placeholder="Traduction…"
                  onChange={(e) => setVal(f, e.target.value)}
                />
              ) : (
                <input
                  className="admin-input"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  value={getVal(f)}
                  placeholder="Traduction…"
                  onChange={(e) => setVal(f, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn-ghost" disabled={busy} onClick={onClose}>Annuler</button>
          <button type="button" className="admin-btn-primary" disabled={busy} onClick={() => onSave(i18n)}>
            Enregistrer les traductions
          </button>
        </div>
      </div>
    </div>
  );
}
