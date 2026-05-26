import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { ZodError } from 'zod';
import { auditRoutes } from './routes/auditRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { env } from './config/env.js';
import { dbRoutes } from './routes/dbRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { holidayRoutes } from './routes/holidayRoutes.js';
import { HttpError, ErrorCode } from './utils/httpError.js';
import { logger } from './utils/logger.js';

export const app = express();

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'ทำรายการบ่อยเกินไป กรุณารอสักครู่' }
});

app.use(globalLimiter);
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '512kb' }));
app.use((req, res, next) => {
  req.setTimeout(10000);
  res.setTimeout(10000);
  next();
});

app.use('/api', healthRoutes);
app.use('/api', dbRoutes);
app.use('/api', authRoutes);
app.use('/api', holidayRoutes);
app.use('/api', auditRoutes);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: ErrorCode.VALIDATION_ERROR,
      message: error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง'
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      code: error.errorCode,
      message: error.message
    });
    return;
  }

  logger.error('Unhandled API error', error, {
    path: _req.path,
    method: _req.method,
    ip: _req.ip
  });

  res.status(500).json({
    success: false,
    code: ErrorCode.INTERNAL_ERROR,
    message: 'ไม่สามารถทำรายการได้ กรุณาติดต่อผู้ดูแลระบบ'
  });
};

app.use(errorHandler);
