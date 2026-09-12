import type { FilterQuery } from 'mongoose';
import { TRANSACTION_FIELDS, TransactionModel, type Transaction } from '../models/Transaction.js';

export interface ParsedTransactionQuery {
  filter: FilterQuery<Transaction>;
  sort: Record<string, 1 | -1>;
  page: number;
  limit: number;
  select?: string;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asDate(value: unknown): Date | undefined {
  const str = asString(value);
  if (!str) return undefined;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseTransactionQuery(query: Record<string, unknown>): ParsedTransactionQuery {
  const filter: FilterQuery<Transaction> = {};

  const category = asString(query.category);
  if (category && category !== 'all') filter.category = category;

  const status = asString(query.status);
  if (status && status !== 'all') filter.status = status;

  const userId = asString(query.userId);
  if (userId && userId !== 'all') filter.user_id = userId;

  const amountFilter: Record<string, number> = {};
  const minAmount = asNumber(query.minAmount);
  const maxAmount = asNumber(query.maxAmount);
  if (minAmount !== undefined) amountFilter.$gte = minAmount;
  if (maxAmount !== undefined) amountFilter.$lte = maxAmount;
  if (Object.keys(amountFilter).length > 0) {
    filter.amount = amountFilter as FilterQuery<Transaction>['amount'];
  }

  const dateFilter: Record<string, Date> = {};
  const dateFrom = asDate(query.dateFrom);
  const dateTo = asDate(query.dateTo);
  if (dateFrom) dateFilter.$gte = dateFrom;
  if (dateTo) dateFilter.$lte = dateTo;
  if (Object.keys(dateFilter).length > 0) {
    filter.date = dateFilter as FilterQuery<Transaction>['date'];
  }

  const search = asString(query.search);
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');
    filter.$or = [
      { category: rx },
      { status: rx },
      { user_id: rx },
      { user_profile: rx },
      { $expr: { $regexMatch: { input: { $toString: '$amount' }, regex: escaped, options: 'i' } } },
    ] as FilterQuery<Transaction>['$or'];
  }

  const sortField = asString(query.sortBy);
  const sortDirRaw = asString(query.sortDir) ?? 'asc';
  const sortDir: 1 | -1 = sortDirRaw === 'desc' ? -1 : 1;
  let sort: Record<string, 1 | -1>;
  if (sortField && (TRANSACTION_FIELDS as readonly string[]).includes(sortField)) {
    sort = { [sortField]: sortDir, _id: 1 };
  } else {
    sort = { date: -1, _id: 1 };
  }

  const page = Math.max(1, asNumber(query.page) ?? 1);
  const limit = Math.min(100, Math.max(1, asNumber(query.limit) ?? 10));
  const fields = asString(query.fields);
  const select =
    fields && (TRANSACTION_FIELDS as readonly string[]).includes(fields) ? fields : undefined;

  return { filter, sort, page, limit, select };
}

export async function listTransactions(parsed: ParsedTransactionQuery) {
  const [items, total] = await Promise.all([
    TransactionModel.find(parsed.filter)
      .sort(parsed.sort)
      .skip((parsed.page - 1) * parsed.limit)
      .limit(parsed.limit)
      .select(parsed.select ? { [parsed.select]: 1, _id: 0 } : { _id: 0 })
      .lean(),
    TransactionModel.countDocuments(parsed.filter),
  ]);
  return {
    items,
    total,
    page: parsed.page,
    limit: parsed.limit,
    totalPages: Math.max(1, Math.ceil(total / parsed.limit)),
  };
}
