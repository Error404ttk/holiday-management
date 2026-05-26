import type { AuditLog } from '../types/audit-log';

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
  },
  {
    id: 2,
    action: 'CREATE_HOLIDAY',
    username: 'it01',
    ip_address: '192.168.99.51',
    target_table: 'holiday',
    target_id: '18',
    old_value: null,
    new_value: { holiday_date: '2026-12-10', holiday_name: 'วันรัฐธรรมนูญ', active: true },
    reason: 'เพิ่มวันหยุดราชการ',
    created_at: '2026-05-20T15:10:00'
  },
  {
    id: 3,
    action: 'DISABLE_HOLIDAY',
    username: 'admin',
    ip_address: '192.168.99.50',
    target_table: 'holiday',
    target_id: '15',
    old_value: { holiday_date: '2026-09-24', holiday_name: 'วันหยุดภายในหน่วยงาน', active: true },
    new_value: { holiday_date: '2026-09-24', holiday_name: 'วันหยุดภายในหน่วยงาน', active: false },
    reason: 'ปิดใช้งานรายการที่ไม่ใช้ในปีปัจจุบัน',
    created_at: '2026-05-19T09:05:00'
  },
  {
    id: 4,
    action: 'LOGIN_SUCCESS',
    username: 'viewer01',
    ip_address: '192.168.99.80',
    target_table: 'users',
    target_id: 'viewer01',
    old_value: null,
    new_value: { username: 'viewer01' },
    reason: '',
    created_at: '2026-05-18T08:30:00'
  },
  {
    id: 5,
    action: 'SETTING_UPDATE',
    username: 'superadmin',
    ip_address: '192.168.99.10',
    target_table: 'settings',
    target_id: 'default_year_mode',
    old_value: { default_year_mode: 'calendar' },
    new_value: { default_year_mode: 'fiscal' },
    reason: 'ตั้งค่าเริ่มต้นตามปีงบประมาณ',
    created_at: '2026-05-17T13:45:00'
  }
];
