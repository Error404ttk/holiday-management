# Technical Summary

## Architecture

ระบบแบ่งเป็น frontend และ backend

- Frontend: Vue 3 + Vuetify ติดต่อ backend ผ่าน HTTP API
- Backend: Node.js + Express ทำ auth, permission, validation, audit log และเชื่อม MySQL/MariaDB
- HOSxP Database: ใช้เฉพาะตาราง `holiday`
- App Database: ฐานของระบบเองสำหรับ `users` และ `audit_logs`

Frontend ไม่ต่อฐานข้อมูลโดยตรง

## Frontend Stack

- Vue 3
- Vue Router
- Vuetify
- Axios
- Sarabun Google Font

หน้าหลัก:

- Dashboard
- รายการวันหยุด
- เพิ่ม/แก้ไขวันหยุด
- ตรวจสอบวันหยุด
- Audit Log
- Login

## Backend Stack

- Node.js
- Express
- TypeScript
- mysql2/promise
- JWT
- bcryptjs
- zod
- helmet
- cors

## Database

### HOSxP

ใช้ฐาน HOSxP v3 MySQL/MariaDB

ตารางที่ใช้:

- `hosxp.holiday`

ระบบใช้ `SHOW COLUMNS FROM holiday` เพื่อตรวจ schema และใช้ค่า `HOLIDAY_*_COLUMN` จาก `.env`

### App Database

แนะนำฐานแยก เช่น `hosxp_holiday_app`

ตารางที่ใช้:

- `users`
- `audit_logs`

ห้ามสร้าง audit log ลง HOSxP ถ้าไม่มีเหตุผลจำเป็น

## API Endpoints

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Health:

- `GET /api/health`
- `GET /api/db/health`

Holiday:

- `GET /api/holidays?year=2026&mode=calendar`
- `GET /api/holidays/:id`
- `POST /api/holidays`
- `PUT /api/holidays/:id`
- `PATCH /api/holidays/:id/status`
- `GET /api/check-holiday?date=2026-01-01`

Audit:

- `GET /api/audit-logs`

ไม่มี DELETE endpoint

## Role และ Permission

Roles:

- `super_admin`
- `admin`
- `viewer`

Permissions:

- `holiday.view`
- `holiday.create`
- `holiday.update`
- `holiday.disable`
- `audit.view`
- `user.manage`
- `setting.manage`

สิทธิ์:

- `super_admin`: ทุกสิทธิ์
- `admin`: ดู เพิ่ม แก้ไข ปิดใช้งานวันหยุด และดู audit log
- `viewer`: ดูข้อมูลเท่านั้น และดู audit log ตามที่กำหนด

## Audit Log Design

Audit log อยู่ในฐาน app ไม่เขียนลง HOSxP

Field สำคัญ:

- `action`
- `username`
- `full_name`
- `ip_address`
- `user_agent`
- `table_name`
- `record_id`
- `old_value`
- `new_value`
- `reason`
- `created_at`

Actions:

- `LOGIN_SUCCESS`
- `LOGIN_FAILED`
- `CREATE_HOLIDAY`
- `UPDATE_HOLIDAY`
- `DISABLE_HOLIDAY`
- `ENABLE_HOLIDAY`
- `PERMISSION_DENIED`

ระบบห้ามบันทึก password, token, JWT secret, DB password ลง audit log

## Write Safety

- INSERT/UPDATE ใช้ parameterized query
- UPDATE ต้องมี primary key จาก schema
- ถ้า primary key ไม่ชัดเจน ระบบ block การเขียน
- ตรวจวันที่ซ้ำก่อน INSERT/UPDATE
- UPDATE และ DISABLE ต้องมี reason
- holiday write และ audit log อยู่ใน transaction เดียวกันเมื่อใช้ DB connection เดียวได้
- ถ้า audit log fail ระบบ rollback holiday write

## Deploy Overview

1. ตั้งค่า `.env`
2. Backup ตาราง `holiday` และฐาน app
3. Run `npm install`
4. Run `npm run build`
5. Start backend ด้วย PM2
6. Serve frontend static ด้วย Nginx
7. Proxy `/api` ไป backend
8. Run UAT checklist
