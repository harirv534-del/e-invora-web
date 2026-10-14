/**
 * E-INVORA owner authentication (server-side only).
 *
 * - The owner's email + password hash (scrypt, random salt) live in server/data/owner.json,
 *   which is git-ignored and never sent to the browser.
 * - Passwords are never stored in plain text and are never returned by any API.
 * - First-time setup needs a one-time SETUP KEY that only exists on the server
 *   (OWNER_SETUP_KEY in .env, or a random key printed in the server terminal).
 * - Sessions are signed, expiring, HttpOnly cookies. Changing credentials invalidates
 *   every older session.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

const DATA_DIR = path.resolve('server/data');
const OWNER_FILE = path.join(DATA_DIR, 'owner.json');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const SESSION_COOKIE = 'einvora_owner_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
export const MIN_PASSWORD_LENGTH = 12;

const PLACEHOLDER_PASSWORDS = [
  'set-a-strong-unique-password-here',
  'ChangeMeInProduction2026!',
  'admin123',
  'password',
];

interface OwnerRecord {
  email: string;
  passwordHash: string; // scrypt$salt$hash
  credVersion: string; // changes whenever credentials change -> old sessions die
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyHash(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const DUMMY_HASH = hashPassword(crypto.randomBytes(8).toString('hex'));

// ---------------------------------------------------------------------------
// Owner storage
// ---------------------------------------------------------------------------
let owner: OwnerRecord | null = null;

function loadOwner() {
  try {
    if (fs.existsSync(OWNER_FILE)) {
      owner = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf-8')) as OwnerRecord;
    }
  } catch (err) {
    console.error('[AUTH] Could not read owner credentials file:', (err as Error).message);
    owner = null;
  }
}

function saveOwnerAtomic(record: OwnerRecord) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${OWNER_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(record, null, 2), { encoding: 'utf-8', mode: 0o600 });
  fs.renameSync(tmp, OWNER_FILE);
  owner = record;
}

export function validateNewCredentials(email: unknown, password: unknown): string | null {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 200) {
    return 'Please enter a valid email address.';
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (password.length > 200) return 'Password is too long.';
  if (PLACEHOLDER_PASSWORDS.includes(password)) return 'Please choose a unique password, not an example one.';
  if (password.toLowerCase().includes(email.split('@')[0].toLowerCase()) && email.split('@')[0].length > 3) {
    return 'Password must not contain your email name.';
  }
  return null;
}

/** Writes new credentials, then proves they work before reporting success. */
function applyOwnerCredentials(email: string, password: string): void {
  const record: OwnerRecord = {
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    credVersion: crypto.randomBytes(12).toString('hex'),
    updatedAt: new Date().toISOString(),
  };
  if (!verifyHash(password, record.passwordHash)) {
    throw new Error('Credential verification failed. Nothing was changed.');
  }
  const previous = owner;
  saveOwnerAtomic(record);
  // Re-read from disk to confirm the saved file really works for login.
  loadOwner();
  if (!owner || !verifyHash(password, (owner as OwnerRecord).passwordHash)) {
    owner = previous;
    if (previous) saveOwnerAtomic(previous);
    throw new Error('Saved credentials could not be verified. Previous login was kept.');
  }
}

export function isOwnerConfigured(): boolean {
  return owner !== null;
}

// ---------------------------------------------------------------------------
// One-time setup key (server-side secret)
// ---------------------------------------------------------------------------
let setupKey: string | null = null;
let setupKeyIsGenerated = false;

export function initAuth() {
  loadOwner();

  // Optional bootstrap from server-side environment variables (never from the browser).
  if (!owner) {
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envEmail && envPassword) {
      const problem = validateNewCredentials(envEmail, envPassword);
      if (problem) {
        console.warn(`[AUTH] ADMIN_EMAIL/ADMIN_PASSWORD in .env were ignored: ${problem}`);
      } else {
        applyOwnerCredentials(envEmail, envPassword);
        console.log('[AUTH] Owner account created from server environment variables.');
        console.log('[AUTH] You can now remove ADMIN_PASSWORD from .env; the password is stored only as a hash.');
      }
    }
  }

  if (!owner) {
    const envKey = process.env.OWNER_SETUP_KEY;
    if (envKey && envKey.length >= 16) {
      setupKey = envKey;
    } else if (!IS_PRODUCTION) {
      setupKey = crypto.randomBytes(9).toString('base64url');
      setupKeyIsGenerated = true;
    }
    if (setupKey) {
      console.log('');
      console.log('[AUTH] Owner account is not set up yet.');
      console.log('[AUTH] Open http://localhost:<port>/admin/login to create it.');
      if (setupKeyIsGenerated) {
        console.log(`[AUTH] One-time setup key (shown only in this terminal): ${setupKey}`);
      } else {
        console.log('[AUTH] Use the OWNER_SETUP_KEY value from your .env file.');
      }
      console.log('');
    } else {
      console.log('[AUTH] Owner account is not set up and OWNER_SETUP_KEY is missing: admin login is disabled.');
    }
  }
}

export function setupAvailable(): boolean {
  return !owner && Boolean(setupKey);
}

export function completeSetup(key: unknown, email: unknown, password: unknown): { ok: boolean; error?: string } {
  if (owner) return { ok: false, error: 'Owner account is already set up.' };
  if (!setupKey) return { ok: false, error: 'Setup is not enabled on this server.' };
  if (typeof key !== 'string' || !safeEqual(key.trim(), setupKey)) {
    return { ok: false, error: 'Invalid setup key.' };
  }
  const problem = validateNewCredentials(email, password);
  if (problem) return { ok: false, error: problem };
  applyOwnerCredentials(email as string, password as string);
  setupKey = null; // one-time use
  return { ok: true };
}

export function checkLogin(email: unknown, password: unknown): boolean {
  if (typeof email !== 'string' || typeof password !== 'string') return false;
  if (!owner) {
    verifyHash(password, DUMMY_HASH); // keep timing similar
    return false;
  }
  const emailOk = safeEqual(email.trim().toLowerCase(), owner.email);
  const passOk = verifyHash(password, emailOk ? owner.passwordHash : DUMMY_HASH);
  return emailOk && passOk;
}

export function changeCredentials(
  currentPassword: unknown,
  newEmail: unknown,
  newPassword: unknown
): { ok: boolean; error?: string } {
  if (!owner) return { ok: false, error: 'Owner account is not set up.' };
  if (typeof currentPassword !== 'string' || !verifyHash(currentPassword, owner.passwordHash)) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  const problem = validateNewCredentials(newEmail, newPassword);
  if (problem) return { ok: false, error: problem };
  try {
    applyOwnerCredentials(newEmail as string, newPassword as string);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function getOwnerEmail(): string | null {
  return owner ? owner.email : null;
}

// ---------------------------------------------------------------------------
// Signed session cookies
// ---------------------------------------------------------------------------
const SESSION_SECRET: string = (() => {
  const envSecret = process.env.ADMIN_SECRET_SESSION;
  if (envSecret && !envSecret.includes('GENERATE_') && envSecret.length >= 16) return envSecret;
  return crypto.randomBytes(32).toString('hex');
})();

const revokedNonces = new Set<string>();

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function issueSession(res: Response, req: Request) {
  if (!owner) return;
  const nonce = crypto.randomBytes(18).toString('hex');
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${nonce}.${exp}.${owner.credVersion}`;
  const token = `${nonce}.${exp}.${sign(payload)}`;
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure ? '; Secure' : ''}`
  );
}

export function clearSession(res: Response) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function sessionNonce(req: Request): string | null {
  const token = readCookie(req, SESSION_COOKIE);
  return token ? token.split('.')[0] : null;
}

export function revokeSession(req: Request) {
  const n = sessionNonce(req);
  if (n) revokedNonces.add(n);
}

export function hasValidSession(req: Request): boolean {
  if (!owner) return false;
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [nonce, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!nonce || !Number.isFinite(exp) || exp < Date.now() || revokedNonces.has(nonce)) return false;
  const expected = sign(`${nonce}.${expStr}.${owner.credVersion}`);
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
