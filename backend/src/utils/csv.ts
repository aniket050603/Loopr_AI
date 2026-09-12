import { Parser } from '@json2csv/plainjs';
import type { TransactionField } from '../models/Transaction.js';

export interface CsvRow {
  id: number;
  date: Date | string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

export function buildCsv(
  rows: Array<Partial<CsvRow>>,
  columns: readonly TransactionField[],
): string {
  const parser = new Parser({
    fields: columns.map((field) => ({
      label: field,
      value: (item: Partial<CsvRow>) => {
        if (field === 'date' && item.date !== undefined) {
          const date = new Date(item.date);
          return Number.isNaN(date.getTime()) ? '' : date.toISOString();
        }
        return item[field];
      },
    })),
    header: true,
  });
  return parser.parse(rows) as string;
}
