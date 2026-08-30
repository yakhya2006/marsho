import React, { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Copy, Search, Image as ImageIcon } from 'lucide-react';
import { fetchMedia, uploadMedia, deleteMedia } from '../config/api';

const isImage = (name) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
const isVid = (name) => /\.(mp4|webm|ogv)$/i.test(name);
const formatSize = (bytes) => {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  if (bytes > 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${bytes} o`;
};

// Page Médiathèque de l'admin : import (bouton + glisser-déposer),
// recherche, copie du chemin, suppression.
export default function MediaLibrary({ onToast, onAuthError }) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const inputRef = useRef(null);

  const reload = () => fetchMedia().then(setFiles);
  useEffect(() => { reload(); }, []);

  const guard = (err) => {
    if (err.message === 'SESSION_EXPIREE') onAuthError();
    else onToast(err.message);
  };

  const handleUpload = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      await uploadMedia(fileList);
      await reload();
      onToast(`${fileList.length} fichier(s) importé(s)`);
    } catch (err) {
      guard(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name) => {
    setConfirmDelete(null);
    try {
      await deleteMedia(name);
      await reload();
      onToast('Fichier supprimé');
    } catch (err) {
      guard(err);
    }
  };

  const copyPath = (f) => {
    navigator.clipboard?.writeText(f.url);
    onToast('Chemin copié : ' + f.url);
  };

  const visible = files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="admin-editor-inner">
      <div className="admin-editor-head">
        <div>
          <span className="admin-chip"><ImageIcon size={12} /> Médiathèque</span>
          <h1 style={{ marginTop: '0.6rem' }}>Fichiers du site</h1>
          <p className="admin-editor-sub">
            Les fichiers du design d'origine (torches, logo, carte du terrain…) sont déjà importés.
            Ajoutez les vôtres : ils deviennent sélectionnables dans tous les champs image.
          </p>
        </div>
      </div>

      <div
        className={`media-dropzone ${dragOver ? 'over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
      >
        <Upload size={22} />
        <p>Glissez-déposez vos fichiers ici</p>
        <button type="button" className="admin-btn-primary" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'Import en cours…' : 'Choisir des fichiers'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      <div className="media-picker-tools" style={{ marginTop: '1.2rem' }}>
        <div className="media-search">
          <Search size={14} />
          <input className="admin-input" placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <span className="media-count">{files.length} fichier(s)</span>
      </div>

      <div className="media-grid media-grid--library">
        {visible.map((f) => (
          <div key={f.name} className="media-cell media-cell--library">
            {isImage(f.name) ? (
              <img src={f.url} alt={f.name} loading="lazy" />
            ) : isVid(f.name) ? (
              <span className="media-cell-file media-cell-file--video">🎬 vidéo</span>
            ) : (
              <span className="media-cell-file">{f.name.split('.').pop()}</span>
            )}
            <span className="media-cell-name">{f.name}</span>
            <span className="media-cell-size">{formatSize(f.size)}</span>
            <div className="media-cell-actions">
              <button type="button" title="Copier le chemin" onClick={() => copyPath(f)}><Copy size={13} /></button>
              <button type="button" title="Supprimer" className="danger" onClick={() => setConfirmDelete(f.name)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && <p className="media-empty">Aucun fichier.</p>}
      </div>

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Supprimer « {confirmDelete} » ?</h3>
            <p className="admin-modal-sub">
              Les blocs qui utilisent ce fichier afficheront une image cassée.
            </p>
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
