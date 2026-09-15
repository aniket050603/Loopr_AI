import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
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

/** Avatar button that opens an account menu with an explicit sign-out action. */
function UserMenu() {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const initial = (user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase();

  return (
    <>
      <Tooltip title="Account & sign out" arrow>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: p.green,
            color: '#0B0F19',
            fontFamily: FONT_UI,
            fontSize: 12.5,
            fontWeight: 700,
            outline: open ? `2px solid ${p.text}` : 'none',
            outlineOffset: 2,
            transition: 'all 0.18s ease',
            '&:hover': { filter: 'brightness(1.08)' },
          }}
        >
          {initial}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              minWidth: 224,
              borderRadius: '10px',
              border: `1px solid ${p.edge}`,
              bgcolor: p.paper,
              boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, pt: 1, pb: 0.75 }}>
          <Typography sx={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 13.5, color: p.text }}>
            {user?.name ?? 'Signed in'}
          </Typography>
          <Typography sx={{ fontFamily: FONT_UI, fontSize: 12, color: p.muted }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: p.edge }} />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            logout();
          }}
          sx={{
            gap: 1,
            fontFamily: FONT_UI,
            fontSize: 13.5,
            color: p.text,
            py: 1.1,
            '& .MuiListItemIcon-root': { minWidth: 32, color: p.muted },
            '&:hover': { bgcolor: 'action.hover', color: p.red, '& .MuiListItemIcon-root': { color: p.red } },
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
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
            <UserMenu />
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
