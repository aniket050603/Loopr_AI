import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { alpha } from '@mui/material/styles';
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
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const { data: summary, isLoading, error } = useSummary();

  if (error) {
    showAlert(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load analytics summary',
      'error',
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          pb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '14px',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #22D3EE 130%)',
              boxShadow: '0 10px 28px rgba(99,102,241,0.4)',
            }}
          >
            <ShowChartIcon />
          </Box>
          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              letterSpacing="-0.02em"
              sx={{
                background: 'linear-gradient(90deg, #F1F5F9 30%, #A5B4FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Financial Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {user?.name ?? user?.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              fontSize: 14,
              fontWeight: 700,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
              color: 'primary.light',
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.primary.main, 0.4),
            }}
          >
            {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
          </Avatar>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ borderRadius: 2.5 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 96,
                borderRadius: 3,
                bgcolor: 'rgba(148,163,184,0.06)',
                animation: 'pulse 1.4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                },
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
