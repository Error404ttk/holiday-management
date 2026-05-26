import { reactive } from 'vue';
import type { Holiday } from '../types/holiday';

export const holidaysMock = reactive<Holiday[]>([
  { id: 1, holiday_date: '2025-10-13', holiday_name: 'วันนวมินทรมหาราช', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 2, holiday_date: '2025-10-23', holiday_name: 'วันปิยมหาราช', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 3, holiday_date: '2025-12-05', holiday_name: 'วันคล้ายวันพระบรมราชสมภพ ร.9', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 4, holiday_date: '2025-12-10', holiday_name: 'วันรัฐธรรมนูญ', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 5, holiday_date: '2025-12-31', holiday_name: 'วันสิ้นปี', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 6, holiday_date: '2026-01-01', holiday_name: 'วันขึ้นปีใหม่', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 7, holiday_date: '2026-04-06', holiday_name: 'วันจักรี', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 8, holiday_date: '2026-04-13', holiday_name: 'วันสงกรานต์', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 9, holiday_date: '2026-04-14', holiday_name: 'วันสงกรานต์', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 10, holiday_date: '2026-04-15', holiday_name: 'วันสงกรานต์', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 11, holiday_date: '2026-05-04', holiday_name: 'วันฉัตรมงคล', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 12, holiday_date: '2026-06-03', holiday_name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 13, holiday_date: '2026-07-28', holiday_name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 14, holiday_date: '2026-08-12', holiday_name: 'วันแม่แห่งชาติ', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 15, holiday_date: '2026-09-24', holiday_name: 'วันหยุดภายในหน่วยงาน', holiday_type: 'หน่วยงาน', active: false, note: 'ตัวอย่างรายการปิดใช้งาน' },
  { id: 16, holiday_date: '2026-10-13', holiday_name: 'วันนวมินทรมหาราช', holiday_type: 'ราชการ', active: true, note: '' },
  { id: 17, holiday_date: '2027-01-01', holiday_name: 'วันขึ้นปีใหม่', holiday_type: 'ราชการ', active: true, note: '' }
]);

