import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './views/Login';
import Admin from './views/Admin';
import { fetchData, getToken, clearToken } from './config/api';
import { pathForPage } from './config/helpers';
import { LangProvider } from './config/i18n';

// Fait défiler jusqu'à l'ancre après un changement de route (ex : /#tarifs)
function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return null;
}

// Affichée aux visiteurs quand le site est fermé depuis l'admin
function MaintenancePage({ settings }) {
  return (
    <div
      className="avalon-tdj-body"
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '2rem', gap: '1.2rem',
      }}
    >
      <img
        src={settings?.logo || '/media/logo-avalon.svg'}
        alt="Avalon"
        style={{ width: '90px', opacity: 0.9 }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <h1 style={{ fontFamily: "'Cinzel', serif", color: 'var(--accent, #10b981)', fontSize: '2rem', margin: 0 }}>
        Avalon — Terres de Jeux
      </h1>
      <p style={{ color: 'rgba(232,236,240,0.75)', maxWidth: '460px', lineHeight: 1.7, margin: 0 }}>
        Le site est momentanément indisponible : nous préparons quelque chose de nouveau.
        Revenez d'ici peu !
      </p>
      <Link to="/login" style={{ color: 'rgba(232,236,240,0.4)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        Espace admin
      </Link>
    </div>
  );
}

function App() {
  const [cmsData, setCmsData] = useState(null);
  const [error, setError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());

  useEffect(() => {
    fetchData().then(setCmsData).catch(() => setError(true));
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
  };

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0b0f14', color: '#e8ecf0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Raleway', sans-serif", textAlign: 'center', padding: '2rem',
      }}>
        <div>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Le serveur de contenu ne répond pas.</p>
          <p style={{ opacity: 0.6 }}>Lancez-le avec : <code>npm run server</code></p>
        </div>
      </div>
    );
  }

  if (!cmsData) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0b0f14', color: '#e8ecf0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Raleway', sans-serif"
      }}>
        Chargement de l'univers Avalon…
      </div>
    );
  }

  // Site fermé depuis l'admin : les visiteurs voient la page d'attente,
  // les admins connectés continuent de tout voir normalement.
  const closed = !!cmsData.settings?.maintenance && !isLoggedIn;

  return (
    <LangProvider>
    <Router>
      <ScrollToHash />
      <Routes>
        {/* Routes générées dynamiquement depuis pages[] */}
        {cmsData.pages.map((page) => (
          <Route
            key={page.id}
            path={pathForPage(page)}
            element={closed ? <MaintenancePage settings={cmsData.settings} /> : <Layout data={cmsData} page={page} />}
          />
        ))}

        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/admin" /> : <Login onLogin={() => setIsLoggedIn(true)} />}
        />
        <Route
          path="/admin"
          element={isLoggedIn ? (
            <Admin data={cmsData} onUpdateData={setCmsData} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </LangProvider>
  );
}

export default App;
