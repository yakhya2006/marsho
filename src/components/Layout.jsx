import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { PageRenderer } from '../blocks';
import { useLang, localizeData, localizePage } from '../config/i18n';
import { initEffects3D } from './effects3d';

const SITE_NAME = 'Association Marsho — Nantes';

// SEO : titre + meta description propres à chaque page, et fiche
// « entreprise locale » (JSON-LD) pour le référencement géographique.
function applySeo(data, page) {
  document.title = page.slug === '' ? SITE_NAME : `${page.title} · Association Marsho`;

  const desc =
    (page.blocks || []).map((b) => b.props?.desc || b.props?.intro).find(Boolean) ||
    data.settings?.footer_tagline || '';
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = String(desc).replace(/\s+/g, ' ').slice(0, 160);

  const contact = data.settings?.contact_info || {};
  const [rue = '', villeLigne = ''] = String(contact.adresse || '').split('\n');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    url: window.location.origin,
    telephone: contact.tel_1 || undefined,
    email: contact.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: rue,
      postalCode: (villeLigne.match(/\d{5}/) || [''])[0],
      addressLocality: villeLigne.replace(/\d{5}/, '').trim(),
      addressCountry: 'FR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 47.2184, longitude: -1.5536 },
  };
  let script = document.getElementById('ld-local');
  if (!script) {
    script = document.createElement('script');
    script.id = 'ld-local';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(ld);
}

// Gabarit commun de toutes les pages publiques
export default function Layout({ data, page }) {
  const { lang } = useLang();
  const locData = localizeData(data, lang);
  const locPage = localizePage(page, lang);
  const rootRef = useRef(null);

  useEffect(() => { applySeo(locData, locPage); }, [locData, locPage]);

  // Effets 3D : tilt des cartes + parallax du hero
  useEffect(() => initEffects3D(rootRef.current), [locPage]);

  // Apparition en douceur des sections au défilement.
  // Les blocs sortent du moteur avec la classe `reveal visible` :
  // on retire `visible`, puis l'IntersectionObserver le rend au bon moment.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) {
        el.classList.add('visible'); // déjà à l'écran : pas d'animation retard
      } else {
        el.classList.remove('visible');
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, [locPage, lang]);

  return (
    <div className="avalon-tdj-body" ref={rootRef}>
      <Navbar data={locData} />
      <PageRenderer page={locPage} data={locData} />
      <Footer data={locData} />
    </div>
  );
}
