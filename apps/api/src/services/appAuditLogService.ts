import type { PoolConnection } from 'mysql2/promise';
import { env } from '../config/env.js';
import { appDbPool } from '../db/pool.js';
import { quoteIdentifier } from './holidaySchemaService.js';

export interface AuditLogFilters {
  username?: string;
  action?: string | null;
  startDate?: string;
  endDate?: string;
}

interface AppAuditLogInput {
  action: string;
  username: string;
  fullName?: string;
  ipAddress: string;
  userAgent?: string;
  targetTable: string;
  targetId: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
}

const auditColumns = '(username, full_name, action, table_name, record_id, old_value, new_value, reason, ip_address, user_agent, created_at)';
const auditValues = 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';

function auditParams(input: AppAuditLogInput) {
  return [
    input.username,
    input.fullName ?? '',
    input.action,
    input.targetTable,
    input.targetId,
    input.oldValue == null ? null : JSON.stringify(input.oldValue),
    input.newValue == null ? null : JSON.stringify(input.newValue),
    input.reason,
    input.ipAddress,
    input.userAgent ?? ''
  ];
}

export async function writeAppAuditLog(input: AppAuditLogInput): Promise<void> {
  await appDbPool.execute(
    `INSERT INTO audit_logs
      ${auditColumns}
     ${auditValues}`,
    auditParams(input)
  );
}

export async function writeAppAuditLogWithConnection(_connection: PoolConnection, input: AppAuditLogInput): Promise<void> {
  // Use appDbPool instead of the provided connection because they may be on different servers
  // or have different user permissions, preventing a single shared connection.
  await writeAppAuditLog(input);
}

export async function listAppAuditLogs(filters: AuditLogFilters = {}): Promise<Record<string, unknown>[]> {
  const where: string[] = [];
  const params: string[] = [];

  if (filters.username) {
    where.push('(username LIKE ? OR full_name LIKE ?)');
    params.push(`%${filters.username}%`, `%${filters.username}%`);
  }

  if (filters.action) {
    where.push('action = ?');
    params.push(filters.action);
  }

  if (filters.startDate) {
    where.push('DATE(created_at) >= ?');
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    where.push('DATE(created_at) <= ?');
    params.push(filters.endDate);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await appDbPool.execute(
    `SELECT
       id,
       action,
       username,
       full_name,
       ip_address,
       table_name AS target_table,
       record_id AS target_id,
       old_value,
       new_value,
       reason,
       user_agent,
       created_at
     FROM audit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT 200`,
    params
  );

  return rows as Record<string, unknown>[];
}
