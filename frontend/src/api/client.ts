import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'fin_dashboard_token';
export const USER_KEY = 'fin_dashboard_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api`;

/**
 * Free-tier hosts (Render) sleep after ~15 idle minutes and can take a minute
 * to wake. Give real requests a generous ceiling instead of hanging forever.
 */
const REQUEST_TIMEOUT_MS = 60_000;
/** The wake ping only needs to start the boot; it never blocks the user. */
const WAKE_TIMEOUT_MS = 15_000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

/**
 * Fire-and-forget GET /health so a sleeping server boots while the user is
 * still on the login page. Resolves false if the server does not answer in
 * time — the wake-up itself continues server-side regardless.
 */
export async function wakeApi(): Promise<boolean> {
  try {
    const healthUrl = BASE_URL.replace(/\/api\/?$/, '/health');
    await axios.get(healthUrl, { timeout: WAKE_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
