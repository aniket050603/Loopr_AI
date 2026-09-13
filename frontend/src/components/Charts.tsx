import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { FONT_MONO, FONT_DISPLAY, getPalette } from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { SectionHeader } from './ledger';
import OverviewChart, { type TrendPoint } from './OverviewChart';
import { usd0, usdTick, monthLabel } from '../utils/format';
import type { SummaryResponse } from '../types';

/** Shared Recharts color/style tokens derived from the active palette. */
function useChartTheme() {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  return {
    mode,
    ink: p.text,
    muted: p.muted,
    grid: p.edge,
    paper: p.paper,
    edge: p.edge,
    revenue: p.green,
    expense: p.amber,
    paid: p.green,
    pending: p.amber,
  };
}

const AXIS_TICK = { fontSize: 11, fontFamily: FONT_MONO } as const;

const TOOLTIP_STYLES = {
  borderRadius: '9px',
  boxShadow: '0 10px 32px rgba(0,0,0,0.28)',
  fontSize: 12.5,
  fontFamily: FONT_MONO,
  padding: '8px 10px',
} as const;

function CardHead({
  title,
  meta,
  action,
}: {
  title: string;
  meta: string;
  action?: React.ReactNode;
}) {
  const t = useChartTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 1,
        mb: 1.75,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: FONT_DISPLAY,
            fontSize: 18,
            fontWeight: 800,
            color: t.ink,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 10.5,
            letterSpacing: '0.12em',
            color: t.muted,
            textTransform: 'uppercase',
            mt: 0.3,
          }}
        >
          {meta}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

const CARD_SX = {
  borderRadius: '13px',
  p: { xs: 2, md: 2.5 },
} as const;

export default function Charts({ summary }: { summary: SummaryResponse }) {
  const t = useChartTheme();
  const { monthlyTrend, categoryBreakdown, statusBreakdown } = summary;

  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const trend: TrendPoint[] = monthlyTrend.map((m) => ({
    month: monthLabel(m.month),
    Income: m.Revenue,
    Expenses: m.Expense,
  }));

  const catTotal = categoryBreakdown.reduce((s, c) => s + c.total, 0);
  const hovered = activeSlice !== null ? categoryBreakdown[activeSlice] : null;

  return (
    <Box id="breakdowns" sx={{ scrollMarginTop: 80 }}>
      <SectionHeader index="02" title="Charts" meta="monthly & categorical" />

      {/* Overview trend + Recent transactions (Figma row) */}
      <Box sx={{ mb: 2 }}>
        <OverviewChart data={trend} />
      </Box>

      {/* Breakdowns */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' } }}>
        <Paper
          elevation={0}
          sx={{ ...CARD_SX, p: { xs: 2, md: 2.5 }, position: 'relative', bgcolor: t.paper, border: `1px solid ${t.edge}` }}
        >
          <CardHead title="Category split" meta="Revenue vs Expense" />
          <Box sx={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={2.5}
                  cornerRadius={5}
                  stroke="none"
                  onMouseEnter={(_, index) => setActiveSlice(index)}
                  onMouseLeave={() => setActiveSlice(null)}
                  animationDuration={900}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={entry.category === 'Revenue' ? t.revenue : t.expense}
                      style={{
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        transformOrigin: 'center',
                        opacity: activeSlice === null || activeSlice === index ? 1 : 0.35,
                        transform: activeSlice === index ? 'scale(1.03)' : 'scale(1)',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ stroke: t.muted, strokeWidth: 1, strokeDasharray: '2 3' }}
                  contentStyle={{ ...TOOLTIP_STYLES, backgroundColor: t.paper, border: `1px solid ${t.edge}`, color: t.ink }}
                  labelStyle={{ color: t.ink, fontWeight: 700, marginBottom: 4 }}
                  itemStyle={{ color: t.ink, fontSize: 12.5 }}
                  formatter={(value: number) => [usd0.format(value), undefined]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: hovered ? 19 : 22,
                    fontWeight: 700,
                    color: t.ink,
                    transition: 'font-size 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {hovered ? usd0.format(hovered.total) : usd0.format(catTotal)}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: hovered
                      ? hovered.category === 'Revenue'
                        ? t.revenue
                        : t.expense
                      : t.muted,
                    mt: 0.25,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {hovered ? hovered.category : 'Total'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{ bgcolor: t.paper, border: `1px solid ${t.edge}`, borderRadius: '13px', p: { xs: 2, md: 2.5 } }}
        >
          <CardHead title="Status volume" meta="Paid vs Pending" />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statusBreakdown} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={t.grid} vertical={false} opacity={0.6} />
              <XAxis
                dataKey="status"
                tick={{ ...AXIS_TICK, fill: t.muted }}
                axisLine={{ stroke: t.grid }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ ...AXIS_TICK, fill: t.muted }}
                tickFormatter={usdTick}
                width={54}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: t.muted, strokeWidth: 1, strokeDasharray: '2 3' }}
                contentStyle={{ ...TOOLTIP_STYLES, backgroundColor: t.paper, border: `1px solid ${t.edge}`, color: t.ink }}
                labelStyle={{ color: t.ink, fontWeight: 700, marginBottom: 4 }}
                itemStyle={{ color: t.ink, fontSize: 12.5 }}
                formatter={(value: number) => [usd0.format(value), undefined]}
              />
              <Bar
                dataKey="total"
                maxBarSize={48}
                radius={[4, 4, 0, 0]}
                animationDuration={900}
                onMouseEnter={(_, index) => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={entry.status === 'Paid' ? t.paid : t.pending}
                    style={{
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                      transformOrigin: 'center bottom',
                      opacity: activeBar === null || activeBar === index ? 1 : 0.35,
                      transform: activeBar === index ? 'scaleY(1.02) scaleX(1.04)' : 'scale(1)',
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
}
