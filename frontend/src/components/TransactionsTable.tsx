import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useTransactions, getTableQueryString, type TableQuery } from '../hooks/useDashboardData';
import { showAlert } from '../components/SnackbarHost';
import FilterBar from './FilterBar';
import ExportModal from './ExportModal';
import type { Transaction, TransactionFilters } from '../types';

const COLUMNS: Array<{ key: keyof Transaction; label: string; numeric?: boolean }> = [
  { key: 'id', label: 'ID', numeric: true },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount', numeric: true },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'user_id', label: 'User' },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const MONO = '"JetBrains Mono", ui-monospace, monospace';

interface TransactionsTableProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

interface SortState {
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

const DEFAULT_SORT: SortState = { sortBy: 'date', sortDir: 'desc' };

export default function TransactionsTable({ filters, onFiltersChange }: TransactionsTableProps) {
  const theme = useTheme();
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [exportOpen, setExportOpen] = useState(false);

  // Reset to the first page whenever filters change.
  function changeFilters(next: TransactionFilters) {
    onFiltersChange(next);
    setPage(0);
  }

  const tableQuery: TableQuery = {
    ...filters,
    page,
    limit,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
  };
  const { data, isLoading, error, isError, isFetching } = useTransactions(tableQuery);
  const queryString = useMemo(() => getTableQueryString(tableQuery), [tableQuery]);

  function handleSort(key: string) {
    setSort((prev) => ({
      sortBy: key,
      sortDir: prev.sortBy === key && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  }

  function handleError(msg: string) {
    showAlert(msg, 'error');
    return msg;
  }

  const headCellSx = {
    fontWeight: 700,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'text.secondary',
    whiteSpace: 'nowrap',
    bgcolor: 'rgba(148,163,184,0.05)',
    py: 1.5,
  } as const;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Transactions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isFetching && !isLoading
                ? 'Updating…'
                : `${data?.total ?? 0} records · server-side pagination`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => setExportOpen(true)}
            sx={{
              borderRadius: 2.5,
              color: '#fff',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #22D3EE 140%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(99,102,241,0.5)',
              },
              '&:disabled': { color: '#fff', opacity: 0.6 },
            }}
          >
            Export CSV
          </Button>
        </Box>

        <FilterBar filters={filters} onChange={changeFilters} />

        {isError ? (
          <Alert severity="error" icon={false} variant="outlined">
            {error instanceof Error ? handleError(error.message) : 'Failed to load transactions'}
          </Alert>
        ) : null}

        <TableContainer sx={{ maxHeight: 520, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    align={column.numeric ? 'right' : 'left'}
                    sx={headCellSx}
                    sortDirection={sort.sortBy === column.key ? sort.sortDir : false}
                  >
                    <TableSortLabel
                      active={sort.sortBy === column.key}
                      direction={sort.sortBy === column.key ? sort.sortDir : 'asc'}
                      onClick={() => handleSort(String(column.key))}
                      sx={{ '&.Mui-active': { color: 'primary.light' } }}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={headCellSx}>Profile</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      {COLUMNS.map((column) => (
                        <TableCell key={String(column.key)}>
                          <Skeleton height={22} />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Skeleton variant="circular" width={32} height={32} />
                      </TableCell>
                    </TableRow>
                  ))
                : data?.items.map((tx) => (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        animation: 'rowIn 0.3s ease both',
                        '@keyframes rowIn': {
                          from: { opacity: 0, transform: 'translateY(3px)' },
                          to: { opacity: 1, transform: 'none' },
                        },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell
                        sx={{ fontFamily: MONO, fontSize: 12.5, color: 'text.secondary' }}
                      >
                        {tx.id}
                      </TableCell>
                      <TableCell
                        sx={{ fontFamily: MONO, fontSize: 12.5, whiteSpace: 'nowrap' }}
                      >
                        {dateTime.format(new Date(tx.date))}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color:
                            tx.category === 'Revenue'
                              ? theme.palette.success.light
                              : theme.palette.error.light,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tx.category === 'Revenue' ? '+' : '−'}
                        {currency.format(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.category}
                          icon={
                            tx.category === 'Revenue' ? (
                              <TrendingUpIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <TrendingDownIcon sx={{ fontSize: 14 }} />
                            )
                          }
                          sx={{
                            height: 22,
                            fontSize: 11.5,
                            fontWeight: 700,
                            bgcolor: (t) =>
                              tx.category === 'Revenue'
                                ? alpha(t.palette.success.main, 0.14)
                                : alpha(t.palette.error.main, 0.14),
                            color: (t) =>
                              tx.category === 'Revenue'
                                ? t.palette.success.light
                                : t.palette.error.light,
                            border: '1px solid',
                            borderColor: (t) =>
                              tx.category === 'Revenue'
                                ? alpha(t.palette.success.main, 0.35)
                                : alpha(t.palette.error.main, 0.35),
                            '& .MuiChip-icon': { color: 'inherit' },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.status}
                          sx={{
                            height: 22,
                            fontSize: 11.5,
                            fontWeight: 700,
                            bgcolor: (t) =>
                              tx.status === 'Paid'
                                ? alpha(t.palette.primary.main, 0.16)
                                : alpha(t.palette.warning.main, 0.14),
                            color: (t) =>
                              tx.status === 'Paid'
                                ? t.palette.primary.light
                                : t.palette.warning.light,
                            border: '1px solid',
                            borderColor: (t) =>
                              tx.status === 'Paid'
                                ? alpha(t.palette.primary.main, 0.4)
                                : alpha(t.palette.warning.main, 0.35),
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, whiteSpace: 'nowrap' }}>{tx.user_id}</TableCell>
                      <TableCell>
                        <Avatar
                          src={tx.user_profile}
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: 12,
                            fontWeight: 700,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
                            color: 'primary.light',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No transactions match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Box>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} queryString={queryString} />
    </Paper>
  );
}
