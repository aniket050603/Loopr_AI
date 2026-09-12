import type { Request, Response } from 'express';
import { TransactionModel, TRANSACTION_FIELDS, type TransactionField } from '../models/Transaction.js';
import { listTransactions, parseTransactionQuery } from '../utils/query.js';
import { buildAnalytics } from '../utils/analytics.js';
import { buildCsv } from '../utils/csv.js';

/** GET /api/transactions — paginated, filterable, searchable, sortable list */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  const parsed = parseTransactionQuery(req.query as Record<string, unknown>);
  const result = await listTransactions(parsed);
  res.json(result);
}

/** GET /api/transactions/summary — KPI metrics + chart series */
export async function getSummary(_req: Request, res: Response): Promise<void> {
  const summary = await buildAnalytics();
  res.json(summary);
}

/**
 * POST /api/export/csv
 * Body: { columns: TransactionField[], filters?: same filters as GET /transactions }
 * Responds with a CSV file attachment honoring the requested columns and filters.
 */
export async function exportCsv(req: Request, res: Response): Promise<void> {
  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as {
    columns?: unknown;
  };

  const requested = Array.isArray(body.columns) ? body.columns : [];
  const columns = TRANSACTION_FIELDS.filter((field) =>
    requested.includes(field as string),
  ) as TransactionField[];
  if (columns.length === 0) {
    res.status(400).json({
      message: `Provide at least one column to export. Available columns: ${TRANSACTION_FIELDS.join(', ')}`,
    });
    return;
  }

  // Accept filters from either the JSON body or the query string (frontend sends both).
  const parsed = parseTransactionQuery({
    ...(req.query as Record<string, unknown>),
    ...((req.body ?? {}) as Record<string, unknown>),
  });
  // CSV export should include every matching row, not a single page.
  const rows = await TransactionModel.find(parsed.filter)
    .sort(parsed.sort)
    .select({ _id: 0 })
    .lean();

  const csv = buildCsv(rows, columns);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="transactions-export.csv"`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.send(csv);
}
