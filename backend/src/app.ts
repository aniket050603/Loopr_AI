import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin === '*' ? true : config.clientOrigin.split(','), credentials: false }));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Friendly root so opening the bare URL in a browser self-explains the service.
  app.get('/', (_req, res) => {
    res.json({
      name: 'Loopr — Financial Analytics API',
      status: 'ok',
      docs: 'See /api below. All routes require a Bearer token except /health and /api/auth/login.',
      endpoints: {
        health: 'GET /health',
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        keys: 'GET /api/auth/keys',
        me: 'GET /api/auth/me',
        theme: 'PATCH /api/auth/theme',
        transactions: 'GET /api/transactions?page=&limit=&sortBy=&sortDir=&category=&status=&search=&dateFrom=&dateTo=&minAmount=&maxAmount=',
        summary: 'GET /api/transactions/summary',
        exportCsv: 'POST /api/transactions/export/csv',
      },
      frontend: 'https://loopr-ai.vercel.app',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);

  // 404 for unknown API routes
  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  return app;
}
