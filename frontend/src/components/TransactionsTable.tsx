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
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import DownloadOutlinedIcon from '@mui/icons-material/Download';
import TuneIcon from '@mui/icons-material/Tune';
import { FONT_MONO } from '../theme/theme';
import { usePalette } from '../theme/ThemeModeProvider';
import { SectionHeader, Dot, Signed } from './ledger';
import { useTransactions, getTableQueryString, type TableQuery } from '../hooks/useDashboardData';
import { showAlert } from '../components/SnackbarHost';
import FilterBar from './FilterBar';
import ExportModal from './ExportModal';
import type { Transaction, TransactionFilters } from '../types';

const COLUMNS: Array<{ key: keyof Transaction; label: string; labelMobile?: string; numeric?: boolean; hideOnMobile?: boolean; width?: number | string }> = [
  { key: 'id', label: 'No.', labelMobile: '#', numeric: true, width: { xs: 34, md: 64 } as never },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount', numeric: true, width: { xs: 104, md: 140 } as never },
  { key: 'category', label: 'Category', hideOnMobile: true, width: 110 },
  { key: 'status', label: 'Status', width: { xs: 92, md: 104 } as never },
  { key: 'user_id', label: 'User', hideOnMobile: true, width: 96 },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateTime = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function ledgerDate(d: Date, detail: 'full' | 'date' | 'short'): string {
  const parts = dateTime.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const base = `${get('day')} ${get('month')}`;
  if (detail === 'short') return base;
  const dated = `${base} '${get('year')}`;
  return detail === 'full' ? `${dated} · ${get('hour')}:${get('minute')}` : dated;
}

const MONO = FONT_MONO;

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
  const palette = usePalette();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [exportOpen, setExportOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;

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

  const columns = isMobile ? COLUMNS.filter((c) => !c.hideOnMobile) : COLUMNS;
  const colSpan = columns.length + (isMobile ? 0 : 1);

  const headSx = {
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'text.secondary',
    whiteSpace: 'nowrap',
    py: 1.25,
  } as const;

  return (
    <Paper
      id="transactions"
      elevation={0}
      sx={{
        borderRadius: '14px',
        overflow: 'hidden',
        scrollMarginTop: 80,
        boxShadow: (t2) =>
          t2.palette.mode === 'light'
            ? '0 1px 3px rgba(25,24,19,0.04), 0 8px 28px rgba(25,24,19,0.05)'
            : '0 1px 3px rgba(0,0,0,0.3), 0 10px 32px rgba(0,0,0,0.35)',
      }}
    >
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionHeader
          index="03"
          title="Transactions"
          meta={
            isFetching && !isLoading
              ? 'updating…'
              : `${data?.total ?? 0} records`
          }
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isMobile ? (
                <Button
                  size="small"
                  startIcon={<TuneIcon />}
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    borderRadius: 999,
                    border: `1px solid ${palette.borderStrong}`,
                  }}
                >
                  FILTERS{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
                </Button>
              ) : null}
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadOutlinedIcon />}
                onClick={() => setExportOpen(true)}
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  px: 1.75,
                  borderRadius: 999,
                }}
              >
                CSV
              </Button>
            </Box>
          }
        />

        {!isMobile ? <FilterBar filters={filters} onChange={changeFilters} /> : null}

        {isError ? (
          <Alert severity="error" icon={false} variant="outlined" sx={{ mb: 2 }}>
            {error instanceof Error ? handleError(error.message) : 'Failed to load transactions'}
          </Alert>
        ) : null}

        <TableContainer sx={{ borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Table
            size={isMobile ? 'small' : 'medium'}
            sx={{
              tableLayout: 'fixed',
              '& .MuiTableCell-root': {
                px: { xs: 0.6, md: 1.5 },
                py: { xs: 1.25, md: 1.4 },
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    bgcolor: 'background.paper',
                    boxShadow: (t2) => `inset 0 -1px 0 ${t2.palette.divider}`,
                  },
                }}
              >
                {columns.map((column) => {
                  const w = typeof column.width === 'object' ? (isMobile ? (column.width as any).xs : (column.width as any).md) : column.width;
                  return (
                  <TableCell
                    key={String(column.key)}
                    align={column.numeric ? 'right' : 'left'}
                    sx={{ ...headSx, width: w, minWidth: w }}
                    sortDirection={sort.sortBy === column.key ? sort.sortDir : false}
                  >
                    <TableSortLabel
                      active={sort.sortBy === column.key}
                      direction={sort.sortBy === column.key ? sort.sortDir : 'asc'}
                      onClick={() => handleSort(String(column.key))}
                      sx={{
                        fontSize: 'inherit',
                        letterSpacing: 'inherit',
                        '&.Mui-active': { color: 'text.primary' },
                        '& .MuiTableSortLabel-icon': { fontSize: 13 },
                      }}
                    >
                      {isMobile && column.labelMobile ? column.labelMobile : column.label}
                    </TableSortLabel>
                  </TableCell>
                  );
                })}
                {isMobile ? null : (
                  <TableCell sx={{ ...headSx, width: 44, textAlign: 'right' }}></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      {columns.map((column) => (
                        <TableCell key={String(column.key)}>
                          <Skeleton height={20} />
                        </TableCell>
                      ))}
                      {isMobile ? null : (
                        <TableCell>
                          <Skeleton variant="circular" width={28} height={28} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                : data?.items.map((tx, rowIndex) => (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{
                        '&:last-child td': { borderBottom: 0 },
                        animation: `rowIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(
                          rowIndex * 0.035,
                          0.4,
                        ).toFixed(2)}s both`,
                        '@keyframes rowIn': {
                          from: { opacity: 0, transform: 'translateY(6px)' },
                          to: { opacity: 1, transform: 'none' },
                        },
                      }}
                    >
                      <TableCell
                        align="right"
                        sx={{ fontFamily: MONO, fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}
                      >
                        {String(tx.id).padStart(3, '0')}
                      </TableCell>
                      <TableCell sx={{ fontFamily: MONO, fontSize: { xs: 13, md: 13.5 }, whiteSpace: 'nowrap', color: 'text.secondary' }}>
                        {ledgerDate(new Date(tx.date), isMobile ? 'short' : 'full')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: 14, md: 15 }, fontWeight: 700 }}>
                        <Signed
                          value={currency.format(tx.amount).replace('$', '')}
                          currency="$"
                          sign={tx.category === 'Revenue' ? '+' : '−'}
                        />
                      </TableCell>
                      {isMobile ? null : (
                        <TableCell sx={{ fontSize: 14 }}>
                          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <Dot color={tx.category === 'Revenue' ? theme.palette.success.main : theme.palette.error.main} />
                            {tx.category}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.25,
                            py: 0.45,
                            borderRadius: 999,
                            fontSize: { xs: 12, md: 12.5 },
                            fontWeight: 600,
                            fontFamily: MONO,
                            letterSpacing: '0.04em',
                            bgcolor: (t) =>
                              alpha(
                                tx.status === 'Paid' ? t.palette.success.main : t.palette.warning.main,
                                0.13,
                              ),
                            color: (t) =>
                              tx.status === 'Paid' ? t.palette.success.main : t.palette.warning.main,
                          }}
                        >
                          <Dot
                            size={6}
                            color={tx.status === 'Paid' ? theme.palette.success.main : theme.palette.warning.main}
                          />
                          {tx.status}
                        </Box>
                      </TableCell>
                      {isMobile ? null : (
                        <TableCell sx={{ fontSize: 14, color: 'text.secondary' }}>{tx.user_id}</TableCell>
                      )}
                      {isMobile ? null : (
                        <TableCell align="right">
                          <Avatar
                            src={tx.user_profile}
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 12,
                              fontWeight: 600,
                              ml: 'auto',
                              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                              color: 'text.secondary',
                              border: `1px solid ${theme.palette.divider}`,
                              transition: 'transform 0.18s ease',
                            }}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              {!isLoading && data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ fontFamily: FONT_MONO, fontSize: 12, color: 'text.secondary' }}>
                      — no records match —
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
          sx={{
            mt: 0.5,
            fontFamily: FONT_MONO,
            fontSize: 12,
            '& .MuiTablePagination-toolbar': { minHeight: 44 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontFamily: FONT_MONO,
              fontSize: 12,
            },
          }}
        />
      </Box>

      {/* Mobile filter drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            border: `1px solid ${palette.border}`,
            maxHeight: '82vh',
          },
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography sx={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 20, fontWeight: 600 }}>
              Filters
            </Typography>
            <Button
              size="small"
              onClick={() => setDrawerOpen(false)}
              sx={{ fontFamily: FONT_MONO, fontSize: 11, minWidth: 0 }}
            >
              DONE
            </Button>
          </Box>
          <FilterBar filters={filters} onChange={changeFilters} />
        </Box>
      </Drawer>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} queryString={queryString} />
    </Paper>
  );
}
