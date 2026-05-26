# Production Checklist

ใช้รายการนี้ก่อน deploy ระบบจัดการวันหยุด HOSxP ไปใช้งานจริง

## Database

- [ ] Backup ตาราง `holiday` แล้ว และทดสอบว่าไฟล์ backup เปิดอ่านได้
- [ ] ทดสอบ restore ในเครื่องทดสอบหรือช่วง maintenance แล้ว
- [ ] DB user สำหรับอ่านมีเฉพาะ `SELECT`
- [ ] DB user สำหรับเขียนมีเฉพาะ `SELECT`, `INSERT`, `UPDATE` บน `hosxp.holiday`
- [ ] DB user สำหรับเขียนมี `INSERT` บน `APP_DB_NAME.audit_logs`
- [ ] DB user ไม่มี `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT OPTION`
- [ ] ยืนยัน schema ด้วย `SHOW COLUMNS FROM holiday`
- [ ] ตั้งค่า `HOLIDAY_ID_COLUMN` เป็น primary key จริง
- [ ] ถ้าไม่มี active/status column ให้ไม่เปิดใช้ปุ่มปิดใช้งาน

## Environment

- [ ] `.env` อยู่บน server จริง และไม่ commit เข้า repository
- [ ] `NODE_ENV=production`
- [ ] `API_PORT` หรือ `APP_PORT` ถูกต้อง
- [ ] `FRONTEND_ORIGIN` ตรงกับ URL frontend จริง
- [ ] `JWT_SECRET` เป็นค่าสุ่มยาวและไม่ใช้ค่า default
- [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` ถูกต้อง
- [ ] `DB_USER_WRITE`, `DB_PASSWORD_WRITE` ถูกต้อง
- [ ] `APP_DB_NAME`, `APP_DB_USER`, `APP_DB_PASSWORD` ถูกต้อง
- [ ] Frontend ตั้ง `VITE_API_BASE_URL` ตรงกับ backend

## Security

- [ ] Backend เปิด helmet แล้ว
- [ ] CORS จำกัดเฉพาะ `FRONTEND_ORIGIN`
- [ ] Login API มี rate limit เบื้องต้น
- [ ] Request body จำกัดขนาด
- [ ] Response error production ไม่ส่ง stack trace
- [ ] Server log ไม่มี DB password หรือ JWT secret
- [ ] ไม่มี endpoint `DELETE`

## Functional Test

- [ ] `GET /api/health` สำเร็จ
- [ ] `GET /api/db/health` สำเร็จ
- [ ] Login admin สำเร็จ
- [ ] Login ผิดบันทึก `LOGIN_FAILED`
- [ ] Login ถูกบันทึก `LOGIN_SUCCESS`
- [ ] viewer เข้าอ่านรายการวันหยุดได้
- [ ] viewer ไม่เห็นปุ่มเพิ่ม/แก้ไข/ปิดใช้งาน
- [ ] admin เพิ่มวันหยุดได้
- [ ] admin แก้ไขวันหยุดได้และต้องกรอกเหตุผล
- [ ] admin ปิดใช้งานได้เฉพาะเมื่อ schema รองรับ active/status
- [ ] วันที่ซ้ำถูก block หรือแจ้งเตือนก่อนบันทึก
- [ ] audit log บันทึก `CREATE_HOLIDAY`, `UPDATE_HOLIDAY`, `DISABLE_HOLIDAY`
- [ ] token หมดอายุแล้ว frontend redirect ไป `/login`
- [ ] `npm run build` ผ่าน
- [ ] UAT ผ่านตาม `docs/UAT_CHECKLIST.md`
- [ ] PM2 start backend ได้
- [ ] PM2 auto start หลัง reboot ได้
- [ ] Firewall เปิดเท่าที่จำเป็น

## Rollback

- [ ] มี release ก่อนหน้าพร้อมใช้งาน
- [ ] รู้ path ของไฟล์ backup ล่าสุด
- [ ] ทดสอบขั้นตอน rollback application แล้ว
- [ ] ทดสอบขั้นตอน restore ตาราง `holiday` แล้ว
