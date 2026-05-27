import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { appDbPool } from '../db/pool.js';
import type { AuthUser, Role } from '../types/auth.js';
import { HttpError, ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';
import { type AppAuditLogInput, writeAppAuditLogWithAppConnection } from './appAuditLogService.js';
import { getPermissionsForRole } from './permissionService.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
  active: number;
  last_login_at?: Date | string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

export interface UserListItem {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  active: boolean;
  last_login_at: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface CreateUserInput {
  username: string;
  password: string;
  full_name: string;
  role: Role;
  active: boolean;
}

export interface UpdateUserInput {
  full_name: string;
  role: Role;
  active: boolean;
  password?: string;
}

export interface ListUsersParams {
  keyword?: string;
  limit: number;
  offset: number;
}

export interface UserListResult {
  items: UserListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserActor {
  id: number;
  username: string;
  fullName?: string;
  role: Role;
  ipAddress: string;
  userAgent?: string;
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

export async function listUsers(params: ListUsersParams): Promise<UserListResult> {
  const where: string[] = [];
  const values: (string | number)[] = [];

  if (params.keyword) {
    where.push('(username LIKE ? OR full_name LIKE ?)');
    values.push(`%${params.keyword}%`, `%${params.keyword}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await appDbPool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM users
     ${whereSql}`,
    values
  );
  const [rows] = await appDbPool.execute<UserRow[]>(
    `SELECT id, username, full_name, role, active, last_login_at, created_at, updated_at
     FROM users
     ${whereSql}
     ORDER BY active DESC, username ASC
     LIMIT ? OFFSET ?`,
    [...values, params.limit, params.offset]
  );

  return {
    items: rows.map(toUserListItem),
    total: Number(countRows[0]?.total ?? 0),
    limit: params.limit,
    offset: params.offset
  };
}

export async function createUser(input: CreateUserInput, actor: UserActor): Promise<UserListItem> {
  assertSuperAdminPolicy(actor, null, input.role);
  const passwordHash = await bcrypt.hash(input.password, 10);
  const connection = await appDbPool.getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO users (username, password_hash, full_name, role, active)
       VALUES (?, ?, ?, ?, ?)`,
      [input.username, passwordHash, input.full_name, input.role, input.active ? 1 : 0]
    );

    const user = await getUserListItemByIdWithConnection(connection, result.insertId);
    await writeAppAuditLogWithAppConnection(connection, auditInput(actor, 'USER_CREATE', String(user.id), null, {
      username: input.username,
      full_name: input.full_name,
      role: input.role,
      active: input.active,
      password_changed: true
    }, 'เพิ่มผู้ใช้งาน'));
    await connection.commit();
    return user;
  } catch (error) {
    await rollback(connection);
    if (isDuplicateEntry(error)) {
      throw new HttpError(409, 'ชื่อผู้ใช้งานนี้มีอยู่แล้ว', ErrorCode.CONFLICT);
    }
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateUser(id: number, input: UpdateUserInput, actor: UserActor): Promise<UserListItem> {
  const connection = await appDbPool.getConnection();
  const params: (string | number)[] = [input.full_name, input.role, input.active ? 1 : 0];
  let passwordSql = '';

  try {
    await connection.beginTransaction();
    const before = await getUserListItemByIdWithConnection(connection, id);
    assertUserUpdatePolicy(actor, before, input);

    if (input.password) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      passwordSql = ', password_hash = ?';
      params.push(passwordHash);
    }

    params.push(id);
    await connection.execute(
      `UPDATE users
       SET full_name = ?, role = ?, active = ?${passwordSql}, updated_at = NOW()
       WHERE id = ?`,
      params
    );

    const after = await getUserListItemByIdWithConnection(connection, id);
    await writeAppAuditLogWithAppConnection(connection, auditInput(actor, 'USER_UPDATE', String(id), before, {
      ...after,
      password_changed: Boolean(input.password)
    }, 'แก้ไขผู้ใช้งาน'));
    await connection.commit();
    return after;
  } catch (error) {
    await rollback(connection);
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUserListItemById(id: number): Promise<UserListItem> {
  return getUserListItemByIdWithConnection(appDbPool, id);
}

async function getUserListItemByIdWithConnection(
  connection: Pick<typeof appDbPool, 'execute'> | PoolConnection,
  id: number
): Promise<UserListItem> {
  const [rows] = await connection.execute<UserRow[]>(
    `SELECT id, username, full_name, role, active, last_login_at, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) {
    throw new HttpError(404, 'ไม่พบผู้ใช้งาน', ErrorCode.NOT_FOUND);
  }

  return toUserListItem(rows[0]);
}

function assertSuperAdminPolicy(actor: UserActor, currentRole: Role | null, nextRole: Role): void {
  if ((currentRole === 'super_admin' || nextRole === 'super_admin') && actor.role !== 'super_admin') {
    throw new HttpError(403, 'เฉพาะผู้ดูแลระบบสูงสุดเท่านั้นที่จัดการสิทธิ์ super_admin ได้', ErrorCode.FORBIDDEN);
  }
}

function assertUserUpdatePolicy(actor: UserActor, before: UserListItem, input: UpdateUserInput): void {
  if (actor.id === before.id) {
    if (!input.active) {
      throw new HttpError(400, 'ไม่สามารถปิดใช้งานบัญชีของตนเองได้', ErrorCode.VALIDATION_ERROR);
    }

    if (input.role !== before.role) {
      throw new HttpError(400, 'ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตนเองได้', ErrorCode.VALIDATION_ERROR);
    }
  }

  assertSuperAdminPolicy(actor, before.role, input.role);
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

function toUserListItem(user: UserRow): UserListItem {
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    active: Boolean(user.active),
    last_login_at: user.last_login_at ?? null,
    created_at: user.created_at ?? null,
    updated_at: user.updated_at ?? null
  };
}

function isDuplicateEntry(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'ER_DUP_ENTRY');
}

function auditInput(
  actor: UserActor,
  action: 'USER_CREATE' | 'USER_UPDATE',
  targetId: string,
  oldValue: unknown,
  newValue: unknown,
  reason: string
): AppAuditLogInput {
  return {
    action,
    username: actor.username,
    fullName: actor.fullName,
    ipAddress: actor.ipAddress,
    userAgent: actor.userAgent,
    targetTable: 'users',
    targetId,
    oldValue,
    newValue,
    reason
  };
}

async function rollback(connection: PoolConnection): Promise<void> {
  try {
    await connection.rollback();
  } catch (error) {
    logger.error('User transaction rollback failed', error);
  }
}
