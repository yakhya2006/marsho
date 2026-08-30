import React from 'react';
import { LinkableImage, Buttons } from './common';
import { parseLines } from '../config/helpers';

// Texte simple → paragraphes (une ligne vide = nouveau paragraphe).
// Si le contenu contient encore du HTML (anciens contenus), on le rend tel quel.
export function Paragraphs({ text }) {
  if (!text) return null;
  if (/<[a-z][^>]*>/i.test(text)) {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return (
    <>
      {String(text)
        .split(/\n\s*\n/)
        .filter((par) => par.trim())
        .map((par, i) => (
          <p key={i} style={{ whiteSpace: 'pre-line' }}>{par.trim()}</p>
        ))}
    </>
  );
}

// Bloc "texte" : titre + paragraphes + liste à puces optionnelle
export function TexteBlock({ props: p }) {
  const puces = parseLines(p.puces);
  return (
    <div className="container" id={p.anchor || undefined}>
      <section className="about-section reveal visible">
        {p.titre && <h2>{p.titre}</h2>}
        <Paragraphs text={p.corps} />
        {puces.length > 0 && (
          <ul className="about-list">
            {puces.map((li, i) => <li key={i}>{li}</li>)}
          </ul>
        )}
        <Buttons boutons={p.boutons} className="block-buttons" />
      </section>
    </div>
  );
}

// Bloc "colonnes" : encadrés de texte côte à côte (sans HTML)
export function ColonnesBlock({ props: p }) {
  return (
    <div className="container" id={p.anchor || undefined}>
      <section className="about-section reveal visible">
        {p.titre && <h2>{p.titre}</h2>}
        <Paragraphs text={p.intro} />
        <div className="about-terrains">
          {(p.colonnes || []).map((col) => (
            <div key={col.id} className="about-terrain">
              <h3>{col.titre}</h3>
              {col.sous_titre && <p><strong>{col.sous_titre}</strong></p>}
              <Paragraphs text={col.texte} />
            </div>
          ))}
        </div>
        <Buttons boutons={p.boutons} className="block-buttons" />
      </section>
    </div>
  );
}

// Bloc "html" : HTML brut (tableaux complexes…)
export function HtmlBlock({ props: p }) {
  return (
    <div className="container" id={p.anchor || undefined}>
      <section className="about-section reveal visible">
        {p.titre && <h2>{p.titre}</h2>}
        <div dangerouslySetInnerHTML={{ __html: p.corps }} />
        <Buttons boutons={p.boutons} className="block-buttons" />
      </section>
    </div>
  );
}

// Bloc "apropos" : texte + image latérale avec badge + valeurs
export function AProposBlock({ props: p }) {
  return (
    <section className="section section--dark" id={p.anchor || undefined}>
      <div className="container">
        <div className="about-grid">
          <div className="about-content reveal visible">
            {p.tag && <span className="section-tag">{p.tag}</span>}
            {p.titre && <h2 className="section-title">{p.titre}</h2>}
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <Paragraphs text={p.corps} />
            </div>
            <Buttons boutons={p.boutons} className="hero-actions" />
          </div>
          <div className="about-right reveal visible">
            {p.image?.src && (
              <div className="about-image">
                <LinkableImage image={p.image} alt={p.titre} />
                {p.image_badge && (
                  /<[a-z][^>]*>/i.test(p.image_badge)
                    ? <div className="about-img-badge" dangerouslySetInnerHTML={{ __html: p.image_badge }} />
                    : (
                      <div className="about-img-badge">
                        {parseLines(p.image_badge).map((line, i) => (
                          <React.Fragment key={i}>
                            {i === 0 ? <strong>{line}</strong> : <><br />{line}</>}
                          </React.Fragment>
                        ))}
                      </div>
                    )
                )}
              </div>
            )}
            {(p.valeurs || []).length > 0 && (
              <div className="about-values">
                {p.valeurs.map((v) => (
                  <div key={v.id} className="value-item">
                    <span className="value-icon">{v.icon}</span>
                    <div>
                      <strong>{v.titre}</strong>
                      <p>{v.texte}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Bloc "icones" : grille de cartes icône + titre + texte
export function IconesBlock({ props: p }) {
  return (
    <div className="container" id={p.anchor || undefined}>
      <section className="activity-detail reveal visible">
        {p.titre && <h2>{p.titre}</h2>}
        <div className="activity-info-grid">
          {(p.items || []).map((it) => (
            <div key={it.id} className="activity-info-card">
              <strong>{it.titre}</strong>
              <p>{it.texte}</p>
            </div>
          ))}
        </div>
        <Buttons boutons={p.boutons} className="block-buttons" />
      </section>
    </div>
  );
}
