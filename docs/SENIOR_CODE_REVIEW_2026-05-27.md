# Senior Developer Code Review: HOSxP Holiday System

วันที่รีวิว: 27 พฤษภาคม 2026
Repository target: `https://github.com/Error404ttk/holiday-management`
ขอบเขต: performance, readability, security และความพร้อมก่อน push ขึ้น GitHub เพื่อใช้ต่อยอดเป็น PRD

## Executive Summary

ระบบอยู่ในระดับพร้อมนำขึ้น Git เพื่อใช้เป็นฐาน PRD ได้ แต่ยังควรแยก backlog ปรับปรุงเชิงโครงสร้างหลังจากนี้ โดยเฉพาะการลดไฟล์ซ้ำ `.js` ที่เกิดจาก build/tooling, การเพิ่ม automated tests, และการลดข้อมูล internal network ในไฟล์ตัวอย่าง/mock

คะแนนหลังแก้ hardening รอบนี้:

| หมวด | คะแนน | สถานะ |
| --- | ---: | --- |
| Performance | 8.2/10 | ดี ใช้งานจริงได้ แต่ยังมีจุดที่ต้อง optimize เมื่อข้อมูลโต |
| Readability | 8.0/10 | โครงสร้างเข้าใจง่าย แต่บาง component ยังใหญ่และมี logic ปน UI |
| Security | 8.4/10 | ผ่านเกณฑ์ก่อน push หลังแก้ endpoint/db seed แต่ยังควรทำ secret hygiene ต่อ |
| Overall | 8.2/10 | พร้อมเป็น PRD baseline |

## Key Findings

### Performance

จุดแข็ง:

- ใช้ Pinia cache สำหรับรายการวันหยุด ลดการ fetch ซ้ำระหว่างหน้า Dashboard/List
- เพิ่ม latest-request guard ใน holiday store, holiday check และ audit log ลดโอกาส stale response ทับผลลัพธ์ล่าสุด
- API list holiday จำกัดช่วงวันที่ตามปี/โหมด ทำให้ query ไม่ดึงทั้งตาราง

ข้อควรปรับปรุง:

- Dashboard ยังใช้ `.find()` ต่อ cell ใน calendar grid ถ้าข้อมูลโตควรสร้าง `Map<date, holiday>` ก่อน render เพื่อลดจาก O(days * holidays) เป็น O(days)
- Audit Log โหลดชุดล่าสุดแล้วกรอง client-side ได้ดีสำหรับข้อมูลไม่เกิน 200 รายการ แต่ถ้าจะรองรับ audit จำนวนมากควรทำ server-side pagination/filter พร้อม debounce และ request guard
- `getHolidaySchema()` query `SHOW COLUMNS` ทุกครั้ง ควร cache schema พร้อม TTL หรือ invalidation เมื่อ config เปลี่ยน

คะแนน Performance: 8.2/10

## Readability

จุดแข็ง:

- แยก service layer ชัดเจน เช่น `holiday.service.ts`, `auth.service.ts`, `db.service.ts`
- Backend ใช้ Zod validation และ service boundary ที่อ่านง่าย
- Permission model มี type ชัดเจนทั้ง frontend/backend

ข้อควรปรับปรุง:

- `DashboardPage.vue`, `HolidayListPage.vue`, `HolidayCheckPage.vue` มี logic แยกประเภทวันหยุดซ้ำกัน ควรย้ายไป utility กลาง
- มีไฟล์ `.js` ซ้ำกับ `.ts/.vue` หลายจุดใน `apps/web/src` ทำให้อ่านยากและเสี่ยง stale artifact ก่อน push public ควรตัดสินใจว่าจะ track เฉพาะ source จริงหรือไม่
- `SettingsView.vue` ใน `pages` กับ `views` มีเนื้อหาใกล้เคียงกัน แต่ router ใช้ `pages` เป็นหลัก ควรลบหรือรวม source ที่ไม่ได้ใช้

คะแนน Readability: 8.0/10

## Security

จุดแข็ง:

- `.env` และ `.env.*` ถูก ignore แล้ว เหลือเฉพาะ `.env.example`
- JWT secret ถูก validate ว่าต้องยาวอย่างน้อย 24 ตัวอักษร
- ใช้ bcrypt สำหรับ password hash
- Route สำคัญมี `authenticate` และ `requirePermission`
- SQL identifier ถูก validate และ quote ก่อนใช้กับ dynamic schema
- HOSxP write operation ใช้ parameterized query และบังคับ reason สำหรับ update/disable

สิ่งที่แก้แล้วในรอบ review นี้:

- `/api/db/health` เดิมเป็น public endpoint แต่ส่ง host/database/table กลับได้ แก้ให้ต้อง login และมี `setting.manage`
- `apps/api/seed-user.js` เดิมมี default admin password และพิมพ์ออก console แก้ให้บังคับใช้ `ADMIN_PASSWORD` จาก environment และไม่แสดงรหัสผ่านจริง

ข้อควรปรับปรุงก่อน production/public hardening รอบถัดไป:

- เปลี่ยน IP ตัวอย่างใน docs/mock จาก `192.168.99.x` เป็น address สำหรับเอกสาร เช่น `192.0.2.x` เพื่อลดการเปิดเผย topology ภายใน
- พิจารณาเก็บ JWT ใน httpOnly secure cookie แทน `localStorage` หากระบบต้องรับมือ XSS risk สูง
- เพิ่ม password policy และ account lockout ต่อ username ไม่ใช่เฉพาะ rate limit ต่อ IP
- ตรวจว่า `.env` จริงไม่เคยถูก commit มาก่อน ถ้าเคยหลุดต้อง rotate DB password และ JWT secret ทันที
- ลด console log ฝั่ง frontend ใน production เพราะมีการ log API request และ audit data

คะแนน Security: 8.4/10

## PRD Backlog ที่ควรแตกต่อ

1. Security hardening: secret rotation checklist, httpOnly token option, production logging policy
2. Audit log UX: pagination, server-side filter, export รายงานตามช่วงวันที่
3. Settings: health check แยก HOSxP DB กับ App DB พร้อม latency และ last checked time
4. Holiday form: duplicate handling policy ว่าระบบควร allow override หรือ block เสมอ
5. Role UX: viewer detail page แทนการพาไปหน้า list เมื่อต้องดูรายละเอียดวันหยุด
6. Codebase cleanup: ลบ stale generated `.js` artifacts และรวม `pages/views` ที่ซ้ำกัน
7. Automated tests: unit test date/year conversion, duplicate flow, permission guard, health endpoint auth

## Release Readiness

สถานะ: ผ่านสำหรับ push เป็น PRD baseline หลังตรวจ diff และยืนยันว่าไม่มี `.env` จริงถูก stage

คำสั่งตรวจที่ผ่าน:

```bash
npm run typecheck --workspace apps/api
npx vue-tsc -p tsconfig.json --noEmit
```

ก่อน push ให้ตรวจอีกครั้ง:

```bash
git status --short
git diff -- . ':!.env'
git grep -n -I -E "(JWT_SECRET=.*[^change_me]|DB_PASSWORD=.*[^change_me]|APP_DB_PASSWORD=.*[^change_me])"
```
