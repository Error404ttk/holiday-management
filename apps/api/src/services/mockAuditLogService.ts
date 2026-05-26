import { auditLogsMock } from '../data/auditLogs.mock.js';
import type { AuditAction, AuditLog } from '../types/audit-log.js';

interface AuditLogInput {
  action: AuditAction;
  targetId: string;
  oldValue: unknown;
  newValue: unknown;
  reason?: string;
  ipAddress?: string;
}

export function listAuditLogs(): AuditLog[] {
  return auditLogsMock;
}

export function addAuditLog(input: AuditLogInput): AuditLog {
  const log: AuditLog = {
    id: Math.max(...auditLogsMock.map((item) => item.id), 0) + 1,
    action: input.action,
    username: 'mock-user',
    ip_address: input.ipAddress ?? '127.0.0.1',
    target_table: 'holiday',
    target_id: input.targetId,
    old_value: input.oldValue as Record<string, unknown> | null,
    new_value: input.newValue as Record<string, unknown> | null,
    reason: input.reason ?? '',
    created_at: new Date().toISOString()
  };

  auditLogsMock.unshift(log);
  return log;
}
