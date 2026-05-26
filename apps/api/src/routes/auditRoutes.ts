import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { listAppAuditLogs } from '../services/appAuditLogService.js';

export const auditRoutes = Router();

const auditQuerySchema = z.object({
  username: z.string().trim().max(150).optional(),
  action: z.string().trim().max(80).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(''))
});

auditRoutes.get('/audit-logs', authenticate, requirePermission('audit.view'), async (req, res, next) => {
  try {
    const query = auditQuerySchema.parse(req.query);
    res.json({ success: true, data: await listAppAuditLogs(query) });
  } catch (error) {
    next(error);
  }
});
