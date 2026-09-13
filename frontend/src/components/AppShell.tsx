import { useState, type ReactNode } from 'react';import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, getPalette, FONT_UI } from '../theme/theme';
import { useLedgerMode, usePalette } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import Sidebar, { NAV } from './Sidebar';
import { LooprWordmark } from './brand';

function ModeToggle() {
  const { mode, toggle } = useLedgerMode();
  const palette = usePalette();
  return (
    <IconButton
      onClick={toggle}
      aria-label="Toggle color mode"
      sx={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        bgcolor: palette.paper,
        border: `1px solid ${palette.edge}`,
        color: palette.muted,
        fontSize: 13,
        transition: 'all 0.18s ease',
        '&:hover': { color: palette.text, borderColor: palette.green },
      }}
    >
      {mode === 'light' ? '🌙' : '☀'}
    </IconButton>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('loopr-sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem('loopr-sidebar-collapsed', c ? '0' : '1');
      } catch { /* private mode */ }
      return !c;
      });
  };

  const jumpTo = (target: string) => {
    navigate(`/#${target}`);
    requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const navList = (
    <List disablePadding sx={{ px: 1 }}>
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Box
            key={item.label}
            component="button"
            onClick={() => {
              setDrawerOpen(false);
              jumpTo(item.target);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              py: 1.4,
              px: 2,
              mb: 0.5,
              border: 'none',
              borderRadius: '4px',
              textAlign: 'left',
              cursor: 'pointer',
              bgcolor: 'transparent',
              color: p.text,
              fontFamily: FONT_UI,
              fontSize: 14,
              '&:hover': { bgcolor: p.panelAlt },
              '& svg': { color: p.muted },
            }}
          >
            <Icon size={20} strokeWidth={1.75} />
            {item.label}
          </Box>
        );
      })}
    </List>
  );

  const railWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: p.panel }}>
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          ml: { md: `${railWidth}px` },
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top bar */}
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
            px: { xs: 2, sm: 3, md: 4 },
            py: 1.25,
            bgcolor: (t) => alpha(t.palette.background.default, 0.85),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${p.edge}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isDesktop && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
                sx={{ color: p.muted, '&:hover': { color: p.text } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              sx={{
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: 16,
                color: p.text,
                letterSpacing: '-0.01em',
              }}
            >
              Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <ModeToggle />

            <IconButton
              onClick={logout}
              aria-label="Sign out"
              title={user?.email ?? ''}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: p.paper,
                border: `1px solid ${p.edge}`,
                color: p.text,
                fontFamily: FONT_UI,
                fontSize: 12.5,
                fontWeight: 700,
                transition: 'all 0.18s ease',
                '&:hover': { color: p.red, borderColor: p.red },
              }}
            >
              {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
            </IconButton>
          </Box>
        </Box>

        {children}
      </Box>

      {/* Mobile nav drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            bgcolor: p.panel,
            borderRight: `1px solid ${p.edge}`,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.75 }}>
          <LooprWordmark size="sm" />
        </Box>
        {navList}
      </Drawer>
    </Box>
  );
}
