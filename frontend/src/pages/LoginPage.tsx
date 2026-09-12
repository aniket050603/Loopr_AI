import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { useAuth } from '../auth/AuthContext';
import { showAlert } from '../components/SnackbarHost';

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(1200px 800px at 85% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(900px 700px at -10% 110%, rgba(34,211,238,0.12), transparent 55%), #070B14',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 560,
          height: 560,
          borderRadius: '50%',
          top: -220,
          right: -140,
          background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 460,
          height: 460,
          borderRadius: '50%',
          bottom: -200,
          left: -120,
          background: 'radial-gradient(circle, rgba(34,211,238,0.22), transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          position: 'relative',
          bgcolor: 'rgba(14,21,38,0.7)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(148,163,184,0.14)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '18px',
              display: 'grid',
              placeItems: 'center',
              mb: 1,
              color: '#fff',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #22D3EE 130%)',
              boxShadow: '0 12px 32px rgba(99,102,241,0.45)',
            }}
          >
            <KeyOutlinedIcon fontSize="large" />
          </Box>
          <Typography component="h1" variant="h5" fontWeight={800} letterSpacing="-0.02em">
            Financial Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to view analytics and manage transactions
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
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
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2.5,
                color: '#fff',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #22D3EE 140%)',
                boxShadow: '0 12px 30px rgba(99,102,241,0.4)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 16px 40px rgba(99,102,241,0.55)',
                },
                '&:disabled': {
                  color: '#fff',
                  opacity: 0.6,
                },
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: 3,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              color: 'text.secondary',
              border: '1px dashed',
              borderColor: (t) => alpha(t.palette.text.secondary, 0.3),
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
            }}
          >
            demo@fin.com / demo1234
          </Typography>
        </Box>
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ position: 'absolute', bottom: 16, opacity: 0.6 }}
      >
        {theme.palette.mode === 'dark' ? 'Secure · JWT authenticated' : ''}
      </Typography>
    </Box>
  );
}
