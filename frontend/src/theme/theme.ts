import { createTheme } from '@mui/material/styles';

export type LedgerMode = 'light' | 'dark';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  accentInk: string;
  up: string;
  down: string;
  warn: string;
  grid: string;
  chartTip: string;
}

const LIGHT: Palette = {
  bg: '#F6F4EF',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEDE6',
  border: '#E2DFD6',
  borderStrong: '#D6D2C4',
  text: '#191813',
  muted: '#6B675C',
  faint: '#A8A399',
  accent: '#0F7B5F',
  accentInk: '#FFFFFF',
  up: '#0F7B5F',
  down: '#B3392E',
  warn: '#946200',
  grid: '#E9E6DE',
  chartTip: '#FFFFFF',
};

const DARK: Palette = {
  bg: '#131512',
  surface: '#1A1C18',
  surfaceAlt: '#22251F',
  border: '#2C2F28',
  borderStrong: '#3A3E35',
  text: '#EDEBE3',
  muted: '#9BA08F',
  faint: '#6E7365',
  accent: '#5BBFA0',
  accentInk: '#10231C',
  up: '#5BBFA0',
  down: '#E07A6E',
  warn: '#D9A94A',
  grid: '#262922',
  chartTip: '#1A1C18',
};

export function getPalette(mode: LedgerMode): Palette {
  return mode === 'dark' ? DARK : LIGHT;
}

export const FONT_DISPLAY = '"Fraunces", Georgia, "Times New Roman", serif';
export const FONT_MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
export const FONT_UI =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function buildTheme(mode: LedgerMode) {
  const p = getPalette(mode);
  return createTheme({
    palette: {
      mode,
      primary: { main: p.accent, contrastText: p.accentInk },
      success: { main: p.up },
      error: { main: p.down },
      warning: { main: p.warn },
      background: { default: p.bg, paper: p.surface },
      text: { primary: p.text, secondary: p.muted },
      divider: p.border,
    },
    shape: { borderRadius: 6 },
    typography: {
      fontFamily: FONT_UI,
      h4: { fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontFamily: FONT_DISPLAY, fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
      caption: { fontFamily: FONT_MONO, letterSpacing: '0.04em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: p.bg, scrollbarColor: `${p.borderStrong} transparent` },
          '::selection': { backgroundColor: p.accent, color: p.accentInk },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none', border: `1px solid ${p.border}` },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 4 },
          outlined: { borderColor: p.borderStrong, color: p.text },
        },
      },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 4, backgroundColor: p.surface },
          notchedOutline: { borderColor: p.borderStrong },
        },
      },
      MuiTableCell: { styleOverrides: { root: { borderColor: p.border } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 4, fontWeight: 500 } } },
      MuiDialog: { styleOverrides: { paper: { backgroundImage: 'none' } } },
    },
  });
}
