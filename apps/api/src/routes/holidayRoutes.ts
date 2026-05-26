import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../middleware/auth.js';
import { getHolidaySchema } from '../services/holidaySchemaService.js';
import { getHolidayFromHosxpByDate, getHolidayFromHosxpById, listHolidaysFromHosxp } from '../services/hosxpHolidayReadService.js';
import {
  createHoliday as createHolidayInHosxp,
  updateHoliday as updateHolidayInHosxp,
  updateHolidayStatus as updateHolidayStatusInHosxp
} from '../services/hosxpHolidayWriteService.js';

import { HttpError, ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

export const holidayRoutes = Router();

const listQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2800).default(new Date().getFullYear()),
  mode: z.enum(['calendar', 'fiscal']).default('calendar')
});

function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const isoDateSchema = z.string().refine(isRealIsoDate, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD และเป็นวันที่จริง');

const checkQuerySchema = z.object({
  date: isoDateSchema
});

const holidayBodySchema = z.object({
  holiday_date: isoDateSchema,
  holiday_name: z.string().trim().min(1).max(255),
  holiday_type: z.string().trim().max(100).default(''),
  active: z.boolean().default(true),
  note: z.string().trim().max(1000).default(''),
  reason: z.string().trim().max(1000).optional()
});

const statusBodySchema = z.object({
  active: z.boolean(),
  reason: z.string().trim().min(1).max(1000)
});

function actorFromRequest(req: AuthenticatedRequest) {
  const user = req.user;
  return {
    username: user?.username ?? 'api-user',
    fullName: user?.full_name ?? '',
    ipAddress: req.ip || '',
    userAgent: req.get('user-agent') || ''
  };
}

holidayRoutes.get('/holidays', authenticate, requirePermission('holiday.view'), async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const ceYear = query.year >= 2400 ? query.year - 543 : query.year;
    const rows = await listHolidaysFromHosxp(ceYear, query.mode);
    res.json({ success: true, data: rows });
  } catch (error) {
    logger.error('HOSxP holiday SELECT failed', error);
    res.status(503).json({
      success: false,
      code: ErrorCode.DATABASE_ERROR,
      message: 'ไม่สามารถอ่านข้อมูลวันหยุดจาก HOSxP ได้ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล'
    });
  }
});

holidayRoutes.get('/holidays/schema', authenticate, async (req, res) => {
  try {
    const schema = await getHolidaySchema();
    res.json({
      success: true,
      data: {
        activeColumnSupported: Boolean(schema.activeColumn),
        typeColumnSupported: Boolean(schema.typeColumn),
        noteColumnSupported: Boolean(schema.noteColumn)
      }
    });
  } catch (error) {
    logger.error('HOSxP schema fetch failed', error);
    res.status(500).json({
      success: false,
      code: ErrorCode.SCHEMA_MISMATCH,
      message: 'ไม่สามารถดึงการตั้งค่าโครงสร้างตารางได้'
    });
  }
});

holidayRoutes.get('/holidays/:id', authenticate, requirePermission('holiday.view'), async (req, res) => {
  try {
    const holiday = await getHolidayFromHosxpById(String(req.params.id));
    if (!holiday) {
      res.status(404).json({ success: false, code: ErrorCode.NOT_FOUND, message: 'ไม่พบรายการวันหยุด' });
      return;
    }

    res.json({ success: true, data: holiday });
  } catch (error) {
    logger.error('HOSxP holiday SELECT by id failed', error, { id: req.params.id });
    res.status(503).json({
      success: false,
      code: ErrorCode.DATABASE_ERROR,
      message: 'ไม่สามารถอ่านรายละเอียดวันหยุดจาก HOSxP ได้'
    });
  }
});

holidayRoutes.post('/holidays', authenticate, requirePermission('holiday.create'), (req: AuthenticatedRequest, res, next) => {
  try {
    const body = holidayBodySchema.parse(req.body);
    createHolidayInHosxp(body, actorFromRequest(req))
      .then((holiday) => res.status(201).json({ success: true, data: holiday }))
      .catch(next);
  } catch (error) {
    next(error);
  }
});

holidayRoutes.put('/holidays/:id', authenticate, requirePermission('holiday.update'), (req: AuthenticatedRequest, res, next) => {
  try {
    const body = holidayBodySchema.parse(req.body);
    updateHolidayInHosxp(String(req.params.id), body, actorFromRequest(req))
      .then((holiday) => res.json({ success: true, data: holiday }))
      .catch(next);
  } catch (error) {
    next(error);
  }
});

holidayRoutes.patch('/holidays/:id/status', authenticate, requirePermission('holiday.disable'), (req: AuthenticatedRequest, res, next) => {
  try {
    const body = statusBodySchema.parse(req.body);
    updateHolidayStatusInHosxp(String(req.params.id), body.active, body.reason, actorFromRequest(req))
      .then((holiday) => res.json({ success: true, data: holiday }))
      .catch(next);
  } catch (error) {
    next(error);
  }
});

holidayRoutes.get('/check-holiday', authenticate, requirePermission('holiday.view'), async (req, res, next) => {
  try {
    const query = checkQuerySchema.parse(req.query);
    const holiday = await getHolidayFromHosxpByDate(query.date);
    const active = holiday?.active;
    res.json({
      success: true,
      data: {
        date: query.date,
        isHoliday: active === true || (holiday && active === undefined),
        status: holiday ? (active === false ? 'inactive' : 'active') : 'not_found',
        holiday
      }
    });
  } catch (error) {
    next(error);
  }
});
