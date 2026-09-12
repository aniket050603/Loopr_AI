import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import type { SummaryResponse } from '../types';

const REVENUE = '#34D399';
const EXPENSE = '#F87171';
const STATUS_PAID = '#6366F1';
const STATUS_PENDING = '#FBBF24';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ stroke: 'rgba(148,163,184,0.35)', strokeWidth: 1 }}
      contentStyle={{
        backgroundColor: '#0B1120',
        border: '1px solid rgba(148,163,184,0.2)',
        borderRadius: 12,
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        fontSize: 13,
        fontWeight: 500,
      }}
      labelStyle={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 4 }}
      itemStyle={{ color: '#8B98B4' }}
      formatter={(value: number) => [currency.format(value), undefined]}
    />
  );
}

function LegendChip() {
  return (
    <Legend
      iconType="circle"
      iconSize={8}
      wrapperStyle={{ fontSize: 12.5, color: '#8B98B4', paddingTop: 8 }}
    />
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {children}
      </Box>
    </Card>
  );
}

export default function Charts({ summary }: { summary: SummaryResponse }) {
  const { monthlyTrend, categoryBreakdown, statusBreakdown } = summary;

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
      <ChartCard title="Revenue vs Expenses (Monthly)">
        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REVENUE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={REVENUE} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={EXPENSE} stopOpacity={0.3} />
                <stop offset="100%" stopColor={EXPENSE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#8B98B4' }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#8B98B4' }}
              tickFormatter={(v) => currency.format(v)}
              width={76}
              axisLine={false}
              tickLine={false}
            />
            {ChartTooltip()}
            {LegendChip()}
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke={REVENUE}
              strokeWidth={2.5}
              fill="url(#revFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#0B1120' }}
            />
            <Area
              type="monotone"
              dataKey="Expense"
              stroke={EXPENSE}
              strokeWidth={2.5}
              fill="url(#expFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#0B1120' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <Box sx={{ display: 'grid', gap: 2, alignContent: 'start' }}>
        <ChartCard title="Category Breakdown">
          <ResponsiveContainer width="100%" height={185}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="total"
                nameKey="category"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                cornerRadius={4}
                stroke="none"
              >
                {categoryBreakdown.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={entry.category === 'Revenue' ? REVENUE : EXPENSE}
                  />
                ))}
              </Pie>
              {ChartTooltip()}
              {LegendChip()}
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Breakdown">
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={statusBreakdown} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 12, fill: '#8B98B4' }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#8B98B4' }}
                tickFormatter={(v) => currency.format(v)}
                width={76}
                axisLine={false}
                tickLine={false}
              />
              {ChartTooltip()}
              <Bar dataKey="total" radius={[7, 7, 2, 2]} maxBarSize={56}>
                {statusBreakdown.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={entry.status === 'Paid' ? STATUS_PAID : STATUS_PENDING}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>
    </Box>
  );
}
