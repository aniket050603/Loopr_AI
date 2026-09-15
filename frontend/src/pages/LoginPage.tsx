import { useEffect, useState, type FormEvent } from 'react';
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
import { LooprMark } from '../components/brand';
import { LoginIntro } from '../components/LoginIntro';
import { wakeApi } from '../api/client';

const DEMO_EMAIL = 'demo@fin.com';
const DEMO_PASSWORD = 'demo1234';

/** sessionStorage flag: the intro plays at most once per browser session. */
const INTRO_SEEN_KEY = 'loopr-intro-seen';

/** Whether this visit should still see the intro (skipped for reduced motion). */
function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // ?intro=1 forces a replay — handy for demos and QA.
  if (new URLSearchParams(window.location.search).has('intro')) return true;
  return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
}

/** Ink color used on top of the green accent (brand constant). */
const INK_ON_ACCENT = '#0B0F19';

type AuthMode = 'signin' | 'register';

/** Human-readable message from an axios error, with a safe fallback. */
function apiErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

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

/** Segmented Sign in / Create account switch. */
function AuthTabs({
  mode,
  onChange,
  rule,
}: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  rule: string;
}) {
  const tabs: { id: AuthMode; label: string }[] = [
    { id: 'signin', label: 'SIGN IN' },
    { id: 'register', label: 'CREATE ACCOUNT' },
  ];
  return (
    <Box
      role="tablist"
      aria-label="Authentication mode"
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        border: `1px solid ${rule}`,
        borderRadius: '10px',
        p: 0.4,
        gap: 0.4,
        bgcolor: 'transparent',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === mode;
        return (
          <Button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            sx={{
              py: 0.9,
              borderRadius: '7px',
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.12em',
              fontWeight: active ? 700 : 500,
              color: active ? INK_ON_ACCENT : 'text.secondary',
              bgcolor: active ? (theme) => theme.palette.primary.main : 'transparent',
              transition: 'background-color 0.2s ease, color 0.2s ease',
              '&:hover': { bgcolor: active ? undefined : 'action.hover' },
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
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
          color: INK_ON_ACCENT,
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

/** Slow-drifting aurora blobs, confined to their panel via the parent's overflow: hidden. */
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

/** Row of headline stats on the brand panel. */
function BrandStats() {
  const stats: [string, string][] = [
    ['300', 'records'],
    ['4', 'users'],
    ['12', 'months'],
    ['CSV', 'export'],
  ];
  return (
    <Box sx={{ display: 'flex', gap: { md: 4, lg: 6 }, flexWrap: 'wrap', position: 'relative' }}>
      {stats.map(([value, label]) => (
        <Box key={label}>
          <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600 }}>
            {value}
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
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const theme = useTheme();
  const palette = usePalette();
  const { mode: colorMode } = useLedgerMode();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const [introLeaving, setIntroLeaving] = useState(false);

  // Start waking the API the moment the login page appears (Render cold starts).
  useEffect(() => {
    void wakeApi();
  }, []);

  const rule = theme.palette.divider;
  const ink = getPalette(colorMode);
  const isRegister = authMode === 'register';

  if (user) {
    return <Navigate to="/" replace />;
  }

  /** Runs an auth action, reports the outcome, and enters the dashboard on success. */
  async function runAuth(action: () => Promise<void>, successMessage: string, fallbackError: string): Promise<void> {
    setLoading(true);
    try {
      await action();
      showAlert(successMessage, 'success');
      navigate('/', { replace: true });
    } catch (error: unknown) {
      showAlert(apiErrorMessage(error, fallbackError), 'error');
    } finally {
      setLoading(false);
    }
  }

  /** Fades the intro out, then unmounts it; remembered for the session. */
  function finishIntro(): void {
    if (introLeaving) return;
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    setIntroLeaving(true);
    window.setTimeout(() => setShowIntro(false), 700);
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (isRegister) {
      void runAuth(() => register(name.trim(), email, password), 'Account created', 'Unable to create the account. Please try again.');
    } else {
      void runAuth(() => login(email, password), 'Login successful', 'Unable to sign in. Please try again.');
    }
  }

  function handleDemoLogin(): void {
    void runAuth(() => login(DEMO_EMAIL, DEMO_PASSWORD), 'Signed in with the demo account', 'Demo sign-in failed. Please try again.');
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: brand panel — no header bar; brand + toggle live inside the split */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: ink.ink,
          color: ink.inkText,
          p: { md: 4, lg: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Aurora />

        {/* Panel-internal brand row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <LooprMark size={26} />
            <Typography
              sx={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: ink.inkText }}
            >
              Loopr
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.18em',
              opacity: 0.55,
            }}
          >
            FINANCIAL ANALYTICS · FY 2024
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <OrbitMark p={ink} />
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: { md: 48, lg: 60 },
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

        <BrandStats />
      </Box>

      {/* RIGHT: form panel — no footer bar; copyright sits quietly at the bottom */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Aurora />

        {/* Panel-internal utility row — theme toggle only on mobile (desktop has it on the left panel) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            px: { xs: 2.5, md: 4, lg: 5 },
            pt: { xs: 2, md: 3 },
            position: 'relative',
          }}
        >
          {isDesktop ? null : <ModeToggle />}
        </Box>

        {/* Centered form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 2.5, sm: 6, md: 5, lg: 7 },
            py: { xs: 4, md: 4 },
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              position: 'relative',
              borderRadius: '16px',
              bgcolor: colorMode === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(15,18,25,0.72)',
              backdropFilter: 'blur(14px)',
              border: `1px solid ${rule}`,
              boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
              px: { xs: 2.5, sm: 4 },
              py: { xs: 3.5, sm: 4.5 },
            }}
          >
            {/* Mobile-only compact headline (left panel is hidden) */}
            <Box sx={{ display: { md: 'none' }, mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                <LooprMark size={24} />
                <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700 }}>
                  Loopr
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 30,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                }}
              >
                Every cent, on the record.
              </Typography>
            </Box>

            <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600 }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'text.secondary' }}>
              {isRegister
                ? 'A JWT session is issued the moment you register.'
                : 'Demo credentials are pre-filled below.'}
            </Typography>

            <Box sx={{ mt: 2.5 }}>
              <AuthTabs mode={authMode} onChange={setAuthMode} rule={rule} />
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
              {isRegister && (
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  autoComplete="name"
                  helperText="Optional — defaults to your email handle."
                />
              )}
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
                sx={isRegister ? { mt: 2 } : undefined}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                helperText={isRegister ? 'At least 6 characters.' : undefined}
                sx={{ mt: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2.5,
                  py: 1.3,
                  borderRadius: '8px',
                  transition: 'transform 0.15s ease',
                  '&:not(:disabled):active': { transform: 'scale(0.98)' },
                }}
              >
                {loading
                  ? isRegister
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isRegister
                    ? 'Create account'
                    : 'Enter the ledger'}
              </Button>
            </Box>

            {/* One-click demo login */}
            <Button
              onClick={handleDemoLogin}
              disabled={loading}
              fullWidth
              sx={{
                mt: 1.5,
                py: 0.9,
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'text.secondary',
                border: `1px dashed ${rule}`,
                borderRadius: '8px',
                '&:hover': { color: 'text.primary', borderColor: palette.green },
              }}
            >
              SIGN IN AS DEMO — SKIP THE FORM
            </Button>
          </Box>
        </Box>

        {/* Quiet footer inside the panel — no border, blends in */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2.5, md: 4, lg: 5 },
            pb: { xs: 2, md: 3 },
            position: 'relative',
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

      {/* Cinematic particle intro — plays once per session, click/keys to skip */}
      {showIntro && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            opacity: introLeaving ? 0 : 1,
            pointerEvents: introLeaving ? 'none' : 'auto',
            transition: 'opacity 0.7s ease',
          }}
        >
          <LoginIntro onFinish={finishIntro} mode={colorMode} />
        </Box>
      )}
    </Box>
  );
}
