# แผนฟังก์ชั่นยกเลิก/ลบรายการวันหยุดอย่างปลอดภัย

## หลักการสำคัญ

ไม่แนะนำให้ทำ hard delete กับตาราง `hosxp.holiday` โดยตรง
เพราะระบบนี้แตะฐาน HOSxP จริง และเอกสาร production checklist เดิมกำหนดว่า DB user ไม่ควรมีสิทธิ์ `DELETE`

แนวทางที่เหมาะสมคือทำเป็น **Owner-based Cancel / Soft Delete** ฝั่ง app database
โดยใช้คำใน UI ว่า `ยกเลิกรายการ` หรือ `ลบรายการที่สร้างเอง` แทนการลบถาวร

## เหตุผล

- ตาราง `holiday` ของ HOSxP เป็นข้อมูลกลาง หากลบผิด rollback ยาก
- schema ปัจจุบันไม่มี field เจ้าของรายการ เช่น `created_by`
- รายการวันหยุดเดิมจาก HOSxP ไม่สามารถพิสูจน์ ownership ได้อย่างปลอดภัย
- วันเสาร์-อาทิตย์และวันหยุดเดิมควรถูกมองเป็น baseline/system-owned
- ระบบเดิมออกแบบให้ไม่มี `DELETE endpoint` และใช้ audit log ทุกครั้ง

## โครงสร้างข้อมูลที่ควรเพิ่ม

เพิ่มตารางฝั่ง app database เช่น `holiday_ownerships` หรือ `holiday_app_records`

ข้อมูลที่ควรเก็บ:

- `id`
- `holiday_id`
- `holiday_date`
- `created_by_user_id`
- `created_by_username`
- `source`
- `cancelled_at`
- `cancelled_by_user_id`
- `cancelled_by_username`
- `cancel_reason`
- `created_at`
- `updated_at`

ค่า `source` ควรเริ่มต้นที่ `app` สำหรับรายการที่สร้างผ่านระบบนี้

## เงื่อนไขการยกเลิก/ลบ

อนุญาตให้ยกเลิกได้เฉพาะเมื่อครบทุกเงื่อนไข:

- ผู้ใช้มี permission สำหรับการยกเลิก เช่น `holiday.cancel_own`
- รายการมี ownership record ใน app database
- `created_by_user_id` ตรงกับ user ปัจจุบัน
- รายการไม่ใช่วันเสาร์-อาทิตย์
- รายการไม่ใช่วันหยุดเดิมจาก HOSxP ที่ไม่มี ownership
- ผู้ใช้ยืนยันด้วยรหัสผ่านของตัวเองสำเร็จ
- ผู้ใช้กรอกเหตุผลในการยกเลิก

## เงื่อนไขที่ต้องปฏิเสธ

กรณีลบไม่ได้ ให้แสดง popup พร้อมเหตุผล เช่น:

- `ไม่สามารถลบได้: รายการนี้ไม่ได้ถูกสร้างโดยบัญชีของคุณ`
- `ไม่สามารถลบได้: รายการนี้เป็นวันเสาร์-อาทิตย์ ให้แก้ไขหรือปิดใช้งานตามสิทธิ์เท่านั้น`
- `ไม่สามารถลบได้: รายการนี้เป็นวันหยุดเดิมจาก HOSxP ไม่มีข้อมูลเจ้าของจากระบบนี้ ให้แก้ไขเท่านั้น`
- `ไม่สามารถลบได้: ต้องยืนยันรหัสผ่านก่อนทำรายการ`

## UX ที่ควรทำ

ก่อนยกเลิกต้องยืนยัน 2 ชั้น:

1. Popup แสดงรายละเอียดรายการ:
   - วันที่
   - ชื่อวันหยุด
   - ผลกระทบของการยกเลิก
   - เหตุผลที่ต้องกรอก

2. ช่องกรอกรหัสผ่านของผู้ใช้ปัจจุบัน:
   - backend ต้อง re-authenticate ด้วย password
   - ห้ามตรวจ password เฉพาะ frontend

## Backend API ที่แนะนำ

ใช้ endpoint แบบ action แทน `DELETE`

```text
POST /api/holidays/:id/cancel
```

ตัวอย่าง body:

```json
{
  "password": "current-user-password",
  "reason": "สร้างผิดรายการ",
  "confirmText": "ยืนยันยกเลิก"
}
```

backend ต้องตรวจ:

- token และ current user
- permission
- password ถูกต้อง
- ownership
- weekend/system-owned rule
- duplicate/cancel state

## Audit Log

ควรเพิ่ม action:

- `HOLIDAY_CANCEL`
- `HOLIDAY_CANCEL_DENIED`

ข้อมูล audit log ต้องมี:

- actor username/full name
- target holiday id/date
- old value
- new value หรือ cancel metadata
- reason
- ip address
- user agent

ห้ามบันทึก password ลง audit log

## ลำดับ implementation ที่แนะนำ

1. เพิ่ม migration/table สำหรับ ownership/cancel metadata
2. ผูก create holiday ให้สร้าง ownership record ทุกครั้ง
3. เพิ่ม backend cancel endpoint พร้อม re-auth password
4. ปรับ list/read API ให้ merge ownership และ cancel state
5. เพิ่มปุ่มและ confirm dialog ใน `HolidayListPage.vue`
6. เพิ่ม popup เหตุผลเมื่อทำรายการไม่ได้
7. เพิ่ม audit log สำหรับ success และ denied cases
8. ทดสอบกรณี owner, non-owner, weekend, system-owned และ password ผิด

## ข้อสรุป

ไม่ควรลบข้อมูลจริงจาก HOSxP ในรอบนี้

ควรทำเป็น owner-based cancel/soft delete ที่ตรวจสิทธิ์จาก backend
พร้อม password confirmation และ audit log ครบถ้วน
