import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LogoutIcon from '@mui/icons-material/Logout';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Financial Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.name ?? user?.email}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
          Logout
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
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
