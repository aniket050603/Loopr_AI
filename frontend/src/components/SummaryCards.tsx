import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { Sparkline } from './ledger';
import { useCountUp, ProgressRing, staggerParent, staggerDelay } from './motion';
import type { SummaryResponse } from '../types';

const currency2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Cell({
  children,
  span,
  delay,
}: {
  children: React.ReactNode;
  span?: boolean;
  delay: number;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        minWidth: 0,
        gridColumn: span ? { xs: 'span 2', sm: 'span 1' } : undefined,
        ...staggerParent,
        '& > *': { animationDelay: `${delay}s` },
      }}
    >
      {children}
    </Box>
  );
}

function StatBlock({
  label,
  children,
  align = 'left',
}: {
  label: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <Box
      sx={{
        px: { xs: 2.25, md: 3 },
        py: { xs: 2.25, md: 2.5 },
        textAlign: align,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          display: 'block',
          fontFamily: FONT_MONO,
          fontSize: 10.5,
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          mb: 1,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function Figure({
  text,
  prefix,
  color,
}: {
  text: string;
  prefix: string;
  color?: string;
}) {
  return (
    <Typography
      sx={{
        fontFamily: FONT_DISPLAY,
        fontSize: { xs: 27, sm: 30, md: 33 },
        fontWeight: 600,
        lineHeight: 1.08,
        letterSpacing: '-0.015em',
        fontVariantNumeric: 'tabular-nums',
        color: color ?? 'text.primary',
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ opacity: 0.5, fontSize: '0.78em', mr: 0.25 }}>
        {prefix}
      </Box>
      {text}
    </Typography>
  );
}

function Meta({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <Typography
      sx={{
        mt: 0.75,
        fontFamily: FONT_MONO,
        fontSize: 11.5,
        color: color ?? 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
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

  const revenueSeries = useMemo(() => monthlyTrend.map((m) => m.Revenue), [monthlyTrend]);
  const revenueCount = categoryBreakdown.find((c) => c.category === 'Revenue')?.count ?? 0;
  const expenseCount = categoryBreakdown.find((c) => c.category === 'Expense')?.count ?? 0;

  const rev = useCountUp(metrics.totalRevenue, 1100, 2);
  const exp = useCountUp(metrics.totalExpenses, 1100, 2);
  const net = useCountUp(metrics.netBalance, 1100, 2);
  const pending = useCountUp(metrics.pendingCount, 900);
  const count = useCountUp(metrics.transactionCount, 900);

  const paidCount = metrics.transactionCount - metrics.pendingCount;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        overflow: 'hidden',
        p: '1px',
        bgcolor: (t) => t.palette.divider,
        boxShadow: (t) =>
          t.palette.mode === 'light'
            ? '0 1px 3px rgba(25,24,19,0.04), 0 8px 28px rgba(25,24,19,0.05)'
            : '0 1px 3px rgba(0,0,0,0.3), 0 10px 32px rgba(0,0,0,0.35)',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(3, 1fr)',
            md: '1.5fr 1.1fr 1.2fr 0.9fr 0.9fr',
          },
          gap: '1px',
          bgcolor: (t) => t.palette.divider,
        }}
      >
        <Cell delay={0}>
          <StatBlock label="Total revenue">
            <Figure text={rev} prefix="$" color="success.main" />
            <Meta color="success.main">
              <Box
                component="span"
                sx={{
                  animation: 'riseIn 0.6s ease both',
                  '@keyframes riseIn': { from: { opacity: 0, transform: 'translateY(4px)' } },
                }}
              >
                ↑
              </Box>
              {revenueCount} entries
            </Meta>
            <Box sx={{ mt: 1.5 }}>
              <Sparkline
                data={revenueSeries}
                stroke={theme.palette.success.main}
                width={150}
                height={30}
              />
            </Box>
          </StatBlock>
        </Cell>

        <Cell delay={0.06}>
          <StatBlock label="Total expenses">
            <Figure text={exp} prefix="$" />
            <Meta>{expenseCount} entries</Meta>
          </StatBlock>
        </Cell>

        <Cell delay={0.12}>
          <StatBlock label="Net balance">
            <Figure
              text={fmt(metrics.netBalance)}
              prefix="$"
              color={metrics.netBalance >= 0 ? 'success.main' : 'error.main'}
            />
            <Meta>{marginPct}</Meta>
          </StatBlock>
        </Cell>

        <Cell delay={0.18}>
          <StatBlock label="Pending">
            <Figure
              text={metrics.pendingCount.toLocaleString('en-US')}
              prefix=""
              color={metrics.pendingCount > 0 ? 'warning.main' : undefined}
            />
            <Meta>to settle</Meta>
          </StatBlock>
        </Cell>

        <Cell delay={0.24} span>
          <StatBlock label="Transactions" align="right">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ProgressRing
                value={paidCount}
                max={metrics.transactionCount}
                size={56}
                stroke={5}
                color={theme.palette.success.main}
                trackColor={alpha(theme.palette.success.main, 0.15)}
              >
                <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, lineHeight: 1 }}>
                  {metrics.transactionCount}
                </Typography>
              </ProgressRing>
            </Box>
            <Meta>
              <Box component="span" sx={{ ml: 'auto' }}>
                {Math.round((paidCount / (metrics.transactionCount || 1)) * 100)}% paid
              </Box>
            </Meta>
          </StatBlock>
        </Cell>
      </Box>
    </Paper>
  );
}
