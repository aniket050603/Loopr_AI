import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO, getPalette, type BrutalPalette } from '../theme/theme';
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
        borderRadius: 9999,
        transition: 'transform 0.15s ease',
        '&:hover': { color: 'text.primary', borderColor: palette.text },
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      {mode === 'light' ? 'NIGHT' : 'DAY'}
    </Button>
  );
}

/** The Loopr mark with a small satellite slowly orbiting it. */
function OrbitMark({ p }: { p: BrutalPalette }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 84,
        height: 84,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {/* Orbit path */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px dashed ${p.green}55`,
        }}
      />
      {/* Satellite */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          animation: 'lorbit 12s linear infinite',
          '@keyframes lorbit': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -3,
            left: '50%',
            ml: '-3px',
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: p.amber,
            boxShadow: `0 0 12px 2px ${p.amber}88`,
          }}
        />
      </Box>
      {/* Core tile */}
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '12px',
          bgcolor: p.green,
          color: '#0B0F19',
          display: 'grid',
          placeItems: 'center',
          fontFamily: FONT_DISPLAY,
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1,
          pb: '3px',
          boxShadow: `0 0 32px ${p.green}44`,
        }}
      >
        L
      </Box>
    </Box>
  );
}

/** Slow-drifting aurora blobs rendered behind the sign-in form. */
function Aurora() {
  const blobs = [
    { color: 'rgba(34,197,94,0.16)', size: 420, top: '-12%', left: '-10%', delay: '0s' },
    { color: 'rgba(234,179,8,0.10)', size: 360, bottom: '-14%', right: '-8%', delay: '-6s' },
    { color: 'rgba(59,130,246,0.10)', size: 300, top: '30%', left: '55%', delay: '-3s' },
  ];
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {blobs.map((b, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            filter: 'blur(48px)',
            top: b.top,
            left: b.left,
            bottom: b.bottom,
            right: b.right,
            animation: `ldrift 18s ease-in-out infinite`,
            animationDelay: b.delay,
            '@keyframes ldrift': {
              '0%,100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(36px, -28px) scale(1.08)' },
              '66%': { transform: 'translate(-28px, 22px) scale(0.95)' },
            },
          }}
        />
      ))}
    </Box>
  );
}

const DEMO_EMAIL = 'demo@fin.com';
const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
  const { login, user } = useAuth();
  const theme = useTheme();
  const palette = usePalette();
  const { mode } = useLedgerMode();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
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
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Aurora />
          <Typography
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.18em',
              opacity: 0.6,
              position: 'relative',
            }}
          >
            FINANCIAL ANALYTICS · FY 2024
          </Typography>

          <Box sx={{ position: 'relative' }}>
            <OrbitMark p={ink} />
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: { md: 52, lg: 62 },
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                mt: 4,
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

          <Box sx={{ display: 'flex', gap: { md: 4, lg: 6 }, flexWrap: 'wrap', position: 'relative' }}>
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
            position: 'relative',
          }}
        >
          <Aurora />
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              mx: 'auto',
              position: 'relative',
              borderRadius: '16px',
              // Glass card: subtle frost over the aurora
              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(15,18,25,0.72)',
              backdropFilter: 'blur(14px)',
              border: `1px solid ${rule}`,
              boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
              px: { xs: 2.5, sm: 4 },
              py: { xs: 3.5, sm: 4.5 },
              my: { xs: 2, md: 0 },
            }}
          >
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
                sx={{
                  mt: 3,
                  py: 1.3,
                  borderRadius: '8px',
                  transition: 'transform 0.15s ease',
                  '&:not(:disabled):active': { transform: 'scale(0.98)' },
                }}
              >
                {loading ? 'Signing in…' : 'Enter the ledger'}
              </Button>
            </Box>

            {/* One-click demo fill */}
            <Button
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
                showAlert('Demo credentials filled', 'info');
              }}
              sx={{
                mt: 2,
                px: 1.5,
                py: 0.4,
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'text.secondary',
                border: `1px dashed ${rule}`,
                borderRadius: 9999,
                '&:hover': { color: 'text.primary', borderColor: palette.green },
              }}
            >
              use demo account ↺
            </Button>
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
