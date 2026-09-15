import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { unwrapCredentialBody, TIMING_EQUALIZER_HASH } from '../utils/credentialCrypto.js';

export type ThemePreference = 'light' | 'dark';

/** Client-safe user shape shared by every auth response. */
function publicUser(user: { _id: unknown; email: string; name: string; preferredTheme?: ThemePreference }) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    preferredTheme: user.preferredTheme === 'light' ? 'light' : 'dark',
  };
}

function parseCredentials(body: unknown): { email: string; password: string; name?: string } | null {
  if (typeof body !== 'object' || body === null) return null;
  const { email, password, name } = body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  return {
    email: email.trim().toLowerCase(),
    password,
    name: typeof name === 'string' ? name.trim() : undefined,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  await unwrapCredentialBody(req);
  const creds = parseCredentials(req.body);
  if (!creds || !creds.email.includes('@') || creds.password.length < 6) {
    res.status(400).json({
      message: 'Provide a valid email and a password of at least 6 characters.',
    });
    return;
  }

  const existing = await UserModel.findOne({ email: creds.email }).lean();
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const name = creds.name && creds.name.length > 0 ? creds.name : creds.email.split('@')[0];
  const passwordHash = await bcrypt.hash(creds.password, 10);
  const user = await UserModel.create({ email: creds.email, name, passwordHash });

  res.status(201).json({
    token: signToken({ id: user._id, email: user.email, name: user.name }),
    user: publicUser(user),
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  await unwrapCredentialBody(req);
  const creds = parseCredentials(req.body);
  if (!creds) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  const user = await UserModel.findOne({ email: creds.email });
  // Unknown emails still burn a bcrypt round so response timing cannot be
  // used to discover which addresses have accounts.
  const hash = user?.passwordHash ?? TIMING_EQUALIZER_HASH;
  const valid = await bcrypt.compare(creds.password, hash);

  if (!user || !valid) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  res.json({
    token: signToken({ id: user._id, email: user.email, name: user.name }),
    user: publicUser(user),
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findById(req.user?.sub)
    .select('email name preferredTheme')
    .lean();
  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }
  res.json({ user: publicUser(user) });
}

/** PATCH /auth/theme — persist the account's UI theme so it follows the user across devices. */
export async function updateTheme(req: Request, res: Response): Promise<void> {
  const { theme } = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as {
    theme?: unknown;
  };
  if (theme !== 'light' && theme !== 'dark') {
    res.status(400).json({ message: "theme must be 'light' or 'dark'." });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?.sub,
    { preferredTheme: theme },
    { new: true },
  ).select('email name preferredTheme');

  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }
  res.json({ user: publicUser(user) });
}
