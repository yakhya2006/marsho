import React, { useEffect, useRef, useState } from 'react';
import { Upload, Link2, X, Search } from 'lucide-react';
import { fetchMedia, uploadMedia } from '../config/api';

const isImage = (name) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
const isVid = (name) => /\.(mp4|webm|ogv)$/i.test(name);

// Modal de sélection d'un fichier de la médiathèque (ou d'une URL externe)
export default function MediaPicker({ onPick, onClose }) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const reload = () => fetchMedia().then(setFiles);
  useEffect(() => { reload(); }, []);

  const handleUpload = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const { files: added } = await uploadMedia(fileList);
      await reload();
      if (added?.length === 1) onPick(added[0].url);
    } finally {
      setUploading(false);
    }
  };

  const visible = files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal media-picker" onClick={(e) => e.stopPropagation()}>
        <div className="media-picker-head">
          <h3>Médiathèque</h3>
          <button type="button" className="admin-btn-ghost" onClick={onClose} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <div className="media-picker-tools">
          <div className="media-search">
            <Search size={14} />
            <input
              className="admin-input"
              placeholder="Rechercher…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} /> {uploading ? 'Import…' : 'Importer'}
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

        <div className="media-grid">
          {visible.map((f) => (
            <button key={f.name} type="button" className="media-cell" title={f.name} onClick={() => onPick(f.url)}>
              {isImage(f.name) ? (
                <img src={f.url} alt={f.name} loading="lazy" />
              ) : isVid(f.name) ? (
                <span className="media-cell-file media-cell-file--video">🎬 vidéo</span>
              ) : (
                <span className="media-cell-file">{f.name.split('.').pop()}</span>
              )}
              <span className="media-cell-name">{f.name}</span>
            </button>
          ))}
          {visible.length === 0 && <p className="media-empty">Aucun fichier.</p>}
        </div>

        <div className="media-picker-url">
          <Link2 size={14} />
          <input
            className="admin-input"
            placeholder="…ou collez une URL externe (https://…)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && url.trim()) onPick(url.trim()); }}
          />
          <button
            type="button"
            className="admin-btn-ghost"
            disabled={!url.trim()}
            onClick={() => onPick(url.trim())}
          >
            Utiliser
          </button>
        </div>
      </div>
    </div>
  );
}
