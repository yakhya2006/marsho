// Tests d'intégration de l'API (node:test, aucune dépendance).
// Lance le vrai serveur sur un port de test avec un stockage jetable.
// Usage : npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5199;
const BASE = `http://localhost:${PORT}`;
let proc;
let tmpDir;

const waitForServer = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`${BASE}/api/media`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw new Error('Le serveur de test ne démarre pas');
};

before(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'avalon-test-'));
  proc = spawn('node', [path.join(__dirname, '..', 'server', 'index.js')], {
    env: {
      ...process.env,
      PORT: String(PORT),
      DATA_FILE: path.join(tmpDir, 'data.json'),
      UPLOADS_DIR: path.join(tmpDir, 'uploads'),
      ADMIN_USER: 'admin',
      ADMIN_PASS: 'test-secret',
      ADMIN_PASS_HASH: '',
    },
    stdio: 'ignore',
  });
  await waitForServer();
});

after(() => {
  proc?.kill();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const login = async (password = 'test-secret') =>
  fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password }),
  });

test('login : bons identifiants → token', async () => {
  const res = await login();
  assert.equal(res.status, 200);
  const { token } = await res.json();
  assert.equal(typeof token, 'string');
  assert.equal(token.length, 64);
});

test('login : mauvais mot de passe → 401, puis blocage après 5 échecs → 429', async () => {
  for (let i = 0; i < 5; i++) {
    const res = await login('mauvais');
    assert.equal(res.status, 401);
  }
  const blocked = await login('mauvais');
  assert.equal(blocked.status, 429);
  // même le bon mot de passe est bloqué pendant la fenêtre
  const alsoBlocked = await login();
  assert.equal(alsoBlocked.status, 429);
});

test('PUT /api/data sans token → 401', async () => {
  const res = await fetch(`${BASE}/api/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings: {}, navigation: [], pages: [] }),
  });
  assert.equal(res.status, 401);
});

// Scénario complet data + média sur une instance vierge dédiée
// (le blocage anti-bruteforce du test précédent ne l'affecte pas).
test('scénario complet data + média sur instance dédiée', async (t) => {
  const port2 = 5198;
  const base2 = `http://localhost:${port2}`;
  const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'avalon-test2-'));
  const proc2 = spawn('node', [path.join(__dirname, '..', 'server', 'index.js')], {
    env: {
      ...process.env,
      PORT: String(port2),
      DATA_FILE: path.join(tmp2, 'data.json'),
      UPLOADS_DIR: path.join(tmp2, 'uploads'),
      ADMIN_PASS: 'test-secret',
      ADMIN_PASS_HASH: '',
    },
    stdio: 'ignore',
  });
  t.after(() => {
    proc2.kill();
    fs.rmSync(tmp2, { recursive: true, force: true });
  });
  for (let i = 0; i < 40; i++) {
    try { await fetch(`${base2}/api/media`); break; } catch { await new Promise((r) => setTimeout(r, 150)); }
  }

  // pas encore de contenu
  const empty = await fetch(`${base2}/api/data`);
  assert.equal(empty.status, 404);

  // login
  const { token } = await (await fetch(`${base2}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'test-secret' }),
  })).json();
  const auth = { Authorization: `Bearer ${token}` };

  // publication
  const payload = { settings: { maintenance: false }, navigation: [], pages: [{ id: 'p1', slug: '', title: 'Accueil', blocks: [] }] };
  const put = await fetch(`${base2}/api/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(payload),
  });
  assert.equal(put.status, 200);

  // lecture publique
  const got = await (await fetch(`${base2}/api/data`)).json();
  assert.equal(got.pages[0].title, 'Accueil');

  // 2e publication → un backup doit exister
  await fetch(`${base2}/api/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(payload),
  });
  const backups = fs.readdirSync(path.join(tmp2, 'backups'));
  assert.ok(backups.length >= 1, 'backup créé avant réécriture');

  // upload : refusé sans token
  const form = new FormData();
  form.append('files', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 'test.png');
  const upNoAuth = await fetch(`${base2}/api/media`, { method: 'POST', body: form });
  assert.equal(upNoAuth.status, 401);

  // upload : accepté avec token
  const form2 = new FormData();
  form2.append('files', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 'test.png');
  const up = await fetch(`${base2}/api/media`, { method: 'POST', headers: auth, body: form2 });
  assert.equal(up.status, 200);
  const { files } = await up.json();
  assert.equal(files[0].name, 'test.png');

  // extension interdite → 400
  const form3 = new FormData();
  form3.append('files', new Blob([Buffer.from('test')], { type: 'application/x-sh' }), 'hack.sh');
  const bad = await fetch(`${base2}/api/media`, { method: 'POST', headers: auth, body: form3 });
  assert.equal(bad.status, 400);

  // suppression
  const del = await fetch(`${base2}/api/media/test.png`, { method: 'DELETE', headers: auth });
  assert.equal(del.status, 200);

  // --- comptes ---
  // création
  const mkUser = await fetch(`${base2}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ username: 'ewen', password: 'motdepasse-solide' }),
  });
  assert.equal(mkUser.status, 200);
  // mot de passe trop court → 400
  const weak = await fetch(`${base2}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ username: 'faible', password: 'abc' }),
  });
  assert.equal(weak.status, 400);
  // le nouveau compte peut se connecter — rôle collaborateur par défaut
  const login2 = await fetch(`${base2}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ewen', password: 'motdepasse-solide' }),
  });
  assert.equal(login2.status, 200);
  const session2 = await login2.json();
  assert.equal(session2.role, 'collaborateur');
  const auth2 = { Authorization: `Bearer ${session2.token}` };

  // un collaborateur ne peut ni créer ni supprimer de comptes
  const collabCreate = await fetch(`${base2}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth2 },
    body: JSON.stringify({ username: 'intrus', password: 'motdepasse-solide' }),
  });
  assert.equal(collabCreate.status, 403);
  const collabDelete = await fetch(`${base2}/api/users/admin`, { method: 'DELETE', headers: auth2 });
  assert.equal(collabDelete.status, 403);
  // ni changer le mot de passe d'un autre…
  const collabPwdOther = await fetch(`${base2}/api/users/admin/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth2 },
    body: JSON.stringify({ password: 'nouveaumdp-123' }),
  });
  assert.equal(collabPwdOther.status, 403);
  // …mais le sien, oui
  const collabPwdSelf = await fetch(`${base2}/api/users/ewen/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth2 },
    body: JSON.stringify({ password: 'nouveaumdp-123' }),
  });
  assert.equal(collabPwdSelf.status, 200);
  // le contenu reste modifiable par un collaborateur
  const collabPut = await fetch(`${base2}/api/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth2 },
    body: JSON.stringify(payload),
  });
  assert.equal(collabPut.status, 200);
  // impossible de supprimer son propre compte
  const selfDel = await fetch(`${base2}/api/users/admin`, { method: 'DELETE', headers: auth });
  assert.equal(selfDel.status, 400);
  // suppression de l'autre compte OK
  const otherDel = await fetch(`${base2}/api/users/ewen`, { method: 'DELETE', headers: auth });
  assert.equal(otherDel.status, 200);

  // --- restauration ---
  const list = await (await fetch(`${base2}/api/backups`, { headers: auth })).json();
  assert.ok(list.length >= 1);
  const modif = { ...payload, pages: [{ id: 'p1', slug: '', title: 'Modifié', blocks: [] }] };
  await fetch(`${base2}/api/data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify(modif),
  });
  assert.equal((await (await fetch(`${base2}/api/data`)).json()).pages[0].title, 'Modifié');
  const restore = await fetch(`${base2}/api/backups/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ name: list[0].name }),
  });
  assert.equal(restore.status, 200);
  assert.equal((await (await fetch(`${base2}/api/data`)).json()).pages[0].title, 'Accueil');
});
