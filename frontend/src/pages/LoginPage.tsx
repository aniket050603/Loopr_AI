import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { usePalette } from '../theme/ThemeModeProvider';
import { useLedgerMode } from '../theme/ThemeModeProvider';
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
        fontSize: 11,
        letterSpacing: '0.1em',
        color: 'text.secondary',
        border: `1px solid ${palette.border}`,
        borderRadius: 999,
        '&:hover': { color: 'text.primary', borderColor: palette.borderStrong },
      }}
    >
      {mode === 'light' ? 'NIGHT' : 'DAY'}
    </Button>
  );
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
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

  const rule = theme.palette.divider;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2.5, sm: 5 },
          py: 2,
          borderBottom: `1px solid ${rule}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'text.secondary',
          }}
        >
          FINANCIAL ANALYTICS
        </Typography>
        <ModeToggle />
      </Box>

      {/* Center */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
          alignItems: 'center',
          gap: { xs: 4, md: 8 },
          px: { xs: 2.5, sm: 5 },
          py: { xs: 4, md: 6 },
          maxWidth: 1080,
          width: '100%',
          mx: 'auto',
        }}
      >
        {/* Masthead */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'accent.main',
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Transactions · Analytics · Ledger
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: { xs: 44, md: 58 },
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              mt: 1.5,
            }}
          >
            The Ledger.
          </Typography>
          <Typography sx={{ mt: 2, fontSize: 15.5, color: 'text.secondary', maxWidth: 380, lineHeight: 1.65 }}>
            A quiet, precise view of revenue and expense — filterable, sortable, and exportable
            down to the last cent.
          </Typography>
          <Divider sx={{ my: 3, borderColor: rule }} />
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              ['300', 'records'],
              ['4', 'users'],
              ['12', 'months'],
            ].map(([v, l]) => (
              <Box key={l}>
                <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600 }}>
                  {v}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  {l}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            bgcolor: 'background.paper',
            border: `1px solid ${rule}`,
            borderRadius: '10px',
            p: { xs: 3, md: 4 },
          }}
        >
          <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600 }}>
            Sign in
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'text.secondary' }}>
            Use the demo credentials below.
          </Typography>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2.5, py: 1.3, borderRadius: '6px' }}
          >
            {loading ? 'Signing in…' : 'Enter the ledger'}
          </Button>

          <Typography
            sx={{
              mt: 2.5,
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

      {/* Footer line */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 5 },
          py: 2,
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
