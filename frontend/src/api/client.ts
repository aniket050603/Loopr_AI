import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'fin_dashboard_token';
export const USER_KEY = 'fin_dashboard_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** UI theme saved on the account; applied on sign-in. */
  preferredTheme?: 'light' | 'dark';
}

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api`;

/**
 * Free-tier hosts (Render) sleep after ~15 idle minutes and can take a minute
 * to wake. Give real requests a generous ceiling instead of hanging forever.
 */
const REQUEST_TIMEOUT_MS = 60_000;
/**
 * The key prefetch doubles as the wake ping: Render *holds* requests while
 * booting, so this request pends until the server is up, then answers —
 * waking the API before the user can click Sign in. Generous ceiling.
 */
const PREFETCH_TIMEOUT_MS = 45_000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

/* -------------------------------------------------------------------------
 * Credential envelope encryption
 *
 * Login/register bodies are encrypted with an RSA-OAEP + AES-256-GCM envelope
 * before leaving the browser, so intermediate TLS-terminating proxies never
 * see raw credentials. The server accepts plaintext too (Postman, curl), so
 * this layer is fully transparent to the API contract.
 * ---------------------------------------------------------------------- */

let publicKeyPromise: Promise<string> | null = null;

/** Fetches (and caches) the server's public key for envelope encryption. */
function getPublicKey(): Promise<string> {
  publicKeyPromise ??= axios
    .get<{ publicKey: string }>(`${BASE_URL}/auth/keys`, { timeout: PREFETCH_TIMEOUT_MS })
    .then((res) => res.data.publicKey)
    .catch((error) => {
      publicKeyPromise = null; // allow a clean retry on the next attempt
      throw error;
    });
  return publicKeyPromise;
}

/**
 * Warms the API before the user can click Sign in: fetches the credential
 * envelope key (a request login needs anyway) with a generous timeout, so a
 * sleeping server boots behind it instead of blocking the actual login.
 * Call once at page load — fire-and-forget, silent, never fails visibly.
 */
export function prefetchApi(): void {
  void getPublicKey().catch(() => undefined);
}

/**
 * Encrypts a JSON body for the credential endpoints. Falls back to plaintext
 * (the server accepts both) if the key endpoint is unavailable.
 */
async function encryptCredentials(body: object): Promise<object> {
  try {
    const publicKeyPem = await getPublicKey();
    const [, pemBody] = publicKeyPem.split('-----');
    if (!pemBody) throw new Error('unexpected key format');

    const spkiDer = Uint8Array.from(atob(pemBody.trim()), (ch) => ch.charCodeAt(0));
    const rsaKey = await crypto.subtle.importKey(
      'spki',
      spkiDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    );

    // One fresh AES key per request — the RSA part only transports it.
    const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
    ]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        new TextEncoder().encode(JSON.stringify(body)),
      ),
    );
    const rawAesKey = new Uint8Array(await crypto.subtle.exportKey('raw', aesKey));

    const sealedKey = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKey, rawAesKey),
    );
    const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

    return { payload: `${toB64(iv)}.${toB64(ciphertext)}.${toB64(sealedKey)}` };
  } catch {
    return body; // graceful plaintext fallback — never block a login on this
  }
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Encrypt credentials on the two auth endpoints that carry them.
  if (
    config.url &&
    config.method === 'post' &&
    ['/auth/login', '/auth/register'].some((path) => config.url!.endsWith(path)) &&
    config.data
  ) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const encrypted = await encryptCredentials(body);
    const isEncrypted = 'payload' in encrypted;
    if (isEncrypted) {
      // Already serialized — axios will not set a JSON content type for strings.
      config.headers['Content-Type'] = 'application/json';
      config.headers['X-Credential-Encrypted'] = '1';
    }
    config.data = isEncrypted ? JSON.stringify(encrypted) : encrypted;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
