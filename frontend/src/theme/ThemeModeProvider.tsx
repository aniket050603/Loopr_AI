import {
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

const STORAGE_KEY = 'ledger-mode';

const ModeContext = createContext<{ mode: LedgerMode; toggle: () => void }>({
  mode: 'light',
  toggle: () => {},
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
  const [mode, setMode] = useState<LedgerMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
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

  const value = useMemo(
    () => ({
      mode,
      toggle: () => {
        const next: LedgerMode = mode === 'light' ? 'dark' : 'light';
        const persist = () => {
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {
            /* private mode */
          }
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
            flushSync(() => {
              persist();
              setMode(next);
            });
          });
        } else {
          persist();
          setMode(next);
        }
      },
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ModeContext.Provider>
  );
}
