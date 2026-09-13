import { createTheme } from '@mui/material/styles';

type BrutalPalette = {
  /* surfaces */
  panel: string;
  panelAlt: string;
  paper: string;
  /* lines */
  edge: string;
  border: string;
  borderStrong: string;
  /* type */
  text: string;
  muted: string;
  /* accents */
  green: string;
  amber: string;
  red: string;
  softGreen: string;
  softAmber: string;
  /* kept for LoginPage ink panel */
  ink: string;
  inkText: string;
};

export type LedgerMode = 'light' | 'dark';
export type Palette = BrutalPalette;
export type { BrutalPalette };

export const BRUTAL: BrutalPalette = {
  panel: '#0F1219',
  panelAlt: '#181C27',
  paper: '#161A24',
  edge: '#2C3140',
  border: '#2C3140',
  borderStrong: '#3A4150',
  text: '#F5F6F8',
  muted: '#A0A7B5',
  green: '#22C55E',
  amber: '#EAB308',
  red: '#EF4444',
  softGreen: 'rgba(34,197,94,0.12)',
  softAmber: 'rgba(234,179,8,0.12)',
  ink: '#0B0F19',
  inkText: '#FFFFFF',
};

const LIGHT: BrutalPalette = {
  panel: '#F6F7F9',
  panelAlt: '#ECEEF2',
  paper: '#FFFFFF',
  edge: '#DCE0E8',
  border: '#DCE0E8',
  borderStrong: '#C3C9D4',
  text: '#14181F',
  muted: '#5B6472',
  green: '#16A34A',
  amber: '#D97706',
  red: '#DC2626',
  softGreen: 'rgba(22,163,74,0.12)',
  softAmber: 'rgba(217,119,6,0.12)',
  ink: '#0B0F19',
  inkText: '#FFFFFF',
};

export function getPalette(mode: LedgerMode): BrutalPalette {
  return mode === 'light' ? LIGHT : BRUTAL;
}

export const FONT_DISPLAY = '"Fraunces", Georgia, "Times New Roman", serif';
export const FONT_MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
export const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const SIDEBAR_WIDTH = 248;

export function buildTheme(mode: LedgerMode) {
  const p = getPalette(mode);
  return createTheme({
    palette: {
      mode,
      primary: {
        main: p.green,
        contrastText: mode === 'light' ? '#FFFFFF' : '#0B0F19',
      },
      background: { default: p.panel, paper: p.paper },
      text: { primary: p.text, secondary: p.muted },
      divider: p.edge,
      success: { main: p.green },
      warning: { main: p.amber },
    },
    spacing: 8,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: FONT_UI,
      h6: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.panel,
            color: p.text,
            scrollbarColor: `${p.edge} transparent`,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': { width: 6, height: 6 },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 20,
              backgroundColor: p.edge,
            },
          },
          /* Theme toggle: circular wipe expanding from the toggle button */
          '::view-transition-old(root)': {
            animation: 'none',
            mixBlendMode: 'normal',
          },
          '@keyframes wipeIn': {
            from: { clipPath: 'circle(0% at var(--wipe-x, 90%) var(--wipe-y, 5%))' },
            to: { clipPath: 'circle(150% at var(--wipe-x, 90%) var(--wipe-y, 5%))' },
          },
          '::view-transition-new(root)': {
            animation: 'wipeIn 0.5s ease-in-out',
            mixBlendMode: 'normal',
            zIndex: 1,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 6 } },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: p.text,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { borderRadius: 8, fontWeight: 600 } },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: p.green },
            },
          },
        },
      },
    },
  });
}
