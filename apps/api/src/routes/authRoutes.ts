import { Router, type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { writeAppAuditLog } from '../services/appAuditLogService.js';
import { authenticateUser } from '../services/userService.js';
import { logger } from '../utils/logger.js';

export const authRoutes = Router();

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const loginWindowMs = 60_000;
const maxLoginAttempts = 10;

const loginRateLimit: RequestHandler = (req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + loginWindowMs });
    next();
    return;
  }

  if (current.count >= maxLoginAttempts) {
    res.status(429).json({ success: false, message: 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่' });
    return;
  }

  current.count += 1;
  next();
};

async function writeLoginAudit(action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED', username: string, req: AuthenticatedRequest): Promise<void> {
  try {
    await writeAppAuditLog({
      action,
      username,
      fullName: action === 'LOGIN_SUCCESS' ? username : '',
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || '',
      targetTable: 'users',
      targetId: username,
      oldValue: null,
      newValue: null,
      reason: action === 'LOGIN_SUCCESS' ? 'เข้าสู่ระบบสำเร็จ' : 'เข้าสู่ระบบไม่สำเร็จ'
    });
  } catch (error) {
    logger.error('Auth audit log failed', error);
  }
}

authRoutes.post('/auth/login', loginRateLimit, async (req: AuthenticatedRequest, res, next) => {
  let username = '';
  try {
    const body = loginSchema.parse(req.body);
    username = body.username;
    const user = await authenticateUser(body.username, body.password);
    const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    const token = jwt.sign({ sub: String(user.id) }, env.JWT_SECRET, signOptions);
    await writeLoginAudit('LOGIN_SUCCESS', `${user.username} (${user.full_name})`, req);
    res.json({ success: true, data: { token, user } });
  } catch (error) {
    if (username) {
      await writeLoginAudit('LOGIN_FAILED', username, req);
    }
    next(error);
  }
});

authRoutes.post('/auth/logout', (_req, res) => {
  res.json({ success: true, data: { ok: true } });
});

authRoutes.get('/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: req.user });
});
