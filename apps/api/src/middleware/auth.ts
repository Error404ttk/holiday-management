import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { writeAppAuditLog } from '../services/appAuditLogService.js';
import { hasPermission } from '../services/permissionService.js';
import { getUserById } from '../services/userService.js';
import type { AuthUser, Permission } from '../types/auth.js';
import { ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบ' });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    const user = await getUserById(Number(payload.sub));
    if (!user) {
      res.status(401).json({ success: false, message: 'บัญชีผู้ใช้ไม่พร้อมใช้งาน' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

export function requirePermission(permission: Permission) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
      if (req.user) {
        logger.warn('Permission denied', { username: req.user.username, permission, role: req.user.role });
        try {
          await writeAppAuditLog({
            action: 'PERMISSION_DENIED',
            username: req.user.username,
            fullName: req.user.full_name,
            ipAddress: req.ip || '',
            userAgent: req.get('user-agent') || '',
            targetTable: 'permission',
            targetId: permission,
            oldValue: null,
            newValue: { role: req.user.role, permission },
            reason: 'ผู้ใช้งานไม่มีสิทธิ์ทำรายการนี้'
          });
        } catch (error) {
          logger.error('Permission audit log failed', error);
        }
      }
      res.status(403).json({ success: false, code: ErrorCode.FORBIDDEN, message: 'ไม่มีสิทธิ์ทำรายการนี้' });
      return;
    }

    next();
  };
}
