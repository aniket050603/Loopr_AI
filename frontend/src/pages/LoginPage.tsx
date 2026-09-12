import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO, getPalette } from '../theme/theme';
import { useLedgerMode, usePalette } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import { showAlert } from '../components/SnackbarHost';

function ModeToggle() {
  const { mode, toggle } = useLedgerMode();
  const palette = usePalette();
  return (
    <Button
      onClick={toggle}
      aria-label="Toggle color mode"
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 0.5,
        fontFamily: FONT_MONO,
        fontSize: 10.5,
        letterSpacing: '0.1em',
        color: 'text.secondary',
        border: `1px solid ${palette.borderStrong}`,
        borderRadius: 999,
        '&:hover': { color: 'text.primary', borderColor: palette.text },
      }}
    >
      {mode === 'light' ? 'NIGHT' : 'DAY'}
    </Button>
  );
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const theme = useTheme();
  const palette = usePalette();
  const { mode } = useLedgerMode();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [email, setEmail] = useState('demo@fin.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showAlert('Login successful', 'success');
      navigate('/', { replace: true });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Unable to sign in. Please try again.';
      showAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const ink = getPalette(mode);
  const rule = theme.palette.divider;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2.5, md: 5 },
          py: 1.75,
          borderBottom: `1px solid ${rule}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              bgcolor: ink.ink,
              color: ink.inkText,
              display: 'grid',
              placeItems: 'center',
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
              pb: '2px',
            }}
          >
            L
          </Box>
          <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 15.5, fontWeight: 600 }}>
            Loopr
          </Typography>
        </Box>
        <ModeToggle />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
        }}
      >
        {/* Brand panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: ink.ink,
            color: ink.inkText,
            p: { md: 5, lg: 6 },
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.18em',
              opacity: 0.6,
            }}
          >
            FINANCIAL ANALYTICS · FY 2024
          </Typography>

          <Box>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: { md: 52, lg: 62 },
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
              }}
            >
              Every cent,
              <br />
              on the record.
            </Typography>
            <Typography sx={{ mt: 3, fontSize: 15, lineHeight: 1.7, opacity: 0.72, maxWidth: 420 }}>
              A precise ledger of revenue and expense — filter it, sort it, search it, and take
              exactly the columns you need as CSV.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: { md: 4, lg: 6 }, flexWrap: 'wrap' }}>
            {[
              ['300', 'records'],
              ['4', 'users'],
              ['12', 'months'],
              ['CSV', 'export'],
            ].map(([v, l]) => (
              <Box key={l}>
                <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600 }}>
                  {v}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    opacity: 0.55,
                    mt: 0.25,
                  }}
                >
                  {l}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Form panel */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 2.5, sm: 6, md: 5, lg: 7 },
            py: { xs: 4, md: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <Typography
              sx={{
                display: { md: 'none' },
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 34,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              Every cent, on the record.
            </Typography>

            <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600 }}>
              Sign in
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'text.secondary' }}>
              Demo credentials are pre-filled below.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                sx={{ mt: 2.25 }}
              />
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, py: 1.3, borderRadius: '6px' }}
              >
                {loading ? 'Signing in…' : 'Enter the ledger'}
              </Button>
            </Box>

            <Typography
              sx={{
                mt: 3,
                pt: 2,
                borderTop: `1px solid ${rule}`,
                fontFamily: FONT_MONO,
                fontSize: 11.5,
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              demo@fin.com · demo1234
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 5 },
          py: 1.75,
          borderTop: `1px solid ${rule}`,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          © {new Date().getFullYear()} Loopr
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          JWT · MongoDB · React
        </Typography>
      </Box>
    </Box>
  );
}
