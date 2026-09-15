import {
  useCallback,
  useMemo,
  useState,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { buildTheme, getPalette, type LedgerMode, type Palette } from './theme';
import { api, TOKEN_KEY } from '../api/client';

/** localStorage key for the browser-level theme choice. */
export const THEME_STORAGE_KEY = 'ledger-mode';

const STORAGE_KEY = THEME_STORAGE_KEY;

interface ModeContextValue {
  mode: LedgerMode;
  toggle: () => void;
  /** Switch theme programmatically (e.g. adopting the account's saved choice). */
  setMode: (mode: LedgerMode) => void;
}

const ModeContext = createContext<ModeContextValue>({
  mode: 'dark',
  toggle: () => {},
  setMode: () => {},
});

export function useLedgerMode() {
  return useContext(ModeContext);
}

export function usePalette(): Palette {
  const { mode } = useLedgerMode();
  return getPalette(mode);
}

const supportsViewTransitions =
  typeof document !== 'undefined' && 'startViewTransition' in document;

/** Last cursor position, so the theme wipe expands from wherever the user clicked. */
let lastPointer = { x: 0, y: 0 };

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LedgerMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Night mode is the default; only an explicit day choice switches it.
      return stored === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Track the cursor so the circular wipe starts under the toggle button.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      lastPointer = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  /** Applies a mode with the wipe animation; optionally remembers the choice. */
  const applyMode = useCallback((next: LedgerMode, persist: boolean) => {
    const paint = () => {
      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* private mode */
        }
      }
      setModeState(next);
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (supportsViewTransitions && !reducedMotion) {
      const root = document.documentElement;
      root.style.setProperty('--wipe-x', `${lastPointer.x}px`);
      root.style.setProperty('--wipe-y', `${lastPointer.y}px`);
      // The state change (and thus the repaint) must happen inside the
      // transition callback for the wipe to capture both states.
      document.startViewTransition(() => {
        flushSync(paint);
      });
    } else {
      paint();
    }
  }, []);

  /** Saved on this browser AND on the account (when signed in). */
  const toggle = useCallback(() => {
    const next: LedgerMode = mode === 'light' ? 'dark' : 'light';
    applyMode(next, true);
    // Persist to the account too, so the theme follows the user across
    // devices. Skipped on the login page, where there is no session yet.
    if (localStorage.getItem(TOKEN_KEY)) {
      api.patch('/auth/theme', { theme: next }).catch(() => {
        /* best effort — the browser choice already persists */
      });
    }
  }, [mode, applyMode]);

  /** Applies a mode without recording it as the user's choice. */
  const setMode = useCallback(
    (next: LedgerMode) => {
      applyMode(next, false);
    },
    [applyMode],
  );

  const value = useMemo(() => ({ mode, toggle, setMode }), [mode, toggle, setMode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ModeContext.Provider>
  );
}
