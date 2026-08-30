// AVALON CMS — serveur API (contenu + médiathèque)
// Dev  : node server/index.js  (port 5175, Vite proxy /api)
// Prod : sert aussi le build dist/ — un seul process à déployer sur le VPS.
//
// Sécurité :
//  - mot de passe admin haché (scrypt) via ADMIN_PASS_HASH — jamais en clair en prod
//  - sessions à durée limitée, comparaisons en temps constant
//  - anti-bruteforce sur /api/login (5 échecs → 15 min de blocage par IP)
//  - sauvegarde automatique du contenu avant chaque publication (rotation 30)
//  - écriture atomique du contenu (pas de fichier corrompu si coupure)
//  - uploads restreints aux images/PDF, noms de fichiers assainis
import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
const BACKUPS_DIR = path.join(path.dirname(DATA_FILE), 'backups');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 5177;

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
// Prod : ADMIN_PASS_HASH="salt:hash" (généré par `node server/hash-password.mjs`).
// Dev : à défaut, ADMIN_PASS en clair (par défaut « avalon »).
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || '';
const ADMIN_PASS = process.env.ADMIN_PASS || 'avalon';

const USERS_FILE = process.env.USERS_FILE || path.join(path.dirname(DATA_FILE), 'users.json');

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // session : 24 h
const LOGIN_MAX_FAILS = 5;
const LOGIN_BLOCK_MS = 5 * 60 * 1000; // 5 min
const BACKUPS_KEPT = 10;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(BACKUPS_DIR, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));

// En-têtes de sécurité de base
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'same-origin');
  next();
});

// ---- Mot de passe : scrypt, comparaison en temps constant ----

const timingSafeEq = (a, b) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}`;
};

const checkHash = (password, stored) => {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  return timingSafeEq(crypto.scryptSync(password, salt, 32).toString('hex'), hash);
};

// ---- Comptes (users.json) ----
// Deux rôles : 'admin' (peut créer/supprimer des comptes et changer les mots
// de passe des autres) et 'collaborateur' (tout le reste : contenu, médias,
// sauvegardes — mais pas la gestion des comptes).

const loadUsers = () =>
  JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).map((u) => ({ role: 'admin', ...u }));
const saveUsers = (users) => {
  const tmp = `${USERS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2));
  fs.renameSync(tmp, USERS_FILE);
};

// Premier démarrage : crée le compte initial depuis l'environnement
if (!fs.existsSync(USERS_FILE)) {
  saveUsers([{
    username: ADMIN_USER,
    role: 'admin',
    hash: ADMIN_PASS_HASH || hashPassword(ADMIN_PASS),
    createdAt: new Date().toISOString(),
  }]);
}

// ---- Sessions (token aléatoire, expiration glissante) ----

const tokens = new Map(); // token -> { expiry, username }

const requireAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const session = tokens.get(token);
  if (!session || session.expiry < Date.now()) {
    tokens.delete(token);
    return res.status(401).json({ error: 'Non autorisé' });
  }
  session.expiry = Date.now() + TOKEN_TTL_MS;
  req.username = session.username;
  next();
};

// Le rôle est relu depuis users.json à chaque fois : une rétrogradation
// prend effet immédiatement, même session ouverte.
const requireAdmin = (req, res, next) => {
  const user = loadUsers().find((u) => u.username === req.username);
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Réservé aux administrateurs' });
  }
  next();
};

// ---- Anti-bruteforce ----

const loginFails = new Map(); // ip -> { count, blockedUntil }

app.post('/api/login', (req, res) => {
  const ip = req.ip || 'unknown';
  const entry = loginFails.get(ip) || { count: 0, blockedUntil: 0 };
  if (entry.blockedUntil > Date.now()) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez dans quelques minutes' });
  }

  const { username, password } = req.body || {};
  const user = loadUsers().find((u) => u.username === username);
  if (user && typeof password === 'string' && checkHash(password, user.hash)) {
    loginFails.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    tokens.set(token, { expiry: Date.now() + TOKEN_TTL_MS, username });
    return res.json({ token, username, role: user.role });
  }

  entry.count += 1;
  if (entry.count >= LOGIN_MAX_FAILS) {
    entry.blockedUntil = Date.now() + LOGIN_BLOCK_MS;
    entry.count = 0;
  }
  loginFails.set(ip, entry);
  res.status(401).json({ error: 'Identifiants invalides' });
});

// ---- Gestion des comptes (tous à pleins droits) ----

app.get('/api/users', requireAuth, (req, res) => {
  res.json(loadUsers().map(({ username, role, createdAt }) => ({ username, role, createdAt, me: username === req.username })));
});

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
  const { username, password, role } = req.body || {};
  const name = String(username || '').trim();
  if (!/^[\w.-]{3,30}$/.test(name)) {
    return res.status(400).json({ error: 'Nom de compte : 3 à 30 caractères, lettres/chiffres/._-' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe : 8 caractères minimum' });
  }
  const users = loadUsers();
  if (users.some((u) => u.username === name)) {
    return res.status(409).json({ error: 'Ce compte existe déjà' });
  }
  users.push({
    username: name,
    role: role === 'admin' ? 'admin' : 'collaborateur',
    hash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  saveUsers(users);
  res.json({ ok: true });
});

app.put('/api/users/:username/password', requireAuth, (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe : 8 caractères minimum' });
  }
  const users = loadUsers();
  // Un collaborateur ne peut changer que son propre mot de passe
  const caller = users.find((u) => u.username === req.username);
  if (req.params.username !== req.username && caller?.role !== 'admin') {
    return res.status(403).json({ error: 'Réservé aux administrateurs' });
  }
  const user = users.find((u) => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'Compte introuvable' });
  user.hash = hashPassword(password);
  saveUsers(users);
  res.json({ ok: true });
});

app.delete('/api/users/:username', requireAuth, requireAdmin, (req, res) => {
  if (req.params.username === req.username) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  }
  const users = loadUsers();
  const target = users.find((u) => u.username === req.params.username);
  // toujours garder au moins un administrateur
  if (target?.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
    return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
  }
  const next = users.filter((u) => u.username !== req.params.username);
  if (next.length === users.length) return res.status(404).json({ error: 'Compte introuvable' });
  saveUsers(next);
  // révoque les sessions du compte supprimé
  for (const [tok, s] of tokens) if (s.username === req.params.username) tokens.delete(tok);
  res.json({ ok: true });
});

// ---- Sauvegardes : liste + restauration depuis l'admin ----

app.get('/api/backups', requireAuth, (_req, res) => {
  const files = fs.existsSync(BACKUPS_DIR)
    ? fs.readdirSync(BACKUPS_DIR).filter((f) => f.startsWith('data-') && f.endsWith('.json')).sort().reverse()
    : [];
  res.json(files.map((name) => {
    const stat = fs.statSync(path.join(BACKUPS_DIR, name));
    return { name, size: stat.size, mtime: stat.mtimeMs };
  }));
});

app.post('/api/backups/restore', requireAuth, (req, res) => {
  const name = path.basename(String(req.body?.name || ''));
  const file = path.join(BACKUPS_DIR, name);
  if (!name.startsWith('data-') || !fs.existsSync(file)) {
    return res.status(404).json({ error: 'Sauvegarde introuvable' });
  }
  backupData(); // l'état actuel devient lui-même une sauvegarde
  const tmp = `${DATA_FILE}.tmp`;
  fs.copyFileSync(file, tmp);
  fs.renameSync(tmp, DATA_FILE);
  res.json({ ok: true });
});

// ---- Contenu publié ----

app.get('/api/data', (_req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.status(404).json({ error: 'Pas encore de contenu' });
  res.type('json').send(fs.readFileSync(DATA_FILE, 'utf8'));
});

// Sauvegarde horodatée de l'existant, puis rotation
const backupData = () => {
  if (!fs.existsSync(DATA_FILE)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(DATA_FILE, path.join(BACKUPS_DIR, `data-${stamp}.json`));
  const old = fs.readdirSync(BACKUPS_DIR).filter((f) => f.startsWith('data-')).sort();
  while (old.length > BACKUPS_KEPT) fs.unlinkSync(path.join(BACKUPS_DIR, old.shift()));
};

app.put('/api/data', requireAuth, (req, res) => {
  const { navigation, pages, settings } = req.body || {};
  if (!Array.isArray(navigation) || !Array.isArray(pages)) {
    return res.status(400).json({ error: 'navigation et pages doivent être des tableaux' });
  }
  backupData();
  // Écriture atomique : fichier temporaire puis renommage
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ settings, navigation, pages }, null, 2));
  fs.renameSync(tmp, DATA_FILE);
  res.json({ ok: true });
});

// ---- Médiathèque ----

const ALLOWED_EXT = /\.(png|jpe?g|gif|webp|svg|avif|pdf|mp4|webm|ogv)$/i;

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const safe = path.basename(file.originalname).normalize('NFKD').replace(/[^\w.\- ]/g, '').trim() || 'fichier';
    let name = safe;
    let i = 1;
    while (fs.existsSync(path.join(UPLOADS_DIR, name))) {
      const ext = path.extname(safe);
      name = `${path.basename(safe, ext)}-${i++}${ext}`;
    }
    cb(null, name);
  },
});

const upload = multer({
  storage,
  // 60 Mo : de quoi passer une courte vidéo compressée, pas un film
  limits: { fileSize: 60 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_EXT.test(file.originalname)) return cb(null, true);
    cb(new Error('Type de fichier non autorisé (images, PDF ou vidéo mp4/webm)'));
  },
});

app.get('/api/media', (_req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR).filter((f) => !f.startsWith('.'));
  res.json(files.map((name) => {
    const stat = fs.statSync(path.join(UPLOADS_DIR, name));
    return { name, url: `/media/${encodeURIComponent(name)}`, size: stat.size, mtime: stat.mtimeMs };
  }).sort((a, b) => b.mtime - a.mtime));
});

app.post('/api/media', requireAuth, (req, res) => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ files: (req.files || []).map((f) => ({ name: f.filename, url: `/media/${encodeURIComponent(f.filename)}` })) });
  });
});

app.delete('/api/media/:name', requireAuth, (req, res) => {
  const target = path.join(UPLOADS_DIR, path.basename(req.params.name));
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Fichier introuvable' });
  fs.unlinkSync(target);
  res.json({ ok: true });
});

app.use('/media', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// ---- Traduction automatique ----
// Par défaut : endpoint public non officiel de Google Traduction (gratuit,
// sans clé — « Google trad simple »). Si TRANSLATE_API_KEY est défini,
// on utilise l'API Anthropic (traduction IA, meilleure qualité).

const translateOneGoogle = async (text, target) => {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl='
    + encodeURIComponent(target) + '&dt=t&q=' + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Service de traduction indisponible');
  const json = await res.json();
  return (json[0] || []).map((seg) => seg[0]).join('');
};

const translateBatchAI = async (texts, target) => {
  const names = { ru: 'russe', en: 'anglais', ar: 'arabe' };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.TRANSLATE_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Traduis chaque élément du tableau JSON suivant du français vers le ${names[target] || target}. ` +
          `C'est le contenu d'un site associatif : ton naturel et fidèle. ` +
          `Réponds UNIQUEMENT avec un tableau JSON de mêmes longueur et ordre.\n\n${JSON.stringify(texts)}`,
      }],
    }),
  });
  if (!res.ok) throw new Error('API de traduction IA indisponible');
  const json = await res.json();
  const raw = json.content?.[0]?.text || '[]';
  const parsed = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
  if (!Array.isArray(parsed) || parsed.length !== texts.length) throw new Error('Réponse IA invalide');
  return parsed;
};

app.post('/api/translate', requireAuth, async (req, res) => {
  const { texts, target } = req.body || {};
  if (!Array.isArray(texts) || !texts.length || !['ru', 'en', 'ar'].includes(target)) {
    return res.status(400).json({ error: 'texts[] et target (ru|en|ar) requis' });
  }
  if (texts.length > 200) return res.status(400).json({ error: 'Trop de textes (200 max)' });
  try {
    let translations;
    if (process.env.TRANSLATE_API_KEY) {
      translations = await translateBatchAI(texts, target);
    } else {
      translations = [];
      for (let i = 0; i < texts.length; i += 5) {
        const batch = texts.slice(i, i + 5);
        translations.push(...await Promise.all(batch.map((t) => translateOneGoogle(t, target))));
      }
    }
    res.json({ translations, provider: process.env.TRANSLATE_API_KEY ? 'ia' : 'google' });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ---- SEO : sitemap généré depuis le contenu + robots.txt ----

app.get('/sitemap.xml', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.status(404).end();
  const { pages } = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const origin = `${req.protocol}://${req.get('host')}`;
  const urls = pages
    .map((p) => `  <url><loc>${origin}/${p.slug}</loc></url>`)
    .join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

app.get('/robots.txt', (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${origin}/sitemap.xml\n`
  );
});

// ---- Frontend buildé (prod) ----

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/(api|media)\/).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.listen(PORT, () => console.log(`Avalon CMS API sur http://localhost:${PORT}`));
