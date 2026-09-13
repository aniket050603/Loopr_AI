import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BrutalCard } from './ui';
import { getPalette, FONT_UI, FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { useTransactions } from '../hooks/useDashboardData';
import { usd2, usdTick, MONTH_SHORT } from '../utils/format';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type TrendPoint = { month: string; Income: number; Expenses: number };

interface RecentItem {
  name: string;
  label: string;
  sub: string;
  value: string;
  color: string;
}

/** Legend dot + label pair in the card header. */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        component="span"
        sx={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          bgcolor: color,
          display: 'inline-block',
          boxShadow: `0 0 0 2px ${color}26`,
        }}
      />
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          color: 'inherit',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function OverviewChart({ data }: { data?: TrendPoint[] }) {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const theme = useTheme();
  const isMdUp = useMediaQuery('(min-width: 900px)');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [period, setPeriod] = useState<'Monthly' | 'Quarterly'>('Monthly');

  const trend: TrendPoint[] =
    data && data.length > 0
      ? data
      : MONTH_SHORT.map((month, i) => ({
          month,
          Income: 80 + Math.sin(i * 0.6) * 30 + (i % 3) * 20,
          Expenses: 40 + Math.cos(i * 0.5) * 20 + (i % 3) * 8,
        }));

  const totals = {
    income: trend.reduce((s, pt) => s + pt.Income, 0),
    expenses: trend.reduce((s, pt) => s + pt.Expenses, 0),
  };
  const combined = totals.income + totals.expenses;

  /** Quarterly view: 12 monthly points folded into 4 sums. */
  const shown: TrendPoint[] =
    period === 'Quarterly'
      ? Array.from({ length: Math.ceil(trend.length / 3) }, (_, q) => {
          const slice = trend.slice(q * 3, q * 3 + 3);
          return {
            month: `Q${q + 1}`,
            Income: slice.reduce((s, pt) => s + pt.Income, 0),
            Expenses: slice.reduce((s, pt) => s + pt.Expenses, 0),
          };
        })
      : trend;

  const { data: recent } = useTransactions({
    page: 1,
    limit: 3,
    sortBy: 'date',
    sortDir: 'desc',
  });

  const recentItems: RecentItem[] =
    recent?.items.map((tx) => ({
      name: tx.user_id,
      label: tx.category === 'Revenue' ? 'Transfers from' : 'Transfers to',
      sub: tx.status === 'Paid' ? 'Completed' : 'Pending',
      value: `${tx.category === 'Revenue' ? '+' : '-'} ${usd2.format(tx.amount)}`,
      color: tx.category === 'Revenue' ? p.green : p.amber,
    })) ?? [];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2.5, md: 3 },
        gridTemplateColumns: { xs: '1fr', md: '1.7fr 1fr' },
        alignItems: 'stretch',
      }}
    >
      {/* Left: Overview trend */}
      <BrutalCard sx={{ minHeight: 360 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mb: 2,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 18,
              color: p.text,
              letterSpacing: '-0.01em',
            }}
          >
            Overview
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LegendDot color={p.green} label="Income" />
            <LegendDot color={p.amber} label="Expenses" />

            <Box
              onClick={() => setPeriodOpen((v) => !v)}
              sx={{
                bgcolor: p.panelAlt,
                borderRadius: '7px',
                border: `1px solid ${periodOpen ? p.green : p.edge}`,
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.4,
                color: p.text,
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative',
                transition: 'border-color 150ms ease',
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_UI,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: p.text,
                  letterSpacing: '0.02em',
                }}
              >
                {period}
              </Typography>
              <Typography
                sx={{ fontSize: 11, color: p.muted, fontFamily: FONT_UI, ml: 0.5, lineHeight: 1 }}
              >
                ⌄
              </Typography>
              {periodOpen ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    zIndex: 20,
                    minWidth: 128,
                    bgcolor: p.paper,
                    border: `1px solid ${p.edge}`,
                    borderRadius: '8px',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
                    py: 0.5,
                  }}
                >
                  {(['Monthly', 'Quarterly'] as const).map((option) => (
                    <Box
                      key={option}
                      onClick={() => {
                        setPeriod(option);
                        setPeriodOpen(false);
                      }}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        fontSize: 12,
                        fontFamily: FONT_UI,
                        cursor: 'pointer',
                        color: option === period ? p.green : p.text,
                        fontWeight: option === period ? 700 : 500,
                        '&:hover': { bgcolor: alpha(p.text, 0.05) },
                      }}
                    >
                      {option}
                    </Box>
                  ))}
                </Box>
              ) : null}
            </Box>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={isMdUp ? 280 : 230}>
          <LineChart data={shown} margin={{ top: 6, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={p.edge} strokeDasharray="1 3" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11.5, fill: p.muted, fontFamily: FONT_UI }}
              axisLine={false}
              tickLine={false}
              dy={6}
              interval={isMdUp ? 0 : 1}
            />
            <YAxis
              width={42}
              tick={{ fontSize: 11, fill: p.muted, fontFamily: FONT_UI }}
              tickFormatter={usdTick}
              axisLine={false}
              tickLine={false}
              dx={-4}
            />
            <Tooltip
              cursor={{ stroke: p.edge, strokeDasharray: '2 3', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: p.paper,
                border: `1px solid ${p.edge}`,
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                padding: '8px 10px',
              }}
              labelStyle={{ color: p.text, fontWeight: 600, marginBottom: 4, fontSize: 11 }}
              itemStyle={{ color: p.text, fontSize: 12 }}
              formatter={(value: number) => {
                const v = Number(value);
                return [v >= 0 ? `+$${v.toFixed(2)}` : `- $${Math.abs(v).toFixed(2)}`, undefined];
              }}
            />
            <Line
              type="monotone"
              dataKey="Income"
              stroke={p.green}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2.5, stroke: theme.palette.background.paper }}
            />
            <Line
              type="monotone"
              dataKey="Expenses"
              stroke={p.amber}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2.5, stroke: theme.palette.background.paper }}
            />
          </LineChart>
        </ResponsiveContainer>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            mt: 1,
            pt: 1.5,
            borderTop: `1px solid ${p.edge}`,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11.5, color: p.muted, lineHeight: 1.4 }}>
            Combined: {usd2.format(combined)}
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: '4px', sm: '8px' }, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: p.green }}>
              <TrendingUp size={11} strokeWidth={2} />
              <Typography sx={{ fontFamily: FONT_UI, fontSize: 12.5, fontWeight: 700, color: p.green }}>
                +{usd2.format(totals.income)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: p.amber }}>
              <TrendingDown size={11} strokeWidth={2} />
              <Typography sx={{ fontFamily: FONT_UI, fontSize: 12.5, fontWeight: 700, color: p.amber }}>
                {usd2.format(totals.expenses)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </BrutalCard>

      {/* Right: Recent transactions */}
      <BrutalCard sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 18,
            color: p.text,
            letterSpacing: '-0.01em',
            mb: 2,
          }}
        >
          Recent Transaction
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
          {recentItems.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 1,
                borderRadius: '8px',
                px: 1,
                borderLeft: '2px solid transparent',
                transition: 'background-color 150ms ease, border-left-color 150ms ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                // Staggered entrance when the card mounts
                animation: `recentIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.09}s both`,
                '@keyframes recentIn': {
                  from: { opacity: 0, transform: 'translateX(14px)' },
                  to: { opacity: 1, transform: 'none' },
                },
                '&:hover': {
                  bgcolor: alpha(p.edge, 0.25),
                  borderLeftColor: item.color,
                  // Nudge the row toward its accent edge on hover
                  transform: 'translateX(2px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: item.color === p.green ? p.softGreen : p.softAmber,
                  color: item.color,
                  fontFamily: FONT_UI,
                  fontWeight: 800,
                  fontSize: 13,
                  border: `1px solid ${item.color}33`,
                }}
              >
                {item.name.replace('user_', 'U').slice(0, 1).toUpperCase()}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: FONT_UI,
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: p.text,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_UI,
                    fontSize: 11.5,
                    color: p.muted,
                    display: 'block',
                    lineHeight: 1.35,
                  }}
                >
                  {item.label} / {item.sub}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: 14,
                  color: item.color,
                  lineHeight: 1.2,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 'auto',
            pt: 1.5,
            borderTop: `1px dashed ${p.edge}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Typography sx={{ fontFamily: FONT_UI, fontSize: 11.5, color: p.muted, lineHeight: 1.4 }}>
            Latest activity
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: p.green }}>
              <TrendingUp size={11} strokeWidth={2} />
              <Typography sx={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 700, color: p.green }}>
                {recentItems.length} recent
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 700, color: p.amber }}>
              {recent?.total != null ? `${recent.total.toLocaleString('en-US')} total` : 'live feed'}
            </Typography>
          </Box>
        </Box>
      </BrutalCard>
    </Box>
  );
}
