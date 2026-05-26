import type { AuditAction, AuditLog } from '../types/audit-log';
import { api, type ApiResponse } from './api';

export interface AuditLogFilters {
  username: string;
  action: AuditAction | null;
  startDate: string;
  endDate: string;
}

export async function getAuditLogs(params?: Partial<AuditLogFilters>): Promise<AuditLog[]> {
  const response = await api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
  return response.data.data;
}

export function listAuditActions(logs: AuditLog[]): AuditAction[] {
  return Array.from(new Set(logs.map((log) => log.action)));
}

export function filterAuditLogs(logs: AuditLog[], filters: AuditLogFilters): AuditLog[] {
  const username = (filters.username || '').toLocaleLowerCase('th-TH');

  return (logs || []).filter((log) => {
    if (!log) return false;
    
    const logDate = (log.created_at || '').slice(0, 10);
    const logUsername = (log.username || '').toLocaleLowerCase('th-TH');
    
    const matchesUsername = !username || logUsername.includes(username);
    const matchesAction = !filters.action || log.action === filters.action;
    const matchesStart = !filters.startDate || logDate >= filters.startDate;
    const matchesEnd = !filters.endDate || logDate <= filters.endDate;

    return matchesUsername && matchesAction && matchesStart && matchesEnd;
  });
}

export function formatAuditValue(value: Record<string, unknown> | null): string {
  return value ? JSON.stringify(value, null, 2) : '-';
}

export function getAuditActionColor(action: AuditAction): string {
  if (action.includes('FAILED') || action.includes('DISABLE')) return 'warning';
  if (action.includes('CREATE')) return 'success';
  if (action.includes('UPDATE')) return 'secondary';
  return 'primary';
}
