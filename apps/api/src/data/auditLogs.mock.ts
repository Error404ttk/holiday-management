import type { AuditLog } from '../types/audit-log.js';

export const auditLogsMock: AuditLog[] = [
  {
    id: 1,
    action: 'UPDATE_HOLIDAY',
    username: 'admin',
    ip_address: '192.168.99.50',
    target_table: 'holiday',
    target_id: '12',
    old_value: { holiday_date: '2026-06-03', holiday_name: 'ชื่อเดิม', active: true },
    new_value: { holiday_date: '2026-06-03', holiday_name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ', active: true },
    reason: 'แก้ไขชื่อวันหยุดตามประกาศล่าสุด',
    created_at: '2026-05-21T10:24:00'
  }
];
