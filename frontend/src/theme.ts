import { createTheme } from '@mui/material/styles';

/** Dark "premium fintech" theme — deep navy surfaces, indigo→violet accents, Inter. */
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366F1' },
    secondary: { main: '#22D3EE' },
    success: { main: '#34D399' },
    error: { main: '#F87171' },
    warning: { main: '#FBBF24' },
    info: { main: '#38BDF8' },
    background: { default: '#070B14', paper: '#0E1526' },
    text: { primary: '#F1F5F9', secondary: '#8B98B4' },
    divider: 'rgba(148,163,184,0.12)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter Variable", "Inter", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#070B14', scrollbarColor: '#334155 transparent' },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(148,163,184,0.10)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, backgroundColor: 'rgba(148,163,184,0.06)' },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderColor: 'rgba(148,163,184,0.10)' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiDialog: { styleOverrides: { paper: { backgroundImage: 'none' } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontWeight: 500 } } },
  },
});
