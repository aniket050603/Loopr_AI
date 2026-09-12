import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { useAuth } from '../auth/AuthContext';
import { useSummary } from '../hooks/useDashboardData';
import { showAlert } from '../components/SnackbarHost';
import SummaryCards from '../components/SummaryCards';
import Charts from '../components/Charts';
import TransactionsTable from '../components/TransactionsTable';
import type { TransactionFilters } from '../types';

const EMPTY_FILTERS: TransactionFilters = {};

export default function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const { data: summary, isLoading, error } = useSummary();

  if (error) {
    showAlert(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load analytics summary',
      'error',
    );
  }

  const rule = theme.palette.divider;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1560,
        mx: 'auto',
        px: { xs: 2.5, sm: 4, lg: 6 },
        py: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 3.5, md: 5 },
      }}
    >
      {/* Page header */}
      <Box id="overview" sx={{ scrollMarginTop: 24 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 2,
            flexWrap: 'wrap',
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
                fontSize: { xs: 28, md: 34 },
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
                mt: 0.5,
              }}
            >
              Financial Analytics
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 3, bgcolor: 'text.primary', mt: 1.5 }} />
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            pt: 1,
            fontFamily: FONT_MONO,
            fontSize: 11,
            color: 'text.secondary',
          }}
        >
          <Box component="span">
            VOL. {summary?.metrics.transactionCount ?? '—'} RECORDS
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            FY 2024
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            {user?.name?.toUpperCase() ?? user?.email?.toUpperCase()}
          </Box>
          <Box component="span" sx={{ ml: 'auto', display: { xs: 'none', md: 'inline' } }}>
            SOURCE · MONGODB ATLAS
          </Box>
        </Box>
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
              }}
            />
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
