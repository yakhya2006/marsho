import React, { useEffect, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { fetchBackups, restoreBackup, fetchData } from '../config/api';

// Sauvegardes du contenu : une copie est créée automatiquement à chaque
// publication. Restaurer = revenir à l'état du site à cette date.
export default function BackupsView({ onToast, onAuthError, onRestored }) {
  const [backups, setBackups] = useState([]);
  const [confirmRestore, setConfirmRestore] = useState(null);

  const guard = (err) => {
    if (err.message === 'SESSION_EXPIREE') onAuthError();
    else onToast(err.message);
  };

  const reload = () => fetchBackups().then(setBackups).catch(guard);
  useEffect(() => { reload(); }, []);

  // data-2026-07-14T18-30-12-345Z.json → date lisible
  const labelFor = (name) => {
    const m = name.match(/^data-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
    if (!m) return name;
    const [, d, h, min] = m;
    const [y, mo, day] = d.split('-');
    return `${day}/${mo}/${y} à ${h}h${min}`;
  };

  const handleRestore = async (name) => {
    setConfirmRestore(null);
    try {
      await restoreBackup(name);
      const fresh = await fetchData();
      onRestored(fresh);
      await reload();
      onToast('✓ Contenu restauré — le site affiche cette version');
    } catch (err) { guard(err); }
  };

  return (
    <div className="admin-editor-inner">
      <div className="admin-editor-head">
        <div>
          <span className="admin-chip"><History size={12} /> Sauvegardes</span>
          <h1 style={{ marginTop: '0.6rem' }}>Revenir en arrière</h1>
          <p className="admin-editor-sub">
            À chaque publication, la version précédente du site est conservée ici (10 dernières).
            En cas d'erreur, cliquez « Restaurer » : le site revient à l'état de cette date.
            L'état actuel est lui-même sauvegardé avant, donc rien n'est jamais perdu.
            La médiathèque n'est pas concernée (les fichiers ne sont pas supprimés par une publication).
          </p>
        </div>
      </div>

      <div className="admin-card">
        {backups.length === 0 && (
          <p className="admin-editor-sub">Aucune sauvegarde pour l'instant — elles apparaîtront à la prochaine publication.</p>
        )}
        {backups.map((bk, i) => (
          <div key={bk.name} className="user-row">
            <div className="user-row-main">
              <strong>{labelFor(bk.name)}</strong>
              {i === 0 && <span className="admin-chip" style={{ marginLeft: '0.6rem' }}>la plus récente</span>}
              <span className="user-row-date">{Math.max(1, Math.round(bk.size / 1024))} Ko</span>
            </div>
            <div className="user-row-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setConfirmRestore(bk.name)}>
                <RotateCcw size={13} /> Restaurer
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmRestore && (
        <div className="admin-modal-overlay" onClick={() => setConfirmRestore(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Restaurer la version du {labelFor(confirmRestore)} ?</h3>
            <p className="admin-modal-sub">
              Le site (pages, menu, paramètres) reviendra immédiatement à cet état.
              La version actuelle sera elle-même sauvegardée : vous pourrez y revenir.
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setConfirmRestore(null)}>Annuler</button>
              <button type="button" className="admin-btn-primary" onClick={() => handleRestore(confirmRestore)}>
                <RotateCcw size={14} /> Restaurer cette version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
