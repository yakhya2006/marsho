// Client de l'API du serveur (server/index.js)

const TOKEN_KEY = 'avalon_token';
const ROLE_KEY = 'avalon_role';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t) => sessionStorage.setItem(TOKEN_KEY, t);
export const getRole = () => sessionStorage.getItem(ROLE_KEY) || 'admin';
export const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
};

const authHeaders = () => ({ Authorization: `Bearer ${getToken() || ''}` });

export const apiLogin = async (username, password) => {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Identifiants incorrects');
  const { token, role } = await res.json();
  setToken(token);
  sessionStorage.setItem(ROLE_KEY, role || 'admin');
  return token;
};

export const fetchData = async () => {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Contenu indisponible');
  return res.json();
};

export const publishData = async (data) => {
  const res = await fetch('/api/data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error('Échec de la publication');
  return res.json();
};

export const fetchMedia = async () => {
  const res = await fetch('/api/media');
  if (!res.ok) return [];
  return res.json();
};

export const uploadMedia = async (files) => {
  const form = new FormData();
  [...files].forEach((f) => form.append('files', f));
  const res = await fetch('/api/media', { method: 'POST', headers: authHeaders(), body: form });
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error("Échec de l'import");
  return res.json();
};

export const deleteMedia = async (name) => {
  const res = await fetch(`/api/media/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error('Échec de la suppression');
  return res.json();
};

// ---- Comptes ----
export const fetchUsers = async () => {
  const res = await fetch('/api/users', { headers: authHeaders() });
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  return res.json();
};

export const createUser = async (username, password, role) => {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ username, password, role }),
  });
  const body = await res.json();
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error(body.error || 'Échec de la création');
  return body;
};

export const deleteUser = async (username) => {
  const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const body = await res.json();
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error(body.error || 'Échec de la suppression');
  return body;
};

export const changeUserPassword = async (username, password) => {
  const res = await fetch(`/api/users/${encodeURIComponent(username)}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ password }),
  });
  const body = await res.json();
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error(body.error || 'Échec du changement');
  return body;
};

// ---- Sauvegardes ----
export const fetchBackups = async () => {
  const res = await fetch('/api/backups', { headers: authHeaders() });
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  return res.json();
};

export const restoreBackup = async (name) => {
  const res = await fetch('/api/backups/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (res.status === 401) throw new Error('SESSION_EXPIREE');
  if (!res.ok) throw new Error(body.error || 'Échec de la restauration');
  return body;
};
