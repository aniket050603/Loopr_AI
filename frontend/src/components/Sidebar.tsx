import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Box, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import { LayoutGrid, ArrowLeftRight, BarChart3, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  getPalette,
  FONT_DISPLAY,
  FONT_UI,
} from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import { LooprWordmark, LooprMark } from './brand';

export const NAV = [
  { label: 'Dashboard', icon: LayoutGrid, target: 'overview' },
  { label: 'Analytics', icon: BarChart3, target: 'breakdowns' },
  { label: 'Transactions', icon: ArrowLeftRight, target: 'transactions' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/** Sidebar jump-to-section navigation. Collapses to an icon rail on desktop. */
export default function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const theme = useTheme();
  const { user } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { hash } = useLocation();
  const navigate = useNavigate();
  if (!isDesktop) return null;

  const jump = (target: string) => {
    navigate(`/#${target}`);
    requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: p.panel,
        borderRight: `1px solid ${p.edge}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        overflow: 'hidden',
      }}
    >
      {/* Brand row — always-visible sidebar toggle, never hover-only */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: collapsed ? 1 : 0,
          px: collapsed ? 0 : 2,
          py: collapsed ? 1.5 : 0,
          height: collapsed ? 'auto' : 58,
        }}
      >
        {collapsed ? <LooprMark size={32} /> : <LooprWordmark />}
        <Tooltip
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          placement={collapsed ? 'right' : 'bottom'}
        >
          <IconButton
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              borderRadius: '8px',
              border: `1px solid ${p.edge}`,
              bgcolor: p.panelAlt,
              color: p.text,
              transition: 'color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
              '&:hover': { color: p.green, borderColor: p.green },
              '&:active': { transform: 'scale(0.94)' },
            }}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1, mb: 2 }} disablePadding>
        {NAV.map((item) => {
          const active = hash === `#${item.target}`;
          const Icon = item.icon;
          return (
            <Tooltip
              key={item.label}
              title={item.label}
              placement="right"
              disableHoverListener={!collapsed}
              disableFocusListener
              disableTouchListener
            >
              <ListItemButton
                component={RRNavLink}
                to={`#${item.target}`}
                onClick={() => jump(item.target)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  width: '100%',
                  py: 1.5,
                  px: collapsed ? 0 : 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  minHeight: 48,
                  borderRadius: '4px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  bgcolor: active ? p.panelAlt : p.panel,
                  transition: 'background-color 180ms ease, transform 150ms ease',
                  '&:hover': {
                    bgcolor: p.panelAlt,
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
                    whiteSpace: 'nowrap',
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
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer segment — avatar always; name/email only when expanded */}
      <Box
        sx={{
          borderTop: `1px solid ${p.edge}`,
          marginTop: 'auto',
          padding: collapsed ? '14px 0' : '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 1.75,
          flexShrink: 0,
          transition: 'padding 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          title={user?.email ?? ''}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
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
        {!collapsed && (
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
        )}
      </Box>
    </Box>
  );
}
