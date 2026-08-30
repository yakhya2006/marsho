// Génère la valeur ADMIN_PASS_HASH pour docker-compose.yml
// Usage : node server/hash-password.mjs "mon-mot-de-passe"
import crypto from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage : node server/hash-password.mjs "mot-de-passe"');
  process.exit(1);
}
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 32).toString('hex');
console.log(`${salt}:${hash}`);
