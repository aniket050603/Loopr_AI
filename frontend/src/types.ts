export const TRANSACTION_FIELDS = [
  'id',
  'date',
  'amount',
  'category',
  'status',
  'user_id',
  'user_profile',
] as const;

export type TransactionField = (typeof TRANSACTION_FIELDS)[number];

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFilters {
  search?: string;
  category?: string;
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
}

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

export function filtersToParams(filters: TransactionFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.minAmount) params.set('minAmount', filters.minAmount);
  if (filters.maxAmount) params.set('maxAmount', filters.maxAmount);
  return params;
}
