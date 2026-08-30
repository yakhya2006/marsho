import React from 'react';
import { Buttons } from './common';

// Bloc "boutons" : rangée de boutons centrés
export function BoutonsBlock({ props: p }) {
  return (
    <div className="container" id={p.anchor || undefined} style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
      <Buttons boutons={p.boutons} className="hero-actions" />
    </div>
  );
}

// Bloc "cta" : encadré appel à l'action
export function CtaBlock({ props: p }) {
  return (
    <div className="container" id={p.anchor || undefined}>
      <div className="activity-cta reveal visible">
        <h2>{p.titre}</h2>
        <Buttons boutons={p.boutons} className="activity-cta-actions" />
      </div>
    </div>
  );
}

const TAILLES = { petit: '2rem', moyen: '4rem', grand: '8rem' };

// Bloc "separateur" : espace vertical
export function SeparateurBlock({ props: p }) {
  return <div style={{ height: TAILLES[p.taille] || TAILLES.moyen }} aria-hidden="true" />;
}
