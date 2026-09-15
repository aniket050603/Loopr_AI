import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  filtersToParams,
  type SummaryResponse,
  type TransactionListResponse,
  type TransactionFilters,
} from '../types';

export interface TableQuery extends TransactionFilters {
  page: number;
  limit: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

function buildTableParams(query: TableQuery): string {
  const params = filtersToParams(query);
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  params.set('sortBy', query.sortBy);
  params.set('sortDir', query.sortDir);
  return params.toString();
}

/** Fetcher shared by the dashboard query and the post-login prefetch. */
export async function fetchSummary(): Promise<SummaryResponse> {
  const { data } = await api.get<SummaryResponse>('/transactions/summary');
  return data;
}

export function useTransactions(query: TableQuery) {
  return useQuery<TransactionListResponse>({
    queryKey: ['transactions', query],
    queryFn: async () => {
      const { data } = await api.get<TransactionListResponse>(
        `/transactions?${buildTableParams(query)}`,
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useSummary() {
  return useQuery<SummaryResponse>({
    queryKey: ['summary'],
    queryFn: fetchSummary,
  });
}

export function getTableQueryString(query: TableQuery): string {
  return buildTableParams(query);
}
