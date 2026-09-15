import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register, updateTheme } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Basic brute-force protection on credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);
router.patch('/theme', requireAuth, updateTheme);

export default router;
