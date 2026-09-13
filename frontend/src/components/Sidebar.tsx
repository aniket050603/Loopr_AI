import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { LayoutGrid, ArrowLeftRight, BarChart3 } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SIDEBAR_WIDTH, getPalette, type BrutalPalette, FONT_DISPLAY, FONT_UI } from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import { LooprWordmark } from './brand';

export const NAV = [
  { label: 'Dashboard', icon: LayoutGrid, target: 'overview' },
  { label: 'Analytics', icon: BarChart3, target: 'breakdowns' },
  { label: 'Transactions', icon: ArrowLeftRight, target: 'transactions' },
];

export default function Sidebar() {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const theme = useTheme();
  const { user } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { hash } = useLocation();
  const navigate = useNavigate();
  if (!isDesktop) return null;

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        bgcolor: p.panel,
        borderRight: `1px solid ${p.edge}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <LooprWordmark />
      </Box>

      <Box sx={{ px: 1 }} />

      {/* Nav */}
      <List sx={{ px: 1, mx: 'auto', mb: 2 }} disablePadding>
        {NAV.map((item) => {
          const active = hash === `#${item.target}`;
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.label}
              component={RRNavLink}
              to={`#${item.target}`}
              onClick={() => {
                navigate(`/#${item.target}`);
                requestAnimationFrame(() => {
                  document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%',
                py: 1.5,
                px: 2,
                borderRadius: '4px',
                textAlign: 'left',
                justifyContent: 'space-between',
                cursor: 'pointer',
                bgcolor: active ? p.panelAlt : p.panel,
                transition: 'background-color 180ms ease, transform 150ms ease, border-color 180ms ease',
                '&:hover': {
                  bgcolor: active ? p.panelAlt : p.panelAlt,
                  transform: 'translateX(1px)',
                },
                borderRight: active ? `3px solid ${p.green}` : '3px solid transparent',
                '& .MuiListItemIcon-root': {
                  minWidth: 28,
                  color: active ? p.green : p.muted,
                  transition: 'color 150ms ease',
                },
                '& .MuiListItemText-primary': {
                  color: active ? p.green : p.text,
                  fontWeight: active ? 800 : 500,
                  letterSpacing: '0.01em',
                  fontFamily: FONT_UI,
                  fontSize: 14,
                  transition: 'color 150ms ease',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                  bgcolor: p.panelAlt,
                },
              }}
            >
              <ListItemIcon>
                <Icon size={20} strokeWidth={1.75} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer segment */}
      <Box
        sx={{
          borderTop: `1px solid ${p.edge}`,
          marginTop: 'auto',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: p.green,
            display: 'grid',
            placeItems: 'center',
            color: '#0B0F19',
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ color: p.text, fontWeight: 700, fontSize: 13.5, display: 'block', fontFamily: FONT_UI, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {user?.name ?? 'User'}
          </Typography>
          <Typography
            sx={{ color: p.muted, fontSize: 11, display: 'block', fontFamily: FONT_UI, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {user?.email ?? ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
