# Backup and Rollback

เอกสารนี้ใช้ก่อนเปิดใช้งานระบบจัดการวันหยุดกับฐาน HOSxP จริง ห้ามข้ามขั้นตอน backup ก่อนทดสอบ INSERT/UPDATE

## Backup ตาราง holiday

ตั้งค่าตัวแปรให้ตรงกับเครื่องจริงก่อนรันคำสั่ง และเก็บไฟล์ backup นอกเครื่อง application

คำสั่งแบบสั้นตาม checklist:

```bash
mysqldump -h DB_HOST -u backup_user -p hosxp holiday > holiday_backup_YYYYMMDD_HHMM.sql
```

คำสั่งแบบแนะนำสำหรับ production:

```bash
mysqldump \
  -h <DB_HOST> \
  -P <DB_PORT> \
  -u <DB_BACKUP_USER> \
  -p \
  --single-transaction \
  --quick \
  --skip-lock-tables \
  <DB_NAME> holiday > holiday_backup_$(date +%Y%m%d_%H%M%S).sql
```

ตรวจว่าไฟล์ backup มีข้อมูล:

```bash
ls -lh holiday_backup_*.sql
grep -n "INSERT INTO" holiday_backup_*.sql | head
```

## Backup ฐาน app ก่อน UAT

ก่อนทดสอบ INSERT/UPDATE จริง ต้อง backup ทั้งสองส่วน:

- ตาราง `hosxp.holiday`
- ฐาน app เช่น `hosxp_holiday_app` ที่เก็บ `users` และ `audit_logs`

```bash
mysqldump \
  -h <APP_DB_HOST> \
  -P <APP_DB_PORT> \
  -u <APP_DB_BACKUP_USER> \
  -p \
  --single-transaction \
  --quick \
  <APP_DB_NAME> > app_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Restore ตาราง holiday

ใช้เมื่อทดสอบแล้วต้องย้อนข้อมูลกลับจาก backup เท่านั้น และควรทำในช่วง maintenance window

คำสั่งแบบสั้นตาม checklist:

```bash
mysql -h DB_HOST -u restore_user -p hosxp < holiday_backup_YYYYMMDD_HHMM.sql
```

คำสั่งแบบระบุ port:

```bash
mysql \
  -h <DB_HOST> \
  -P <DB_PORT> \
  -u <DB_RESTORE_USER> \
  -p \
  <DB_NAME> < holiday_backup_YYYYMMDD_HHMMSS.sql
```

หลัง restore ให้ตรวจจำนวนข้อมูลและสุ่มดูวันที่สำคัญ:

```sql
SELECT COUNT(*) FROM holiday;
SELECT * FROM holiday ORDER BY holiday_date DESC LIMIT 10;
```

## Rollback ระบบ Application

1. หยุด backend service
2. นำไฟล์ release ก่อนหน้ากลับมาใช้งาน
3. ตรวจ `.env` ว่ายังชี้ฐานข้อมูลถูกต้อง
4. เริ่ม backend service
5. ทดสอบ `GET /api/health`
6. ทดสอบ login ด้วย admin
7. ทดสอบ `GET /api/holidays?year=2026&mode=calendar`
8. ตรวจ audit log ว่าระบบยังอ่านได้

## Rollback ข้อมูล

1. หยุด backend service เพื่อกันการเขียนซ้ำ
2. Restore ตาราง `holiday` จากไฟล์ backup ล่าสุดก่อนทดสอบ
3. เปิด backend service
4. ตรวจรายการวันหยุดในหน้า `/holidays`
5. บันทึกเหตุการณ์ rollback ไว้ในเอกสารงานจริงของหน่วยงาน

## ข้อควรระวัง

- ห้ามใช้ user application ที่มีสิทธิ์ `DELETE`, `DROP`, `ALTER`, `TRUNCATE`
- ห้ามแก้ schema HOSxP จากระบบนี้
- ต้องยืนยัน `SHOW COLUMNS FROM holiday` และตั้งค่า `HOLIDAY_*_COLUMN` ให้ตรงก่อนเปิดเขียน
- ถ้า audit log เขียนไม่สำเร็จ ระบบจะ rollback การเขียน holiday ใน transaction เดียวกัน
