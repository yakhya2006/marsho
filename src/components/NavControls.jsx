import React, { useEffect, useRef, useState } from 'react';
import { LANGS, useLang } from '../config/i18n';

// ---- Sélecteur de langue : cercle avec le drapeau de la langue active ----

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-btn"
        aria-label={`Langue : ${current.label}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <current.Flag />
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              className={`lang-option ${l.code === lang ? 'active' : ''}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              <span className="lang-option-flag"><l.Flag /></span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Thème clair/sombre : soleil qui se transforme en lune ----

const THEME_KEY = 'marsho_theme';

export const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? 'is-dark' : ''}`}
      aria-label={dark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {/* Soleil → lune : le disque central se fait « croquer » par un masque
          qui glisse, pendant que les rayons se rétractent en tournant. */}
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <mask id="moon-mask">
          <rect width="24" height="24" fill="#fff" />
          <circle className="tt-mask" cx="30" cy="6" r="7" fill="#000" />
        </mask>
        <circle className="tt-core" cx="12" cy="12" r="5.2" fill="currentColor" mask="url(#moon-mask)" />
        <g className="tt-rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="2.2" x2="12" y2="4.6" />
          <line x1="12" y1="19.4" x2="12" y2="21.8" />
          <line x1="2.2" y1="12" x2="4.6" y2="12" />
          <line x1="19.4" y1="12" x2="21.8" y2="12" />
          <line x1="5.1" y1="5.1" x2="6.8" y2="6.8" />
          <line x1="17.2" y1="17.2" x2="18.9" y2="18.9" />
          <line x1="5.1" y1="18.9" x2="6.8" y2="17.2" />
          <line x1="17.2" y1="6.8" x2="18.9" y2="5.1" />
        </g>
      </svg>
    </button>
  );
}
