import { useMemo, useState, createContext, useContext, type ReactNode } from 'react';
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

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LedgerMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {
            /* private mode */
          }
          return next;
        }),
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
