import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { usePalette } from '../theme/ThemeModeProvider';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import { useSummary } from '../hooks/useDashboardData';
import { showAlert } from '../components/SnackbarHost';
import SummaryCards from '../components/SummaryCards';
import Charts from '../components/Charts';
import TransactionsTable from '../components/TransactionsTable';

import type { TransactionFilters } from '../types';

const EMPTY_FILTERS: TransactionFilters = {};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const palette = usePalette();
  const { mode, toggle } = useLedgerMode();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const { data: summary, isLoading, error } = useSummary();

  if (error) {
    showAlert(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load analytics summary',
      'error',
    );
  }

  const rule = theme.palette.divider;
  const currency0 = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 5 } }}>
      {/* Masthead */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            pb: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'accent.main',
                fontFamily: FONT_MONO,
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Overview
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: { xs: 30, md: 36 },
                lineHeight: 1.05,
                letterSpacing: '-0.015em',
                mt: 0.5,
              }}
            >
              Financial Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 1 }}>
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
                border: `1px solid ${rule}`,
                borderRadius: 999,
                '&:hover': { color: 'text.primary', borderColor: palette.borderStrong },
              }}
            >
              {mode === 'light' ? 'NIGHT' : 'DAY'}
            </Button>
            <Button
              variant="outlined"
              onClick={logout}
              sx={{
                px: 1.75,
                py: 0.5,
                fontFamily: FONT_MONO,
                fontSize: 11,
                letterSpacing: '0.1em',
                borderRadius: 999,
              }}
            >
              EXIT
            </Button>
          </Box>
        </Box>
        <Box sx={{ height: 3, bgcolor: 'text.primary' }} />
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 84,
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.text.primary, 0.05),
                animation: 'lpulse 1.4s ease-in-out infinite',
                '@keyframes lpulse': { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
              }}              />
          ))}
        </Box>
      ) : summary ? (
        <>
          <SummaryCards summary={summary} />
          <Charts summary={summary} />
        </>
      ) : (
        !error && <Alert severity="info">No analytics available.</Alert>
      )}

      <TransactionsTable filters={filters} onFiltersChange={setFilters} />
    </Box>
  );
}
