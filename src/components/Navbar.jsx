import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItemHref } from '../config/helpers';
import { LangSwitcher, ThemeToggle } from './NavControls';

// Barre de navigation principale, générée récursivement depuis data.navigation.
// Desktop : dropdowns au survol (CSS). Mobile : menu plein écran + accordéons.
// Types d'items : page (lien direct), dropdown (sous-menu), lien (ancre ou URL).
export default function Navbar({ data }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const settings = data.settings || {};
  const bandeau = settings.bandeau || {};
  const bandeauActif = !!(bandeau.actif && String(bandeau.message || '').trim());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Le bandeau décale la navbar (comme body.has-bandeau côté PHP)
  useEffect(() => {
    document.body.classList.toggle('has-bandeau', bandeauActif);
    return () => document.body.classList.remove('has-bandeau');
  }, [bandeauActif]);

  // Fermer le menu mobile à chaque changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdowns({});
  }, [location.pathname, location.hash]);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdowns({});
  };

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLink = (item) => {
    const href = navItemHref(data, item);
    const isExternal = /^https?:\/\//.test(href);
    const isActive = item.type === 'page' && location.pathname === href;
    const className = `nav-link ${item.cta ? 'nav-cta' : ''} ${isActive ? 'active' : ''}`;
    if (isExternal) {
      return (
        <a key={item.id} href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
          {item.label}
        </a>
      );
    }
    return (
      <Link key={item.id} to={href} className={className} onClick={closeMenu}>
        {item.label}
      </Link>
    );
  };

  const renderNavItem = (item) => {
    if (item.type === 'dropdown') {
      const isOpen = !!openDropdowns[item.id];
      return (
        <div key={item.id} className={`nav-dropdown ${isOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="nav-link nav-link--dropdown"
            onClick={() => toggleDropdown(item.id)}
          >
            {item.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div className="nav-dropdown-menu">
            {(item.children || []).map((child) => (
              <Link key={child.id} to={navItemHref(data, child)} onClick={closeMenu}>
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }
    return renderLink(item);
  };

  const logoUrl = settings.logo || '';

  return (
    <>
      {bandeauActif && (
        <div className="bandeau-defilant">
          <div className="bandeau-track">
            {[0, 1].map((set) => (
              <div className="bandeau-set" key={set} aria-hidden={set === 1 ? 'true' : undefined}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <span className="bandeau-item" key={j}>
                    {bandeau.message}
                    <span className="bandeau-sep">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <header className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            {logoUrl && <img src={logoUrl} alt="" className="logo-icon-img" onError={(e) => { e.target.style.display = 'none'; }} />}
            <span className="logo-text">{settings.site_name || 'Marsho'}</span>
            <span className="logo-sub">{settings.tagline}</span>
          </Link>

          <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {(data.navigation || []).map(renderNavItem)}
            <Link to="/login" className="nav-link" onClick={closeMenu} style={{ opacity: 0.7 }}>
              Espace Admin
            </Link>
          </nav>

          <div className="nav-controls">
            <LangSwitcher />
            <ThemeToggle />
          </div>

          <button
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
    </>
  );
}
