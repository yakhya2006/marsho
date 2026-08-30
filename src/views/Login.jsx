import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { apiLogin } from '../config/api';

// Authentification via le serveur (POST /api/login)
export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiLogin(username, password);
      onLogin(true);
      navigate('/admin');
    } catch {
      setError('Identifiants incorrects.');
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-icon">
          <ShieldCheck size={28} />
        </div>
        <h1>MARSHO <span>CMS</span></h1>
        <p className="admin-login-sub">Espace d'administration</p>

        <label className="admin-label" htmlFor="username">Utilisateur</label>
        <input
          id="username"
          className="admin-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Identifiant"
          autoFocus
        />

        <label className="admin-label" htmlFor="password">Mot de passe</label>
        <input
          id="password"
          className="admin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />

        {error && <div className="admin-login-error">{error}</div>}

        <button type="submit" className="admin-btn-primary admin-btn-full">Se connecter</button>

        <Link to="/" className="admin-login-back">
          <ArrowLeft size={14} /> Retour au site
        </Link>
      </form>
    </div>
  );
}
