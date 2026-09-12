import mongoose from 'mongoose';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { createApp } from '../app.js';
import { config } from '../config.js';
import { TransactionModel } from '../models/Transaction.js';

// Use explicit IPv4 loopback: matches how the server is bound and avoids
// IPv6/undici quirks on some Windows machines.
const HOST = '127.0.0.1';
const BASE = `http://${HOST}:${config.port}`;

interface Check {
  name: string;
  pass: boolean;
  detail?: string;
}

interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  text: string;
}

function request(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const payload = options.body === undefined ? null : JSON.stringify(options.body);
    const req = http.request(
      `${BASE}${path}`,
      {
        method: options.method ?? (payload ? 'POST' : 'GET'),
        headers: {
          'Content-Type': 'application/json',
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let text = '';
        res.on('data', (chunk) => (text += chunk));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, text }));
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function api(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<{ status: number; body: unknown }> {
  const res = await request(path, options);
  try {
    return { status: res.status, body: JSON.parse(res.text) };
  } catch {
    return { status: res.status, body: res.text };
  }
}

async function executeChecks(): Promise<void> {
  const checks: Check[] = [];
  const add = (name: string, pass: boolean, detail?: string) =>
    checks.push({ name, pass, detail });

  const total = await TransactionModel.countDocuments();
  if (total === 0) {
    throw new Error('Database is empty — run `npm run seed` first (against the same MONGODB_URI).');
  }

  // 1. Health
  const health = await api('/health');
  add('health returns ok', health.status === 200);

  // 2. Login with seeded demo user
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'demo@fin.com', password: 'demo1234' },
  });
  const loginBody = login.body as { token?: string };
  const token = loginBody.token;
  add('login returns JWT', login.status === 200 && typeof token === 'string');

  // 3. Unauthorized access blocked
  const noAuth = await api('/api/transactions');
  add(
    'transactions require token',
    noAuth.status === 401,
    `status=${noAuth.status} body=${JSON.stringify(noAuth.body).slice(0, 120)}`,
  );

  // 4. List with pagination
  const list = await api('/api/transactions?page=1&limit=5', { token });
  const listBody = list.body as { items?: unknown[]; total?: number; totalPages?: number };
  add(
    'list returns 5 items with correct total',
    list.status === 200 &&
      listBody.items?.length === 5 &&
      listBody.total === total &&
      listBody.totalPages === Math.ceil(total / 5),
  );

  // 5. Filter by category (limit is clamped to 100 server-side)
  const revenue = await api('/api/transactions?category=Revenue&limit=100', { token });
  const revenueBody = revenue.body as {
    items?: Array<{ category: string; id: number }>;
    total?: number;
  };
  const revenueIds = revenueBody.items?.map((t) => t.id) ?? [];
  add(
    'category filter: page 1 returns filtered rows only',
    revenue.status === 200 &&
      revenueBody.items?.every((t) => t.category === 'Revenue') === true &&
      revenueIds.length > 0 &&
      // Full page returned (a duplicated skip/offset would shrink the page).
      revenueIds.length === Math.min(100, revenueBody.total ?? 0),
    `total=${revenueBody.total} items=${revenueIds.length} firstId=${revenueIds[0]}`,
  );

  // 6. Sort by amount desc
  const sorted = await api('/api/transactions?sortBy=amount&sortDir=desc&limit=3', { token });
  const sortedBody = sorted.body as { items?: Array<{ amount: number }> };
  const amounts = sortedBody.items?.map((t) => t.amount) ?? [];
  add(
    'amount desc sort works',
    sorted.status === 200 &&
      amounts.length === 3 &&
      amounts[0] >= amounts[1] &&
      amounts[1] >= amounts[2],
  );

  // 7. Search
  const search = await api('/api/transactions?search=user_003&limit=100', { token });
  const searchBody = search.body as { items?: Array<{ user_id: string }>; total?: number };
  add(
    'search finds user_003 rows',
    search.status === 200 &&
      (searchBody.items?.length ?? 0) > 0 &&
      searchBody.items?.every((t) => t.user_id === 'user_003') === true,
  );

  // 8. Summary
  const summary = await api('/api/transactions/summary', { token });
  const summaryBody = summary.body as {
    metrics?: { transactionCount?: number; totalRevenue?: number; totalExpenses?: number };
    monthlyTrend?: unknown[];
  };
  add(
    'summary metrics correct',
    summary.status === 200 &&
      summaryBody.metrics?.transactionCount === total &&
      typeof summaryBody.metrics?.totalRevenue === 'number' &&
      (summaryBody.monthlyTrend?.length ?? 0) > 0,
  );

  // 9. CSV export
  const csvRes = await request('/api/transactions/export/csv', {
    method: 'POST',
    token,
    body: { columns: ['id', 'date', 'amount', 'category', 'status'] },
  });
  const headerLine = (csvRes.text.split('\n')[0] ?? '').replace(/"/g, '').trim();
  const lines = csvRes.text.trim().split('\n').length;
  add(
    'csv export correct',
    csvRes.status === 200 &&
      headerLine === 'id,date,amount,category,status' &&
      lines === total + 1 &&
      (csvRes.headers['content-disposition']?.includes('attachment') ?? false),
    `status=${csvRes.status} header=[${headerLine}] lines=${lines} (expected ${total + 1}) cd=${csvRes.headers['content-disposition'] ?? 'none'}`,
  );

  // 10. CSV export with query-string filters (frontend style)
  const csvQs = await request('/api/transactions/export/csv?category=Expense', {
    method: 'POST',
    token,
    body: { columns: ['id', 'category'] },
  });
  add(
    'csv export honors query-string filters',
    csvQs.status === 200 && csvQs.text.trim().split('\n').length - 1 > 0,
  );

  // Report
  const failed = checks.filter((c) => !c.pass);
  for (const check of checks) {
    console.log(
      `${check.pass ? '✅' : '❌'} ${check.name}${check.detail ? ` — ${check.detail}` : ''}`,
    );
  }
  console.log(
    `\n${failed.length === 0 ? '🎉 All smoke checks passed' : `💥 ${failed.length} check(s) failed`}`,
  );

  if (failed.length > 0) {
    throw new Error(`${failed.length} smoke check(s) failed`);
  }
}

/**
 * Boots the app in-process against config.mongoUri, runs all checks, tears down.
 * Returns 0 on success, 1 on failure.
 */
export async function runSmoke(): Promise<number> {
  // Guard: bail out politely if something is already listening on the port.
  try {
    await api('/health');
    console.error('❌ A server is already running on port', config.port, '— stop it first.');
    return 1;
  } catch {
    // expected: no server running
  }

  await mongoose.connect(config.mongoUri);
  const app = createApp();
  const server = app.listen(config.port, HOST);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  try {
    await executeChecks();
    return 0;
  } catch (error) {
    console.error('❌ Smoke test failed:', (error as Error).message);
    return 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  runSmoke().then((code) => process.exit(code));
}
