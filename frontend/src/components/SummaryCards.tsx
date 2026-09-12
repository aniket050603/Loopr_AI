import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { StatBlock, Sparkline } from './ledger';
import type { SummaryResponse } from '../types';

const currency2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function SerifFigure({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <Typography
      sx={{
        fontFamily: FONT_DISPLAY,
        fontSize: { xs: 24, md: 30 },
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums',
        color: color ?? 'text.primary',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Typography>
  );
}

export default function SummaryCards({ summary }: { summary: SummaryResponse }) {
  const theme = useTheme();
  const { metrics, monthlyTrend, categoryBreakdown } = summary;
  const margin = metrics.netBalance / metrics.totalRevenue || 0;
  const marginPct = `${(margin * 100).toFixed(1)}% margin`;

  const revenueSeries = useMemo(
    () => monthlyTrend.map((m) => m.Revenue),
    [monthlyTrend],
  );

  const revenueCount =
    categoryBreakdown.find((c) => c.category === 'Revenue')?.count ?? 0;
  const expenseCount =
    categoryBreakdown.find((c) => c.category === 'Expense')?.count ?? 0;

  return (
    <Paper elevation={0} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: '1.6fr 1fr 1fr 1.25fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        {/* Lead figure */}
        <StatBlock label="Total revenue">
          <SerifFigure>{currency2.format(metrics.totalRevenue)}</SerifFigure>
          <Typography
            sx={{
              mt: 0.75,
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: 'success.main',
            }}
          >
            ↑ {revenueCount} entries
          </Typography>
          <Box sx={{ mt: 1.25 }}>
            <Sparkline data={revenueSeries} stroke={theme.palette.success.main} width={150} height={30} />
          </Box>
        </StatBlock>

        <StatBlock label="Total expenses">
          <SerifFigure>{currency2.format(metrics.totalExpenses)}</SerifFigure>
          <Typography sx={{ mt: 0.75, fontFamily: FONT_MONO, fontSize: 11, color: 'text.secondary' }}>
            {expenseCount} entries
          </Typography>
        </StatBlock>

        <StatBlock label="Net balance">
          <SerifFigure color={metrics.netBalance >= 0 ? 'success.main' : 'error.main'}>
            {currency2.format(metrics.netBalance)}
          </SerifFigure>
          <Typography sx={{ mt: 0.75, fontFamily: FONT_MONO, fontSize: 11, color: 'text.secondary' }}>
            {marginPct}
          </Typography>
        </StatBlock>

        <StatBlock label="Pending">
          <SerifFigure color={metrics.pendingCount > 0 ? 'warning.main' : undefined}>
            {metrics.pendingCount}
          </SerifFigure>
          <Typography sx={{ mt: 0.75, fontFamily: FONT_MONO, fontSize: 11, color: 'text.secondary' }}>
            awaiting settlement
          </Typography>
        </StatBlock>

        <StatBlock label="Transactions" align="right">
          <SerifFigure>{metrics.transactionCount}</SerifFigure>
          <Typography sx={{ mt: 0.75, fontFamily: FONT_MONO, fontSize: 11, color: 'text.secondary' }}>
            all records
          </Typography>
        </StatBlock>
      </Box>
    </Paper>
  );
}
