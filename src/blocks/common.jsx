import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const isVideo = (src) => /\.(mp4|webm|ogv)(\?.*)?$/i.test(String(src || ''));

// Façade vidéo : rien n'est téléchargé tant que le visiteur ne clique pas —
// la page reste légère même avec des vidéos dans le contenu.
export function VideoFacade({ src, label = 'Voir la vidéo' }) {
  const [loaded, setLoaded] = useState(false);
  if (loaded) {
    // preload seulement au clic ; controls natifs du navigateur
    return <video src={src} controls autoPlay playsInline className="video-player" />;
  }
  return (
    <button type="button" className="video-facade" onClick={() => setLoaded(true)}>
      <span className="video-facade-play">▶</span>
      <span className="video-facade-label">{label}</span>
    </button>
  );
}

// Lien intelligent : interne (react-router) ou externe / ancre (balise <a>)
export function SmartLink({ href, className, children, ...rest }) {
  if (!href) return <span className={className}>{children}</span>;
  const isExternal = /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
  if (isExternal) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  if (href.startsWith('#')) {
    return <a href={href} className={className} {...rest}>{children}</a>;
  }
  return <Link to={href} className={className} {...rest}>{children}</Link>;
}

// Image de bloc : { src, lien } — si `lien` est rempli, l'image devient
// cliquable avec un bouton superposé. Une vidéo choisie à la place d'une
// image est affichée en façade (chargée uniquement au clic du visiteur).
export function LinkableImage({ image, alt = '', className, imgClassName, btnLabel = 'Découvrir →', ...rest }) {
  const src = image?.src || '';
  if (!src) return null;
  if (isVideo(src)) {
    return (
      <div className={className}>
        <VideoFacade src={src} />
      </div>
    );
  }
  const imgEl = <img src={src} alt={alt} className={imgClassName} loading="lazy" {...rest} />;
  if (!image?.lien) return className ? <div className={className}>{imgEl}</div> : imgEl;
  return (
    <SmartLink href={image.lien} className={`img-linked ${className || ''}`}>
      {imgEl}
      <span className="img-linked-btn">{btnLabel}</span>
    </SmartLink>
  );
}

// Rangée de boutons [{label, href, style}]
export function Buttons({ boutons, className = 'hero-actions' }) {
  if (!boutons?.length) return null;
  return (
    <div className={className}>
      {boutons.map((b) => (
        <SmartLink key={b.id} href={b.href} className={`btn ${b.style === 'outline' ? 'btn-outline' : 'btn-primary'}`}>
          {b.label}
        </SmartLink>
      ))}
    </div>
  );
}

// En-tête de section standard (étiquette + titre + description)
export function SectionHeader({ tag, titre, desc, h1 = false }) {
  if (!tag && !titre && !desc) return null;
  const Title = h1 ? 'h1' : 'h2';
  return (
    <div className="section-header reveal visible">
      {tag && <span className="section-tag">{tag}</span>}
      {titre && <Title className="section-title">{titre}</Title>}
      {desc && <p className="section-desc" style={{ whiteSpace: 'pre-line' }}>{desc}</p>}
    </div>
  );
}
