const crypto = require('node:crypto');

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }).toString('hex');
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [scheme, n, r, p, salt, expected] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = crypto.scryptSync(String(password), salt, KEYLEN, { N: Number(n), r: Number(r), p: Number(p) });
  const expectedBuf = Buffer.from(expected, 'hex');
  return expectedBuf.length === actual.length && crypto.timingSafeEqual(actual, expectedBuf);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash, user_id, csrf, expires_at) VALUES (?, ?, ?, ?)')
    .run(sha256(token), userId, csrf, Date.now() + SESSION_TTL_MS);
  return { token, csrf };
}

function getSession(db, token) {
  if (!token) return null;
  const session = db.prepare(`
    SELECT s.token_hash, s.csrf, s.expires_at, u.id AS user_id, u.email, u.role, u.customer_id
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
  `).get(sha256(token));
  if (!session) return null;
  if (session.expires_at < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    return null;
  }
  return session;
}

function destroySession(db, token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > -1) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

module.exports = { hashPassword, verifyPassword, createSession, getSession, destroySession, parseCookies, SESSION_TTL_MS };
