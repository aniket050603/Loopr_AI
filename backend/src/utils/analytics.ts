import { TransactionModel } from '../models/Transaction.js';

export interface SummaryResponse {
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
    pendingCount: number;
  };
  monthlyTrend: Array<{ month: string; Revenue: number; Expense: number }>;
  categoryBreakdown: Array<{ category: string; total: number; count: number }>;
  statusBreakdown: Array<{ status: string; total: number; count: number }>;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function buildAnalytics(): Promise<SummaryResponse> {
  const [categoryRows, statusRows, monthlyRows] = await Promise.all([
    TransactionModel.aggregate<{ _id: string; total: number; count: number }>([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    TransactionModel.aggregate<{ _id: string; total: number; count: number }>([
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    TransactionModel.aggregate<{ _id: { month: string; category: string }; total: number }>([
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            category: '$category',
          },
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  // Pivot monthly rows into { month, Revenue, Expense }
  const monthlyMap = new Map<string, { month: string; Revenue: number; Expense: number }>();
  for (const row of monthlyRows) {
    const entry = monthlyMap.get(row._id.month) ?? { month: row._id.month, Revenue: 0, Expense: 0 };
    if (row._id.category === 'Revenue') entry.Revenue = round2(entry.Revenue + row.total);
    else entry.Expense = round2(entry.Expense + row.total);
    monthlyMap.set(row._id.month, entry);
  }
  const monthlyTrend = [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month));

  const categoryBreakdown = categoryRows.map((row) => ({
    category: row._id,
    total: round2(row.total),
    count: row.count,
  }));
  const statusBreakdown = statusRows.map((row) => ({
    status: row._id,
    total: round2(row.total),
    count: row.count,
  }));

  const totalRevenue = categoryBreakdown.find((c) => c.category === 'Revenue')?.total ?? 0;
  const totalExpenses = categoryBreakdown.find((c) => c.category === 'Expense')?.total ?? 0;
  const transactionCount = categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
  const pendingCount = statusBreakdown.find((s) => s.status === 'Pending')?.count ?? 0;

  return {
    metrics: {
      totalRevenue,
      totalExpenses,
      netBalance: round2(totalRevenue - totalExpenses),
      transactionCount,
      pendingCount,
    },
    monthlyTrend,
    categoryBreakdown,
    statusBreakdown,
  };
}
