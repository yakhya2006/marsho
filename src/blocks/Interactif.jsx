import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, LinkableImage, Buttons } from './common';
import { CAT_LABELS, collectSessions, pathForPage } from '../config/helpers';

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MOIS_COURTS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function SessionCard({ session }) {
  const [, m, d] = String(session.date || '').split('-').map(Number);
  const horaire = session.heure_debut
    ? `🕗 ${session.heure_debut}${session.heure_fin ? '–' + session.heure_fin : ''}`
    : '';

  return (
    <div className="session-card reveal visible" data-type={session.categorie}>
      {session.image?.src && (
        <div className="session-img">
          <LinkableImage image={session.image} alt={session.nom} />
        </div>
      )}
      <div className="session-date">
        <span className="session-day">{pad(d || 1)}</span>
        <span className="session-month">{MOIS_COURTS[(m || 1) - 1]}</span>
      </div>
      <div className="session-info">
        <div className="session-main">
          <span className={`session-type ${session.categorie}`}>{CAT_LABELS[session.categorie] || session.categorie}</span>
          <h3 className="session-name">{session.nom}</h3>
          <p className="session-details">
            {session.lieu && <>📍 {session.lieu}{horaire ? ' · ' : ''}</>}
            {horaire}
          </p>
        </div>
        {session.description && (
          <p className="session-desc" style={{ whiteSpace: 'pre-line' }}>{session.description}</p>
        )}
      </div>
      <div className="session-action">
        {session.lien_helloasso ? (
          <a href={session.lien_helloasso} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
            Réserver sur HelloAsso →
          </a>
        ) : (
          <span className="session-spots spots-ok">Bientôt disponible</span>
        )}
      </div>
    </div>
  );
}

// Bloc "sessions_calendrier" : agenda complet (liste + calendrier)
export function SessionsCalendrierBlock({ props: p, isFirst }) {
  const sessions = p.sessions || [];
  const [view, setView] = useState('calendar');
  const [filtre, setFiltre] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);

  const byDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!s.date) return;
      (map[s.date] = map[s.date] || []).push(s);
    });
    return map;
  }, [sessions]);

  const [current, setCurrent] = useState(() => {
    const sorted = Object.keys(byDate).sort();
    if (sorted.length) {
      const [y, m] = sorted[0].split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = filtre === 'all' ? sessions : sessions.filter((s) => s.categorie === filtre);
  const sorted = [...filtered].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const usedCats = [...new Set(sessions.map((s) => s.categorie))];

  const changeMonth = (delta) => {
    setCurrent((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  const year = current.getFullYear();
  const month = current.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedSessions = selectedDate ? byDate[selectedDate] || [] : [];
  const selectedLabel = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      })()
    : '';

  return (
    <section
      className="section"
      style={isFirst ? { paddingTop: 'calc(var(--nav-height) + var(--banner-height, 0px) + 3rem)' } : undefined}
    >
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} h1={isFirst} />

        <div className="sessions-view-toggle reveal visible">
          <button type="button" className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
            ☰ Liste
          </button>
          <button type="button" className={`view-toggle-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
            📅 Calendrier
          </button>
        </div>

        {view === 'list' ? (
          <div>
            <div className="sessions-filters reveal visible">
              <button type="button" className={`filter-btn ${filtre === 'all' ? 'active' : ''}`} onClick={() => setFiltre('all')}>
                Toutes
              </button>
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <button key={key} type="button" className={`filter-btn ${filtre === key ? 'active' : ''}`} onClick={() => setFiltre(key)}>
                  {label}
                </button>
              ))}
            </div>

            {sorted.length > 0 ? (
              <div className="sessions-list">
                {sorted.map((s) => <SessionCard key={s.id} session={s} />)}
              </div>
            ) : (
              <div className="sessions-empty reveal visible">
                <p>Aucune session prévue pour le moment. Revenez bientôt !</p>
              </div>
            )}
          </div>
        ) : (
          <div className="sessions-calendar-view">
            <div className="calendar-legend">
              {usedCats.map((cat) => (
                <span key={cat} className="cal-legend-item">
                  <span className={`cal-dot cal-dot--${cat}`}></span>
                  {CAT_LABELS[cat] || cat}
                </span>
              ))}
            </div>
            <div className={`calendar-layout ${selectedDate ? 'has-selection' : ''}`}>
              <div className="calendar-day-panel">
                {selectedDate ? (
                  selectedSessions.length ? (
                    <>
                      <h3 className="calendar-day-title">{selectedLabel}</h3>
                      <div className="sessions-list">
                        {selectedSessions.map((s) => <SessionCard key={s.id} session={s} />)}
                      </div>
                    </>
                  ) : (
                    <p className="calendar-day-placeholder">Aucune session ce jour-là.</p>
                  )
                ) : (
                  <p className="calendar-day-placeholder">Cliquez sur une date pour voir les sessions du jour.</p>
                )}
              </div>
              <div className="calendar-wrapper">
                <div className="calendar">
                  <div className="calendar-header">
                    <button type="button" className="cal-nav" onClick={() => changeMonth(-1)} aria-label="Mois précédent">‹</button>
                    <span className="cal-month">{MOIS[month]} {year}</span>
                    <button type="button" className="cal-nav" onClick={() => changeMonth(1)} aria-label="Mois suivant">›</button>
                  </div>
                  <div className="calendar-weekdays">
                    <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                  </div>
                  <div className="calendar-days">
                    {Array.from({ length: startOffset }).map((_, i) => (
                      <div key={`e${i}`} className="cal-day cal-day--empty"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const d = i + 1;
                      const key = dateKey(year, month, d);
                      const daySessions = byDate[key] || [];
                      const cellDate = new Date(year, month, d);
                      const classes = ['cal-day'];
                      if (cellDate.getTime() === today.getTime()) classes.push('cal-day--today');
                      if (cellDate < today) classes.push('cal-day--past');
                      if (key === selectedDate) classes.push('cal-day--selected');
                      if (daySessions.length) classes.push('cal-day--has-sessions');

                      return (
                        <button
                          key={key}
                          type="button"
                          className={classes.join(' ')}
                          disabled={!daySessions.length}
                          onClick={() => setSelectedDate(key)}
                        >
                          <span className="cal-day-num">{d}</span>
                          {daySessions.length > 0 && (
                            <span className="cal-day-dots">
                              {[...new Set(daySessions.map((s) => s.categorie))].slice(0, 4).map((cat) => (
                                <span key={cat} className={`cal-dot cal-dot--${cat}`}></span>
                              ))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Bloc "sessions_apercu" : les prochaines sessions de l'agenda du site
export function SessionsApercuBlock({ props: p, data }) {
  const [filtre, setFiltre] = useState('all');
  const { sessions, page } = collectSessions(data);
  const sorted = [...sessions].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const types = ['all', ...new Set(sorted.map((s) => s.categorie))];
  const nb = parseInt(p.nb, 10) || 6;

  return (
    <section className="section" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />

        <div className="sessions-filters reveal visible">
          {types.map((f) => (
            <button key={f} className={`filter-btn ${filtre === f ? 'active' : ''}`} onClick={() => setFiltre(f)}>
              {f === 'all' ? 'Toutes' : CAT_LABELS[f] || f}
            </button>
          ))}
        </div>

        <div className="sessions-list">
          {sorted
            .filter((s) => filtre === 'all' || s.categorie === filtre)
            .slice(0, nb)
            .map((ses) => {
              const [, m, d] = String(ses.date || '').split('-').map(Number);
              const horaire = ses.heure_debut
                ? `🕗 ${ses.heure_debut}${ses.heure_fin ? '–' + ses.heure_fin : ''}`
                : '';
              return (
                <div key={ses.id} className="session-card reveal visible" data-type={ses.categorie}>
                  <div className="session-date">
                    <span className="session-day">{pad(d || 1)}</span>
                    <span className="session-month">{MOIS_COURTS[(m || 1) - 1]}</span>
                  </div>
                  <div className="session-info">
                    <span className={`session-type ${ses.categorie}`}>{CAT_LABELS[ses.categorie] || ses.categorie}</span>
                    <h3 className="session-name">{ses.nom}</h3>
                    <p className="session-details">
                      {ses.lieu && <>📍 {ses.lieu}{horaire ? ' · ' : ''}</>}
                      {horaire}
                    </p>
                  </div>
                  <div className="session-action">
                    {ses.lien_helloasso ? (
                      <a href={ses.lien_helloasso} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Réserver →</a>
                    ) : (
                      <span className="session-spots spots-ok">Bientôt dispo</span>
                    )}
                  </div>
                </div>
              );
            })}
          {sorted.length === 0 && (
            <p className="sessions-empty">Aucune session prévue pour le moment — revenez bientôt !</p>
          )}
        </div>

        {page && (
          <div className="sessions-cta reveal visible">
            <p>Voir toutes les sessions disponibles et réservez votre place.</p>
            <Link to={pathForPage(page)} className="btn btn-outline">Voir toutes les sessions</Link>
          </div>
        )}
      </div>
    </section>
  );
}

// Bloc "carte_points" : carte interactive à points cliquables
export function CartePointsBlock({ props: p }) {
  const [activePoint, setActivePoint] = useState(null);
  if (!p.image?.src) return null;

  return (
    <div className="container" id={p.anchor || undefined}>
      <section className="about-section reveal visible" style={{ maxWidth: '1000px' }}>
        <div className="terrain-map-wrap">
          <img src={p.image.src} alt="Carte" className="terrain-map-img" />
          {(p.points || []).map((pt) => (
            <button
              key={pt.id}
              type="button"
              className="terrain-point"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              aria-label={pt.label}
              onClick={() => setActivePoint(pt)}
            >
              <span className="terrain-point-dot"></span>
            </button>
          ))}

          {activePoint && (
            <div className="terrain-popup visible" style={{ display: 'block' }}>
              <button type="button" className="terrain-popup-close" aria-label="Fermer" onClick={() => setActivePoint(null)}>
                ×
              </button>
              {activePoint.image?.src && (
                <img src={activePoint.image.src} alt={activePoint.label} className="terrain-popup-img" />
              )}
              <div className="terrain-popup-body">
                <strong>{activePoint.label}</strong>
                <p>{activePoint.desc}</p>
              </div>
            </div>
          )}
        </div>
        {p.note && (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            {p.note}
          </p>
        )}
        <Buttons boutons={p.boutons} className="block-buttons" />
      </section>
    </div>
  );
}

// Bloc "contact" : formulaire + coordonnées (paramètres du site)
export function ContactBlock({ props: p, data }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const contact = data?.settings?.contact_info || {};

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      e.target.reset();
    }, 5000);
  };

  return (
    <section className="section reservation-section section--dark" id={p.anchor || undefined}>
      <div className="container">
        <SectionHeader tag={p.tag} titre={p.titre} desc={p.desc} />

        <div className="form-grid">
          <form className="reservation-form reveal visible" onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input type="text" id="prenom" name="prenom" placeholder="Votre prénom" required />
              </div>
              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input type="text" id="nom" name="nom" placeholder="Votre nom" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" placeholder="votre@email.fr" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input type="tel" id="phone" name="phone" placeholder="06 xx xx xx xx" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message / Précisions</label>
              <textarea id="message" name="message" rows="4" placeholder="Précisez vos souhaits, disponibilités, questions…"></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-full">Envoyer ma demande</button>

            {formSubmitted && (
              <div className="form-success" style={{ display: 'block' }}>
                Votre demande a bien été envoyée ! On vous recontacte sous 48h.
              </div>
            )}
          </form>

          <div className="form-aside reveal visible">
            <div className="contact-card">
              <h3>Infos pratiques</h3>
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <span className="ci-icon">📍</span>
                  <div>
                    <strong>Site principal</strong>
                    <p style={{ whiteSpace: 'pre-line' }}>{contact.adresse}</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <span className="ci-icon">📞</span>
                  <div>
                    <strong>Téléphone</strong>
                    <p>
                      <a href={`tel:${String(contact.tel_1 || '').replace(/\s+/g, '')}`}>{contact.tel_1}</a>
                      <br />
                      <a href={`tel:${String(contact.tel_2 || '').replace(/\s+/g, '')}`}>{contact.tel_2}</a>
                    </p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <span className="ci-icon">✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="map-placeholder">
              <iframe
                src="https://maps.google.com/maps?q=Nantes,France&z=12&output=embed"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                title="Carte — Nantes"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
