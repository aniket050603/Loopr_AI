import { Router } from 'express';
import { exportCsv, getTransactions, getSummary } from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every transaction/analytics/export route requires a valid JWT.
router.use(requireAuth);

router.get('/', getTransactions);
router.get('/summary', getSummary);
router.post('/export/csv', exportCsv);

export default router;
