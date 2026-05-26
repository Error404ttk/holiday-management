# วิเคราะห์เอกสารและแผนเตรียมสร้างระบบ

## Source Documents

- `HOSxP_Holiday_System_Spec.md`
- `SKILL.md`

## Scope MVP

ระบบเวอร์ชันแรกต้องมี:

- Login
- Dashboard
- รายการวันหยุด
- เลือกปีปฏิทิน / ปีงบประมาณ
- เพิ่มวันหยุด
- แก้ไขวันหยุด
- ปิดใช้งานวันหยุด
- ตรวจสอบวันหยุดรายวัน
- Audit Log
- ตั้งค่าหน่วยงานและปีเริ่มต้น

ยังไม่ทำใน MVP:

- Import Excel
- Advanced PDF export
- Provider ID login
- LDAP login
- Multi-hospital
- LINE notification

## Architecture Decision

ใช้แนวทางที่เอกสารแนะนำ:

- Frontend: Vue 3 + Vuetify 3 + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Validation: Zod
- DB Driver: mysql2
- Date handling: ISO date in API/DB, display Thai Buddhist Era in UI
- Auth: JWT ในช่วง scaffold แรก แล้วสามารถเปลี่ยนเป็น cookie/session ได้เมื่อต้องการ CSRF protection เต็มรูปแบบ

## Critical Constraint

ห้ามเดาชื่อตารางหรือ column ของ HOSxP สำหรับ production mutation

ก่อนเปิด `ENABLE_HOSXP_MUTATIONS=true` ต้องยืนยันอย่างน้อย:

- ตารางวันหยุดจริง
- column วันที่
- column ชื่อวันหยุด
- primary key หรือ key ที่ปลอดภัยสำหรับ update
- column type/status/note ถ้ามี
- วิธี disable ถ้าตารางรองรับ

## Implementation Phases

### Phase 1: Database Discovery

1. ใช้ `docs/schema-discovery.sql` กับฐาน HOSxP test/read-only
2. บันทึกผล `DESCRIBE` และ sample data ลง `docs/CONFIRMED_HOSXP_SCHEMA.md`
3. กรอก mapping ลง `.env`
4. ยังไม่เปิด mutation จนกว่าจะทดสอบบนฐานสำรอง

### Phase 2: App Database

1. สร้างฐาน `hosxp_holiday_app`
2. สร้างตาราง users, roles, settings, audit_logs
3. สร้าง restricted DB user แยกจาก root

### Phase 3: Backend

1. Auth API
2. Holiday read/check API
3. Schema-aware create/update/disable API
4. Audit log middleware/service
5. RBAC middleware

### Phase 4: Frontend

1. Login
2. Main layout
3. Dashboard
4. Holiday list and filters
5. Holiday form
6. Check holiday
7. Audit log
8. Settings

### Phase 5: Verification

1. Validate required fields
2. Test duplicate date handling
3. Test old/new audit values
4. Test role restrictions
5. Test parameterized SQL only
6. Test with restricted DB user

## API Contract

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/holidays
GET    /api/holidays/:id
POST   /api/holidays
PUT    /api/holidays/:id
PATCH  /api/holidays/:id/disable
GET    /api/holidays/check?date=YYYY-MM-DD
GET    /api/audit-logs
GET    /api/users
GET    /api/settings
PUT    /api/settings
```

## Current Preparation Output

- Root workspace package
- API scaffold
- Web scaffold
- Environment sample
- Schema discovery SQL
- App database setup SQL
