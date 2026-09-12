import { useMemo, useState, type ReactNode } from 'react';
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
import DownloadIcon from '@mui/icons-material/Download';
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

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Transactions
          </Typography>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => setExportOpen(true)}>
            Export CSV
          </Button>
        </Box>

        <FilterBar filters={filters} onChange={changeFilters} />

        {isError ? (
          <Alert severity="error" icon={false} variant="outlined">
            {error instanceof Error ? handleError(error.message) : 'Failed to load transactions'}
          </Alert>
        ) : null}

        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell key={String(column.key)} sortDirection={sort.sortBy === column.key ? sort.sortDir : false}>
                    <TableSortLabel
                      active={sort.sortBy === column.key}
                      direction={sort.sortBy === column.key ? sort.sortDir : 'asc'}
                      onClick={() => handleSort(String(column.key))}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Profile</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
                ) : null}
              {data?.items.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell align="right">{currency.format(tx.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={tx.category}
                      color={tx.category === 'Revenue' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={tx.status}
                      color={tx.status === 'Paid' ? 'primary' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{tx.user_id}</TableCell>
                  <TableCell>
                    <Avatar src={tx.user_profile} sx={{ width: 32, height: 32 }} />
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No transactions match your filters.
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
        {isFetching && !isLoading ? (
          <Typography variant="caption" color="text.secondary">
            Updating…
          </Typography>
        ) : null}
      </Box>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} queryString={queryString} />
    </Paper>
  );
}
