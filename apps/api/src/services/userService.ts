import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { appDbPool } from '../db/pool.js';
import type { AuthUser, Role } from '../types/auth.js';
import { HttpError, ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';
import { getPermissionsForRole } from './permissionService.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
  active: number;
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser> {
  const [rows] = await appDbPool.execute<UserRow[]>(
    `SELECT id, username, password_hash, full_name, role, active
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [username]
  );

  const user = rows[0];
  if (!user || !user.active) {
    logger.warn('Failed login attempt: User not found or inactive', { username });
    throw new HttpError(401, 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', ErrorCode.UNAUTHORIZED);
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    logger.warn('Failed login attempt: Incorrect password', { username });
    throw new HttpError(401, 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', ErrorCode.UNAUTHORIZED);
  }

  await appDbPool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  logger.info('User authenticated successfully', { username, role: user.role });
  return toAuthUser(user);
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  const [rows] = await appDbPool.execute<UserRow[]>(
    `SELECT id, username, password_hash, full_name, role, active
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  const user = rows[0];
  if (!user || !user.active) return null;
  return toAuthUser(user);
}

function toAuthUser(user: UserRow): AuthUser {
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    permissions: getPermissionsForRole(user.role)
  };
}

