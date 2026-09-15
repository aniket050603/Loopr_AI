import crypto from 'node:crypto';
import type { Request } from 'express';

/**
 * Envelope encryption for credential-bearing requests.
 *
 * Motivation: TLS alone protects the wire, but intermediate tooling (corporate
 * proxies, debugging gateways) can terminate and re-encrypt TLS, which exposes
 * plaintext bodies. Encrypting credentials at the application layer means only
 * the holder of CREDENTIAL_PRIVATE_KEY can ever read them.
 *
 * Wire format produced by the frontend (POST /auth/keys + JSON body):
 *   { payload: "<base64 iv>.<base64 ciphertext>.<base64 authTag>" }
 *
 * The private key never leaves the server; the browser only ever sees the
 * public key it requested.
 */

/** Base64 of the RSA private key (PKCS#8, PEM or raw DER). Set on the host. */
function requiredKey(name: 'CREDENTIAL_PRIVATE_KEY'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Loads the private key whether the env var holds PEM text or raw DER. */
function loadPrivateKey(): crypto.KeyObject {
  const decoded = Buffer.from(requiredKey('CREDENTIAL_PRIVATE_KEY'), 'base64');
  const isPem = decoded.subarray(0, 10).toString('utf8').includes('-----BEGIN');
  return crypto.createPrivateKey({
    key: decoded,
    format: isPem ? 'pem' : 'der',
    type: 'pkcs8',
  });
}

/** Decrypts an envelope produced by the browser's WebCrypto RSA-OAEP + AES-GCM. */
export function openEnvelope(payload: string): string {
  const [ivB64, dataB64, keyB64] = payload.split('.');
  if (!ivB64 || !dataB64 || !keyB64) {
    throw new Error('Malformed credential envelope');
  }

  const privateKey = loadPrivateKey();

  // The browser sends `iv.ciphertext.sealedKey`; WebCrypto's AES-GCM output
  // already carries the 16-byte auth tag appended to the ciphertext.
  const aesKey = crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(keyB64, 'base64'),
  );

  const sealed = Buffer.from(dataB64, 'base64');
  const tag = sealed.subarray(sealed.length - 16);
  const ciphertext = sealed.subarray(0, sealed.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

/**
 * Body reader that unwraps credential envelopes transparently.
 *
 * If the body is `{ payload: "<envelope>" }` it is decrypted in place and
 * replaced by the decoded object; any other body passes through untouched, so
 * plaintext requests (curl, Postman, older clients) keep working.
 */
export async function unwrapCredentialBody(req: Request): Promise<void> {
  const body: unknown = req.body;
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { payload?: unknown }).payload !== 'string' ||
    Object.keys(body as object).length !== 1
  ) {
    return;
  }

  try {
    req.body = JSON.parse(openEnvelope((body as { payload: string }).payload));
  } catch {
    // Deliberately opaque: a bad envelope must be indistinguishable from bad
    // credentials so nothing about the mechanism leaks.
    req.body = { __invalidEnvelope: true };
  }
}

/** Fixed bcrypt hash so unknown emails burn the same time as real ones. */
export const TIMING_EQUALIZER_HASH = '$2a$10$HSW8P0qlx93/jRZI37S/p.rA/cBC5GY1l1paB1JKkY9JXBImKF2GG';
