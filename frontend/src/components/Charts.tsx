import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
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
import { FONT_MONO, getPalette, type LedgerMode } from '../theme/theme';
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
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
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
  return (
    <Legend
      iconType="plainline"
      iconSize={14}
      wrapperStyle={{ fontSize: 12, paddingTop: 6 }}
    />
  );
}

export default function Charts({ summary }: { summary: SummaryResponse }) {
  useTheme();
  const { mode } = useLedgerMode();
  const isMdUp = useMediaQuery('(min-width:900px)');
  const t = useChartTheme(mode);
  const { monthlyTrend, categoryBreakdown, statusBreakdown } = summary;

  return (
    <Box>
      <SectionHeader index="02" title="Charts" meta="monthly & categorical" />

      {/* Trend */}
      <Paper elevation={0} sx={{ borderRadius: '10px', p: { xs: 2, md: 2.5 }, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Revenue vs Expenses — monthly
        </Typography>
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
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke={t.revenue}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Expense"
              stroke={t.expense}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Breakdowns */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' } }}>
        <Paper elevation={0} sx={{ borderRadius: '10px', p: { xs: 2, md: 2.5 } }}>
          <Typography variant="subtitle2" gutterBottom>
            Category split
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="total"
                nameKey="category"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {categoryBreakdown.map((entry) => (
                  <Cell key={entry.category} fill={entry.category === 'Revenue' ? t.revenue : t.expense} />
                ))}
              </Pie>
              {ChartTooltip({ mode })}
              {LegendInline()}
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: '10px', p: { xs: 2, md: 2.5 } }}>
          <Typography variant="subtitle2" gutterBottom>
            Status volume
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
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
              <Bar dataKey="total" maxBarSize={44} radius={[3, 3, 0, 0]}>
                {statusBreakdown.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={entry.status === 'Paid' ? t.paid : t.pending}
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
