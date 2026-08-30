import React from 'react';
import { SmartLink, LinkableImage, SectionHeader, Buttons } from './common';
import { parseLines, parsePairs } from '../config/helpers';

// Bloc "activites" : grille de grandes cartes
export function ActivitesBlock({ props: p }) {
  return (
    <section className="section" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />
        <div className="activities-grid">
          {(p.cartes || []).map((act) => (
            <div key={act.id} className={`activity-card ${act.featured ? 'activity-card--featured' : ''} reveal visible`}>
              <div className="activity-img">
                <LinkableImage image={act.image} alt={act.titre} btnLabel="Voir plus →" />
                <div className="activity-overlay"></div>
                {act.badge && <span className={`activity-badge ${act.badgeColor || ''}`}>{act.badge}</span>}
              </div>
              <div className="activity-body">
                <h3 className="activity-title">{act.titre}</h3>
                <p className="activity-desc">{act.texte}</p>
                <ul className="activity-features">
                  {parseLines(act.features).map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
                {act.lien && (
                  <div className="activity-actions">
                    <SmartLink href={act.lien} className="activity-link">Voir plus →</SmartLink>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Buttons boutons={p.boutons} className="block-buttons" />
      </div>
    </section>
  );
}

// Bloc "terrains" : cartes de lieux
export function TerrainsBlock({ props: p }) {
  return (
    <section className="section section--dark" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />
        <div className="terrains-grid">
          {(p.terrains || []).map((ter) => (
            <div key={ter.id} className="terrain-card reveal visible">
              <div className="terrain-img-wrapper">
                <LinkableImage image={ter.image} alt={ter.nom} />
                <div className="terrain-overlay"></div>
              </div>
              <div className="terrain-content">
                {ter.badge && <div className={`terrain-badge ${ter.badgeAlt ? 'terrain-badge--alt' : ''}`}>{ter.badge}</div>}
                <h3 className="terrain-name">{ter.nom}</h3>
                {ter.lieu && <p className="terrain-location">{ter.lieu}</p>}
                <p className="terrain-desc">{ter.texte}</p>
                <div className="terrain-tags">
                  {parseLines(ter.tags).map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Buttons boutons={p.boutons} className="block-buttons" />
      </div>
    </section>
  );
}

// Bloc "galerie"
export function GalerieBlock({ props: p }) {
  return (
    <section className="section" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />
        <div className="gallery-grid reveal visible">
          {(p.images || []).map((item, i) => (
            <div key={item.id || i} className={`gallery-item ${i === 0 ? 'gallery-item--wide' : ''}`}>
              <LinkableImage image={item.image} alt={`${p.titre || 'Galerie'} ${i + 1}`} />
            </div>
          ))}
        </div>
        <Buttons boutons={p.boutons} className="block-buttons" />
      </div>
    </section>
  );
}

// Bloc "tarifs" : grille de colonnes
export function TarifsBlock({ props: p, data }) {
  const paiements = data?.settings?.contact_info?.paiements;
  return (
    <section className="section section--dark" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />
        <div className="tarifs-grid">
          {(p.colonnes || []).map((tar) => (
            <div key={tar.id} className={`tarif-card ${tar.highlight ? 'tarif-card--highlight' : ''} reveal visible`}>
              {tar.badge && <div className="tarif-badge">{tar.badge}</div>}
              <div className="tarif-header">
                <span className="tarif-icon">{tar.icon}</span>
                <h3 className="tarif-name">{tar.nom}</h3>
              </div>
              <div className="tarif-body">
                {parsePairs(tar.lignes).map((row, i) => (
                  <div key={i} className="tarif-row">
                    <span>{row.label}</span>
                    <span className="tarif-price">{row.value}</span>
                  </div>
                ))}
              </div>
              {tar.lien && (
                <SmartLink href={tar.lien} className={`btn ${tar.highlight ? 'btn-primary' : 'btn-outline'} tarif-btn`}>
                  Détails
                </SmartLink>
              )}
            </div>
          ))}
        </div>
        {p.note_paiement && paiements && (
          <div className="payment-info reveal visible">
            <p>💳 Paiement accepté : <strong>{paiements}</strong></p>
          </div>
        )}
        <Buttons boutons={p.boutons} className="block-buttons" />
      </div>
    </section>
  );
}

// Bloc "tarifs_table" : une carte simple de lignes
export function TarifsTableBlock({ props: p }) {
  const rows = parsePairs(p.lignes);
  return (
    <div className="container" id={p.anchor || undefined}>
      <section className="activity-detail reveal visible">
        {p.titre && <h2>{p.titre}</h2>}
        <div className="tarif-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="tarif-body">
            {rows.map((row, i) => (
              <div key={i} className="tarif-row">
                <span>{row.label}</span>
                <span className="tarif-price">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        {p.note && (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{p.note}</p>
        )}
        <Buttons boutons={p.boutons} className="block-buttons" />
      </section>
    </div>
  );
}

// Bloc "logos" : grille de logos partenaires (cliquables si lien)
export function LogosBlock({ props: p }) {
  return (
    <section className="section" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />
        <div className="partners-grid">
          {(p.logos || []).map((lg) => (
            <div key={lg.id} className="partner-card">
              {lg.image?.src ? (
                <LinkableImage image={lg.image} alt={lg.nom} btnLabel="Visiter →" />
              ) : (
                <span className="partner-placeholder">{lg.nom || 'Logo partenaire'}</span>
              )}
            </div>
          ))}
        </div>
        <Buttons boutons={p.boutons} className="block-buttons" />
      </div>
    </section>
  );
}

const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

// Bloc "actualites" : articles datés
export function ActualitesBlock({ props: p, isFirst }) {
  const articles = [...(p.articles || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return (
    <section
      className="section"
      style={isFirst ? { paddingTop: 'calc(var(--nav-height) + var(--banner-height, 0px) + 3rem)' } : undefined}
    >
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} h1={isFirst} />
        {articles.length > 0 ? (
          <div className="actu-list">
            {articles.map((a, i) => (
              <article
                key={a.id}
                className={`actu-row reveal visible${i % 2 === 1 ? ' actu-row--reverse' : ''}${a.image?.src ? '' : ' actu-row--no-image'}`}
              >
                <h2 className="actu-row-title">{a.titre}</h2>
                <div className="actu-row-content">
                  {a.image?.src && (
                    <div className="actu-row-img">
                      <LinkableImage image={a.image} alt={a.titre} />
                    </div>
                  )}
                  <div className="actu-row-text">
                    <span className="actu-date">{formatDate(a.date)}</span>
                    <p className="actu-content" style={{ whiteSpace: 'pre-line' }}>{a.contenu}</p>
                    {a.lien && (
                      <SmartLink href={a.lien} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                        {a.lien_label || 'En savoir plus'} →
                      </SmartLink>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
            Aucune actualité pour le moment.
          </p>
        )}
        <Buttons boutons={p.boutons} className="block-buttons" />
      </div>
    </section>
  );
}
