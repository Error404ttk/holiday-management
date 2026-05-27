import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../middleware/auth.js';
import { createUser, listUsers, updateUser } from '../services/userService.js';
import { HttpError, ErrorCode } from '../utils/httpError.js';

export const userRoutes = Router();

const roleSchema = z.enum(['super_admin', 'admin', 'viewer']);

const createUserSchema = z.object({
  username: z.string().trim().min(3, 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร').max(80).regex(/^[a-zA-Z0-9._-]+$/, 'ชื่อผู้ใช้งานใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง และขีดล่าง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(120),
  full_name: z.string().trim().min(1, 'กรุณากรอกชื่อ-สกุล').max(150),
  role: roleSchema,
  active: z.boolean().default(true)
});

const updateUserSchema = z.object({
  full_name: z.string().trim().min(1, 'กรุณากรอกชื่อ-สกุล').max(150),
  role: roleSchema,
  active: z.boolean(),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(120).optional().or(z.literal(''))
});

const listUsersQuerySchema = z.object({
  keyword: z.string().trim().max(100).default(''),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

function actor(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new HttpError(401, 'กรุณาเข้าสู่ระบบ', ErrorCode.UNAUTHORIZED);
  }

  return {
    id: req.user.id,
    username: req.user.username,
    fullName: req.user.full_name,
    role: req.user.role,
    ipAddress: req.ip || '',
    userAgent: req.get('user-agent') || ''
  };
}

userRoutes.get('/users', authenticate, requirePermission('user.manage'), async (req, res, next) => {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    res.json({ success: true, data: await listUsers(query) });
  } catch (error) {
    next(error);
  }
});

userRoutes.post('/users', authenticate, requirePermission('user.manage'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);
    const user = await createUser(body, actor(req));
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

userRoutes.put('/users/:id', authenticate, requirePermission('user.manage'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'รหัสผู้ใช้งานไม่ถูกต้อง', ErrorCode.VALIDATION_ERROR);
    }

    const body = updateUserSchema.parse(req.body);
    const normalizedBody = {
      ...body,
      password: body.password || undefined
    };

    const after = await updateUser(id, normalizedBody, actor(req));
    res.json({ success: true, data: after });
  } catch (error) {
    next(error);
  }
});
