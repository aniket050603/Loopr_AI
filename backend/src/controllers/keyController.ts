import type { Request, Response } from 'express';

/** Base64 SPKI public key distributed to browsers for envelope encryption. */
const PUBLIC_KEY = (process.env.CREDENTIAL_PUBLIC_KEY ?? '').trim();

/**
 * GET /api/auth/keys — hands out the RSA public key used to encrypt
 * credential-bearing request bodies. The matching private key never leaves
 * the server.
 */
export function getPublicKey(_req: Request, res: Response): void {
  if (!PUBLIC_KEY) {
    res.status(503).json({ message: 'Credential encryption is not configured.' });
    return;
  }
  res.json({ keyId: 'cred-1', algorithm: 'RSA-OAEP-256', publicKey: PUBLIC_KEY });
}
