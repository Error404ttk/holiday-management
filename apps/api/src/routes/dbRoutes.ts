import { Router } from 'express';
import { checkDatabaseHealth } from '../services/hosxpHolidayReadService.js';
import { ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

export const dbRoutes = Router();

dbRoutes.get('/db/health', async (_req, res) => {
  try {
    const health = await checkDatabaseHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    logger.error('DB health check failed', error);
    res.status(503).json({
      success: false,
      code: ErrorCode.DATABASE_ERROR,
      message: 'ไม่สามารถเชื่อมต่อฐานข้อมูล HOSxP ได้ กรุณาตรวจสอบการตั้งค่า DB_HOST'
    });
  }
});

