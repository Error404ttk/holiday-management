export type AuditAction =
  | 'CREATE_HOLIDAY'
  | 'UPDATE_HOLIDAY'
  | 'DISABLE_HOLIDAY'
  | 'ENABLE_HOLIDAY'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PERMISSION_DENIED'
  | 'HOLIDAY_CHECK';

export interface AuditLog {
  id: number;
  action: AuditAction;
  username: string;
  full_name?: string;
  ip_address: string;
  user_agent?: string;
  target_table: string;
  target_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string;
  created_at: string;
}
