import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { FONT_MONO, FONT_DISPLAY, getPalette, type LedgerMode } from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { SectionHeader } from './ledger';
import type { SummaryResponse } from '../types';

function useChartTheme(mode: LedgerMode) {
  const p = getPalette(mode);
  return {
    ink: p.text,
    muted: p.muted,
    grid: p.grid,
    tipBg: p.chartTip,
    tipBorder: p.borderStrong,
    revenue: p.up,
    expense: p.down,
    paid: p.accent,
    pending: p.warn,
  };
}

function ChartTooltip({ mode }: { mode: LedgerMode }) {
  const t = useChartTheme(mode);
  return (
    <Tooltip
      cursor={{ stroke: t.muted, strokeWidth: 1, strokeDasharray: '2 3' }}
      contentStyle={{
        backgroundColor: t.tipBg,
        border: `1px solid ${t.tipBorder}`,
        borderRadius: 10,
        boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
        fontSize: 12.5,
        fontFamily: FONT_MONO,
      }}
      labelStyle={{ color: t.ink, fontWeight: 600, marginBottom: 4 }}
      itemStyle={{ color: t.muted }}
      formatter={(value: number) => [
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value),
        undefined,
      ]}
    />
  );
}

function LegendInline() {
  return <Legend iconType="plainline" iconSize={14} wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />;
}

function CardHead({ title, meta, action }: { title: string; meta: string; action?: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        mb: 1.5,
      }}
    >
      <Box>
        <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 10.5,
            letterSpacing: '0.1em',
            color: 'text.secondary',
            textTransform: 'uppercase',
            mt: 0.25,
          }}
        >
          {meta}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

type Series = 'both' | 'revenue' | 'expense';

export default function Charts({ summary }: { summary: SummaryResponse }) {
  const { mode } = useLedgerMode();
  const isMdUp = useMediaQuery('(min-width:900px)');
  const t = useChartTheme(mode);
  const { monthlyTrend, categoryBreakdown, statusBreakdown } = summary;

  const [series, setSeries] = useState<Series>('both');
  const [activeSlice, setActiveSlice] = useState<number | null>(null);

  const catTotal = categoryBreakdown.reduce((s, c) => s + c.total, 0);
  const hovered = activeSlice !== null ? categoryBreakdown[activeSlice] : null;
  const currency0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const toggleGroup = (value: Series, label: string) => (
    <Button
      key={value}
      size="small"
      onClick={() => setSeries(value)}
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 0.3,
        fontSize: 11,
        fontFamily: FONT_MONO,
        letterSpacing: '0.06em',
        borderRadius: 999,
        color: series === value ? (t2) => t2.palette.background.paper : 'text.secondary',
        bgcolor: series === value ? (t2) => t2.palette.text.primary : 'transparent',
        '&:hover': { bgcolor: series === value ? (t2) => t2.palette.text.primary : (t2) => alpha(t2.palette.text.primary, 0.06) },
      }}
    >
      {label}
    </Button>
  );

  return (
    <Box id="breakdowns" sx={{ scrollMarginTop: 80 }}>
      <SectionHeader index="02" title="Charts" meta="monthly & categorical" />

      {/* Trend */}
      <Paper
        elevation={0}
        sx={{ borderRadius: '14px', p: { xs: 2, md: 2.5 }, mb: 2, transition: 'box-shadow 0.25s ease' }}
      >
        <CardHead
          title="Revenue vs Expenses"
          meta="Monthly · FY 2024"
          action={
            <Box
              sx={{
                display: 'flex',
                gap: '2px',
                p: '2px',
                border: (t2) => `1px solid ${t2.palette.divider}`,
                borderRadius: 999,
              }}
            >
              {toggleGroup('both', 'BOTH')}
              {toggleGroup('revenue', 'REV')}
              {toggleGroup('expense', 'EXP')}
            </Box>
          }
        />
        <ResponsiveContainer width="100%" height={isMdUp ? 280 : 210}>
          <LineChart data={monthlyTrend} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={t.grid} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: t.muted, fontFamily: FONT_MONO }}
              axisLine={{ stroke: t.grid }}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: t.muted, fontFamily: FONT_MONO }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={54}
              axisLine={false}
              tickLine={false}
            />
            {ChartTooltip({ mode })}
            {LegendInline()}
            {series !== 'expense' ? (
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke={t.revenue}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={900}
                style={{ transition: 'opacity 0.2s ease' }}
              />
            ) : null}
            {series !== 'revenue' ? (
              <Line
                type="monotone"
                dataKey="Expense"
                stroke={t.expense}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={900}
                style={{ transition: 'opacity 0.2s ease' }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Breakdowns */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' } }}>
        <Paper elevation={0} sx={{ borderRadius: '14px', p: { xs: 2, md: 2.5 }, position: 'relative' }}>
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
                {ChartTooltip({ mode })}
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
                    fontWeight: 600,
                    transition: 'font-size 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {hovered ? currency0.format(hovered.total) : currency0.format(catTotal)}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: hovered
                      ? hovered.category === 'Revenue'
                        ? t.revenue
                        : t.expense
                      : 'text.secondary',
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

        <Paper elevation={0} sx={{ borderRadius: '14px', p: { xs: 2, md: 2.5 } }}>
          <CardHead title="Status volume" meta="Paid vs Pending" />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statusBreakdown} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={t.grid} vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 11, fill: t.muted, fontFamily: FONT_MONO }}
                axisLine={{ stroke: t.grid }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: t.muted, fontFamily: FONT_MONO }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={54}
                axisLine={false}
                tickLine={false}
              />
              {ChartTooltip({ mode })}
              <Bar dataKey="total" maxBarSize={48} radius={[4, 4, 0, 0]} animationDuration={900}>
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={entry.status === 'Paid' ? t.paid : t.pending} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
}
