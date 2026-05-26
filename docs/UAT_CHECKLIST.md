# UAT Checklist

ใช้ checklist นี้ก่อนเปิดใช้งานจริงกับฐาน HOSxP

## Authentication

- [ ] Login สำเร็จด้วยบัญชี admin
- [ ] Login ผิดต้องแสดง error
- [ ] Login ผิดต้องบันทึก `LOGIN_FAILED`
- [ ] Login สำเร็จต้องบันทึก `LOGIN_SUCCESS`
- [ ] Token หมดอายุแล้ว frontend กลับไปหน้า login

## Permission

- [ ] viewer ดู Dashboard ได้
- [ ] viewer ดูรายการวันหยุดได้
- [ ] viewer ดู Audit Log ได้ถ้าตั้งสิทธิ์ไว้
- [ ] viewer ไม่เห็นปุ่มเพิ่มวันหยุด
- [ ] viewer ไม่เห็นปุ่มแก้ไข
- [ ] viewer ไม่เห็นปุ่มปิดใช้งาน
- [ ] viewer เรียก API เขียนข้อมูลโดยตรงแล้วต้องได้ `403`
- [ ] การถูกปฏิเสธสิทธิ์ต้องบันทึก `PERMISSION_DENIED`

## Holiday List

- [ ] แสดงวันที่เป็นปี พ.ศ. ถูกต้อง
- [ ] เลือกปีปฏิทินได้
- [ ] เลือกปีงบประมาณได้
- [ ] ค้นหาชื่อวันหยุดได้
- [ ] สถานะ active แสดงถูกต้อง
- [ ] ถ้า schema ไม่มี active/status ต้องไม่ใช้ฟีเจอร์ปิดใช้งาน

## Create Holiday

- [ ] admin เพิ่มวันหยุดได้
- [ ] ก่อนบันทึกต้องมี confirm dialog
- [ ] วันที่ว่างต้องบันทึกไม่ได้
- [ ] ชื่อวันหยุดว่างต้องบันทึกไม่ได้
- [ ] วันที่รูปแบบผิดต้องถูกปฏิเสธ
- [ ] วันที่ไม่มีจริง เช่น `2026-02-30` ต้องถูกปฏิเสธ
- [ ] วันที่ซ้ำต้องถูกแจ้งเตือนหรือ block
- [ ] หลังบันทึกสำเร็จกลับหน้ารายการ
- [ ] audit log บันทึก `CREATE_HOLIDAY`

## Update Holiday

- [ ] admin แก้ไขวันหยุดได้
- [ ] ก่อนบันทึกต้องมี confirm dialog
- [ ] ต้องกรอก reason ตอนแก้ไข
- [ ] id ที่ไม่มีจริงต้อง error
- [ ] audit log บันทึก `UPDATE_HOLIDAY`
- [ ] audit log มี `old_value`
- [ ] audit log มี `new_value`
- [ ] audit log มี `username`, `full_name`, `ip_address`, `user_agent`

## Disable/Enable

- [ ] ก่อนปิดใช้งานต้องมี confirm dialog
- [ ] ต้องกรอก reason ตอนปิดใช้งาน
- [ ] audit log บันทึก `DISABLE_HOLIDAY`
- [ ] ถ้ามีการเปิดกลับ ต้องบันทึก `ENABLE_HOLIDAY`
- [ ] ไม่มี DELETE endpoint

## Check Holiday

- [ ] ตรวจวันที่ที่เป็นวันหยุดแล้วแสดง “เป็นวันหยุด”
- [ ] ตรวจวันที่ที่ไม่ใช่วันหยุดแล้วแสดง “ไม่ใช่วันหยุด”
- [ ] ตรวจวันที่ที่ถูกปิดใช้งานแล้วแสดง “พบข้อมูลวันหยุด แต่ถูกปิดใช้งาน”
- [ ] แสดงวันที่เป็น พ.ศ. ถูกต้อง

## Error Handling

- [ ] ปิด backend แล้ว frontend ต้องแจ้ง error ไม่ค้างเงียบ
- [ ] ถอดสิทธิ์ `UPDATE` ของ DB user แล้วระบบต้อง error และไม่เขียน audit log หลอก
- [ ] production response ไม่ส่ง stack trace
- [ ] server log ไม่มี password, token, JWT secret, DB password

## Build

- [ ] `npm run typecheck` ผ่าน
- [ ] `npm run build` ผ่าน
- [ ] frontend preview เปิดได้
- [ ] backend start ด้วย production env ได้
