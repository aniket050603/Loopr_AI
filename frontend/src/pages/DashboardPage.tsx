import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO, getPalette, type LedgerMode } from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import { useSummary } from '../hooks/useDashboardData';
import { showAlert } from '../components/SnackbarHost';
import { Reveal, useElapsed } from '../components/motion';
import KpiCards from '../components/KpiCards';
import Charts from '../components/Charts';
import TransactionsTable from '../components/TransactionsTable';
import type { TransactionFilters } from '../types';

const EMPTY_FILTERS: TransactionFilters = {};

export default function DashboardPage() {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const { user } = useAuth();
  const theme = useTheme();
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const { data: summary, isLoading, error, dataUpdatedAt } = useSummary();
  const synced = useElapsed(dataUpdatedAt);

  if (error) {
    showAlert(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load analytics summary',
      'error',
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1480,
        mx: 'auto',
        px: { xs: 2.5, sm: 4, lg: 5 },
        py: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 3, md: 4 },
      }}
    >
      {/* Page header */}
      <Box
        id="overview"
        sx={{
          scrollMarginTop: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                fontWeight: 600,
                color: p.green,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Overview · {synced}
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: { xs: 30, md: 38 },
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: p.text,
                mt: 0.5,
              }}
            >
              Financial Analytics
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: p.panelAlt,
                border: `1px solid ${p.edge}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: p.muted,
                  letterSpacing: '0.08em',
                }}
              >
                VOL.
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 13,
                  color: p.text,
                }}
              >
                {summary?.metrics.transactionCount ?? '—'}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: p.panelAlt,
                border: `1px solid ${p.edge}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: p.muted,
                  letterSpacing: '0.08em',
                }}
              >
                FY
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 13,
                  color: p.text,
                }}
              >
                2024
              </Typography>
            </Box>
            {user && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '8px',
                  bgcolor: p.panelAlt,
                  border: `1px solid ${p.edge}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: p.muted,
                    letterSpacing: '0.08em',
                  }}
                >
                  USER
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 13,
                    color: p.text,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name ?? user.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            height: 3,
            bgcolor: p.green,
            width: '100%',
            maxWidth: 120,
            borderRadius: '2px',
            mt: 0.5,
          }}
        />
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 128,
                borderRadius: '12px',
                bgcolor: p.paper,
                border: `1px solid ${p.edge}`,
                animation: 'lpulse 1.4s ease-in-out infinite',
                '@keyframes lpulse': { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 0.9 } },
              }}
            />
          ))}
        </Box>
      ) : summary ? (
        <>
          <Reveal>
            <KpiCards summary={summary} />
          </Reveal>
          <Reveal delay={0.08}>
            <Charts summary={summary} />
          </Reveal>
        </>
      ) : (
        !error && <Alert severity="info">No analytics available.</Alert>
      )}

      <Reveal delay={0.12}>
        <TransactionsTable filters={filters} onFiltersChange={setFilters} />
      </Reveal>
    </Box>
  );
}
