import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, KeyRound } from 'lucide-react';
import { fetchUsers, createUser, deleteUser, changeUserPassword, getRole } from '../config/api';

// Gestion des comptes. Deux rôles :
//  - administrateur : peut créer/supprimer des comptes et changer tous les mots de passe
//  - collaborateur : gère tout le contenu, mais pas les comptes des autres
export default function UsersView({ onToast, onAuthError }) {
  const isAdmin = getRole() === 'admin';
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState('collaborateur');
  const [pwdFor, setPwdFor] = useState(null); // username dont on change le mdp
  const [pwdValue, setPwdValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const reload = () => fetchUsers().then(setUsers).catch(guard);
  useEffect(() => { reload(); }, []);

  const guard = (err) => {
    if (err.message === 'SESSION_EXPIREE') onAuthError();
    else onToast(err.message);
  };

  const handleCreate = async () => {
    try {
      await createUser(newName.trim(), newPass, newRole);
      setNewName('');
      setNewPass('');
      await reload();
      onToast('Compte créé');
    } catch (err) { guard(err); }
  };

  const handleDelete = async (name) => {
    setConfirmDelete(null);
    try {
      await deleteUser(name);
      await reload();
      onToast('Compte supprimé');
    } catch (err) { guard(err); }
  };

  const handlePassword = async () => {
    try {
      await changeUserPassword(pwdFor, pwdValue);
      setPwdFor(null);
      setPwdValue('');
      onToast('Mot de passe changé');
    } catch (err) { guard(err); }
  };

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '');

  return (
    <div className="admin-editor-inner">
      <div className="admin-editor-head">
        <div>
          <span className="admin-chip"><Users size={12} /> Comptes</span>
          <h1 style={{ marginTop: '0.6rem' }}>Utilisateurs de l'admin</h1>
          <p className="admin-editor-sub">
            <strong>Administrateur</strong> : gère aussi les comptes (création, suppression, mots de passe des autres).
            <strong> Collaborateur</strong> : modifie tout le site (contenu, médias, sauvegardes) mais pas les comptes.
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="admin-card">
          <h3 className="admin-card-title">➕ Créer un compte</h3>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label className="admin-label">Nom du compte (3-30 caractères)</label>
              <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Identifiant" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Mot de passe (8 caractères minimum)</label>
              <input className="admin-input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Mot de passe" />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Rôle</label>
            <select className="admin-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="collaborateur">Collaborateur — tout le contenu, pas la gestion des comptes</option>
              <option value="admin">Administrateur — peut aussi créer et supprimer des comptes</option>
            </select>
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            disabled={!newName.trim() || newPass.length < 8}
            onClick={handleCreate}
          >
            <Plus size={14} /> Créer le compte
          </button>
        </div>
      )}

      <div className="admin-card">
        <h3 className="admin-card-title">👥 Comptes existants</h3>
        {users.map((u) => (
          <div key={u.username} className="user-row">
            <div className="user-row-main">
              <strong>{u.username}</strong>
              <span className={`role-badge ${u.role === 'admin' ? 'role-badge--admin' : ''}`}>
                {u.role === 'admin' ? 'administrateur' : 'collaborateur'}
              </span>
              {u.me && <span className="admin-chip" style={{ marginLeft: '0.4rem' }}>vous</span>}
              <span className="user-row-date">créé le {formatDate(u.createdAt)}</span>
            </div>
            <div className="user-row-actions">
              {(isAdmin || u.me) && (
                <button type="button" className="admin-btn-ghost" onClick={() => { setPwdFor(u.username); setPwdValue(''); }}>
                  <KeyRound size={13} /> Mot de passe
                </button>
              )}
              {isAdmin && !u.me && (
                <button type="button" className="admin-btn-ghost danger" onClick={() => setConfirmDelete(u.username)}>
                  <Trash2 size={13} /> Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {pwdFor && (
        <div className="admin-modal-overlay" onClick={() => setPwdFor(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nouveau mot de passe pour « {pwdFor} »</h3>
            <div className="admin-field">
              <label className="admin-label">Mot de passe (8 caractères minimum)</label>
              <input
                className="admin-input"
                type="password"
                value={pwdValue}
                autoFocus
                onChange={(e) => setPwdValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && pwdValue.length >= 8) handlePassword(); }}
              />
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setPwdFor(null)}>Annuler</button>
              <button type="button" className="admin-btn-primary" disabled={pwdValue.length < 8} onClick={handlePassword}>
                Changer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Supprimer le compte « {confirmDelete} » ?</h3>
            <p className="admin-modal-sub">Cette personne ne pourra plus se connecter à l'admin.</p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button type="button" className="admin-btn-danger" onClick={() => handleDelete(confirmDelete)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
