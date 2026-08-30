import React from 'react';
import { Buttons, SectionHeader } from './common';

// Bloc "hero" : grand bandeau plein écran + chiffres clés
export function HeroBlock({ props: p }) {
  return (
    <section className="hero" id={p.anchor || undefined}>
      <div className="hero-bg">
        {p.image?.src && <img src={p.image.src} alt="" className="hero-img" />}
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        {p.badge && <div className="hero-badge reveal visible">{p.badge}</div>}
        <h1 className="hero-title reveal visible">
          {p.titre_1 && <span className="title-line">{p.titre_1}</span>}
          {p.titre_2 && <span className="title-line accent">{p.titre_2}</span>}
          {p.titre_3 && <span className="title-line">{p.titre_3}</span>}
        </h1>
        {p.desc && <p className="hero-desc reveal visible" style={{ whiteSpace: 'pre-line' }}>{p.desc}</p>}
        <Buttons boutons={p.boutons} className="hero-actions reveal visible" />
      </div>

      {(p.stats || []).length > 0 && (
        <div className="hero-stats">
          {p.stats.map((s) => (
            <div key={s.id} className="stat-item">
              <span className="stat-number">{s.valeur}</span>
              <span className="stat-unit">{s.unite}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Bloc "activite_hero" : bandeau visuel d'activité
export function ActiviteHeroBlock({ props: p }) {
  return (
    <div className="activity-hero">
      {p.image?.src && <img src={p.image.src} alt={p.titre} className="activity-hero-img" />}
      <div className="activity-hero-overlay"></div>
      <div className="activity-hero-content">
        <h1>{p.titre}</h1>
        {p.intro && <p>{p.intro}</p>}
      </div>
    </div>
  );
}

// Bloc "titre_page" : haut de page simple
export function TitrePageBlock({ props: p, isFirst }) {
  return (
    <div className="container">
      <div
        className="section-header"
        style={isFirst ? { paddingTop: 'calc(var(--nav-height) + var(--banner-height, 0px) + 2rem)' } : undefined}
      >
        {p.tag && <span className="section-tag">{p.tag}</span>}
        <h1 className="section-title">{p.titre}</h1>
        {p.desc && <p className="section-desc">{p.desc}</p>}
      </div>
    </div>
  );
}
