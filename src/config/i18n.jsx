// =============================================================
// i18n — 4 langues : français (référence), russe, anglais, arabe.
//
// Principe : le contenu est rédigé en français dans les blocs.
// Les traductions sont stockées EN SURCOUCHE, uniquement pour les
// champs textuels : page.i18n[lang][blockId][cheminDuChamp] = texte.
// Au rendu, on clone les props du bloc et on réinjecte les textes
// de la langue active — structure, images et liens restent uniques.
// =============================================================
import React, { createContext, useContext, useEffect, useState } from 'react';

export const DEFAULT_LANG = 'fr';

const FlagFR = () => (
  <svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="#fff"/><path d="M0 15a15 15 0 0 1 10-14.1v28.2A15 15 0 0 1 0 15z" fill="#0055A4"/><path d="M30 15A15 15 0 0 1 20 29.1V0.9A15 15 0 0 1 30 15z" fill="#EF4135"/></svg>
);
const FlagRU = () => (
  <svg viewBox="0 0 30 30" aria-hidden="true"><clipPath id="cr"><circle cx="15" cy="15" r="15"/></clipPath><g clipPath="url(#cr)"><rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#0039A6"/><rect y="20" width="30" height="10" fill="#D52B1E"/></g></svg>
);
const FlagEN = () => (
  <svg viewBox="0 0 30 30" aria-hidden="true"><clipPath id="ce"><circle cx="15" cy="15" r="15"/></clipPath><g clipPath="url(#ce)"><rect width="30" height="30" fill="#012169"/><path d="M0 0l30 30M30 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l30 30M30 0L0 30" stroke="#C8102E" strokeWidth="2.5"/><path d="M15 0v30M0 15h30" stroke="#fff" strokeWidth="10"/><path d="M15 0v30M0 15h30" stroke="#C8102E" strokeWidth="6"/></g></svg>
);
const FlagAR = () => (
  <svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="#006C35"/><text x="15" y="19.5" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="serif">ع</text></svg>
);

export const LANGS = [
  { code: 'fr', label: 'Français', Flag: FlagFR, dir: 'ltr' },
  { code: 'ru', label: 'Русский', Flag: FlagRU, dir: 'ltr' },
  { code: 'en', label: 'English', Flag: FlagEN, dir: 'ltr' },
  { code: 'ar', label: 'العربية', Flag: FlagAR, dir: 'rtl' },
];

export const OTHER_LANGS = LANGS.filter((l) => l.code !== DEFAULT_LANG);

// Clés de props considérées comme du texte à traduire.
// Tout le reste (src, lien, href, anchor, date, icon, x/y, style…) est partagé.
export const TRANSLATABLE_KEYS = new Set([
  'titre', 'titre_1', 'titre_2', 'titre_3', 'sous_titre', 'texte', 'desc',
  'corps', 'intro', 'label', 'tag', 'badge', 'contenu', 'nom', 'puces',
  'note', 'lieu', 'description', 'lien_label', 'image_badge', 'lignes',
]);

// Parcourt récursivement des props et liste les champs traduisibles :
// [{ path: 'cartes.0.titre', value: 'Club de Lutte' }]
export const collectStrings = (obj, prefix = '') => {
  const out = [];
  if (!obj || typeof obj !== 'object') return out;
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      if (TRANSLATABLE_KEYS.has(key) && val.trim()) out.push({ path, value: val });
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => out.push(...collectStrings(item, `${path}.${i}`)));
    } else if (val && typeof val === 'object') {
      out.push(...collectStrings(val, path));
    }
  }
  return out;
};

// Clone les props en réinjectant les textes traduits { path: texte }
export const applyStrings = (props, overrides) => {
  if (!overrides || !Object.keys(overrides).length) return props;
  const clone = JSON.parse(JSON.stringify(props));
  for (const [path, value] of Object.entries(overrides)) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const parts = path.split('.');
    let node = clone;
    for (let i = 0; i < parts.length - 1 && node; i++) node = node[parts[i]];
    if (node && typeof node === 'object') node[parts[parts.length - 1]] = value;
  }
  return clone;
};

// Page localisée : blocs avec textes traduits + titre de page
export const localizePage = (page, lang) => {
  if (!page || lang === DEFAULT_LANG) return page;
  const layer = page.i18n?.[lang];
  if (!layer) return page;
  return {
    ...page,
    title: layer.__title || page.title,
    blocks: (page.blocks || []).map((b) =>
      layer[b.id] ? { ...b, props: applyStrings(b.props, layer[b.id]) } : b
    ),
  };
};

// Réglages localisés (slogan, pied de page, bandeau)
export const localizeSettings = (settings, lang) => {
  if (!settings || lang === DEFAULT_LANG) return settings;
  const layer = settings.i18n?.[lang];
  if (!layer) return settings;
  return {
    ...settings,
    tagline: layer.tagline || settings.tagline,
    footer_tagline: layer.footer_tagline || settings.footer_tagline,
    footer_desc: layer.footer_desc || settings.footer_desc,
    bandeau: { ...settings.bandeau, message: layer.bandeau_message || settings.bandeau?.message },
  };
};

export const navLabel = (item, lang) =>
  (lang !== DEFAULT_LANG && item.i18n?.[lang]) || item.label;

// Données complètes localisées (navigation + settings + pages)
export const localizeData = (data, lang) => {
  if (!data || lang === DEFAULT_LANG) return data;
  // Un item de menu sans traduction propre hérite du titre traduit de sa page
  const pageTitle = (pageId) => {
    const page = (data.pages || []).find((p) => p.id === pageId);
    return page?.i18n?.[lang]?.__title;
  };
  const mapNav = (items) => items.map((it) => ({
    ...it,
    label: it.i18n?.[lang] || (it.pageId && pageTitle(it.pageId)) || it.label,
    children: it.children ? mapNav(it.children) : it.children,
  }));
  return {
    ...data,
    settings: localizeSettings(data.settings, lang),
    navigation: mapNav(data.navigation || []),
    pages: (data.pages || []).map((p) => localizePage(p, lang)),
  };
};

// ---- Contexte React ----

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('marsho_lang');
    return LANGS.some((l) => l.code === saved) ? saved : DEFAULT_LANG;
  });

  const setLang = (code) => {
    setLangState(code);
    localStorage.setItem('marsho_lang', code);
  };

  useEffect(() => {
    const def = LANGS.find((l) => l.code === lang) || LANGS[0];
    document.documentElement.lang = lang;
    document.documentElement.dir = def.dir;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
