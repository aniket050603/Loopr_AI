import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { FONT_DISPLAY, FONT_MONO, getPalette, type LedgerMode } from '../theme/theme';
import { useLedgerMode, usePalette } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';

function Wordmark({ mode }: { mode: LedgerMode }) {
  const p = getPalette(mode);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 27,
          height: 27,
          borderRadius: '8px',
          bgcolor: p.ink,
          color: p.inkText,
          display: 'grid',
          placeItems: 'center',
          fontFamily: FONT_DISPLAY,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1,
          pb: '2px',
        }}
      >
        L
      </Box>
      <Typography
        sx={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        Loopr
      </Typography>
    </Box>
  );
}

function LiveDot() {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontFamily: FONT_MONO,
        fontSize: 10.5,
        letterSpacing: '0.12em',
        color: 'text.secondary',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: 'success.main',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'success.main',
            opacity: 0.6,
            animation: 'livePulse 2s ease-out infinite',
          },
          '@keyframes livePulse': {
            '0%': { transform: 'scale(0.5)', opacity: 0.8 },
            '100%': { transform: 'scale(1.4)', opacity: 0 },
          },
        }}
      />
      LIVE
    </Box>
  );
}

const NAV_ITEMS = [
  { label: 'Overview', target: 'overview' },
  { label: 'Breakdowns', target: 'breakdowns' },
  { label: 'Transactions', target: 'transactions' },
];

function NavPills() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: { xs: 'none', lg: 'flex' },
        alignItems: 'center',
        gap: 0.5,
        bgcolor: (t) => alpha(t.palette.text.primary, 0.045),
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 999,
        p: '3px',
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.label}
          onClick={() => {
            navigate(`/#${item.target}`);
            requestAnimationFrame(() => {
              document
                .getElementById(item.target)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }}
          sx={{
            px: 1.75,
            py: 0.4,
            fontSize: 12.5,
            fontWeight: 600,
            color: 'text.secondary',
            borderRadius: 999,
            '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
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
        px: 1.4,
        py: 0.45,
        fontFamily: FONT_MONO,
        fontSize: 10.5,
        letterSpacing: '0.1em',
        color: 'text.secondary',
        border: `1px solid ${palette.borderStrong}`,
        borderRadius: 999,
        transition: 'all 0.18s ease',
        '&:hover': { color: 'text.primary', borderColor: palette.text },
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      {mode === 'light' ? 'NIGHT' : 'DAY'}
    </Button>
  );
}

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const palette = usePalette();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          width: 1,
          px: { xs: 2.5, sm: 4, lg: 6 },
          py: 1.4,
          bgcolor: (t) => alpha(t.palette.background.default, 0.82),
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3 } }}>
          <Wordmark mode={theme.palette.mode} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <LiveDot />
          </Box>
        </Box>

        <NavPills />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <ModeToggle />
          <Tooltip title={user?.email ?? ''}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pl: 0.75,
                pr: { xs: 0.75, md: 1.25 },
                py: 0.4,
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                bgcolor: 'background.paper',
                cursor: 'default',
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 11.5,
                  fontWeight: 700,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                  color: 'primary.main',
                }}
              >
                {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
              </Box>
              <Typography
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontSize: 12.5,
                  fontWeight: 600,
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name?.split(' ')[0] ?? 'User'}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Sign out">
            <IconButton
              onClick={logout}
              aria-label="Sign out"
              sx={{
                color: 'text.secondary',
                border: `1px solid ${palette.border}`,
                borderRadius: '50%',
                width: 36,
                height: 36,
                transition: 'all 0.18s ease',
                '&:hover': { color: 'error.main', borderColor: 'error.main' },
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
