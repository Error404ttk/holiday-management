# HOSxP Holiday Management System 🏥📅

ระบบจัดการวันหยุดอัจฉริยะสำหรับหน่วยงานที่ใช้งานระบบ HOSxP เพื่อใช้ในการตรวจสอบ เพิ่ม แก้ไข และยกเลิกวันหยุด โดยเชื่อมต่อกับฐานข้อมูล HOSxP โดยตรง พร้อมระบบบันทึกประวัติ (Audit Log) และการควบคุมสิทธิ์ที่เข้มงวด

---

## ✨ คุณสมบัติเด่น (Features)

- **📊 Modern Dashboard:** แสดงภาพรวมวันหยุดประจำปี สถิติจำนวนวันหยุด และรายการวันหยุดที่กำลังจะมาถึงเร็วๆ นี้
- **📅 Smart Calendar:** ปฏิทินวันหยุดรองรับภาษาไทย และปี พ.ศ. สมบูรณ์แบบ
- **🔍 Holiday Check:** ระบบตรวจสอบสถานะวันที่อัจฉริยะ ระบุได้ทันทีว่าเป็นวันหยุดประเภทใด หรือเป็นวันปฏิบัติงานปกติ
- **📝 Smart Form:** ระบบเพิ่ม/แก้ไขวันหยุดที่มาพร้อมกับระบบวิเคราะห์ประเภทวันหยุดอัตโนมัติ (Smart Categorizer)
- **🛡️ Audit Logging:** บันทึกทุกความเคลื่อนไหวการแก้ไขข้อมูล (ใคร, ทำอะไร, เมื่อไหร่, เหตุผลคืออะไร) พร้อมดูข้อมูลก่อนและหลังแก้ไข
- **🔐 Permission Control:** ระบบควบคุมสิทธิ์การใช้งานแบ่งตามระดับ (Super Admin, Admin, Viewer)
- **🗃️ Schema Flexibility:** รองรับฐานข้อมูล HOSxP ทุกเวอร์ชันด้วยระบบ Dynamic Schema Mapping

---

## 🚀 Tech Stack

### Frontend
- **Vue 3** (Composition API)
- **Vuetify 3** (Material Design)
- **TypeScript**
- **Pinia** (State Management)
- **Vite** (Build Tool)

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **MySQL2** (Connection Pooling)
- **Zod** (Data Validation)
- **JWT** (Authentication)

---

## 🛠️ การติดตั้งและใช้งาน (Installation)

### 1. เตรียมความพร้อม
- Node.js (แนะนำ v18 หรือสูงกว่า)
- MySQL / MariaDB (ฐานข้อมูล HOSxP และฐานข้อมูลแอปพลิเคชัน)

### 2. ตั้งค่าฐานข้อมูล
- สร้างฐานข้อมูลสำหรับตัวแอปพลิเคชัน (เช่น `hosxp_holiday_app`) โดยใช้ไฟล์ SQL ใน `docs/app-database.sql`

### 3. ตั้งค่าสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` เป็น `.env` และตั้งค่าดังนี้:
```env
# API & Auth
JWT_SECRET=ใส่รหัสลับของคุณที่นี่

# HOSxP Database (Read/Write)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=รหัสผ่าน
DB_NAME=hosxp

# Application Database (Audit Log & Users)
APP_DB_HOST=127.0.0.1
APP_DB_NAME=hosxp_holiday_app
```

### 4. เริ่มใช้งาน
```bash
# ติดตั้ง dependencies
npm install

# รันระบบในโหมดพัฒนา
npm run dev
```

---

## 🛡️ ความปลอดภัยและจรรยาบรรณ (Security & Ethics)

- **No Delete:** ระบบไม่มีการใช้คำสั่ง `DELETE` เพื่อรักษาความสมบูรณ์ของข้อมูลโรงพยาบาล แต่จะใช้การ "ยกเลิกประกาศ" แทน
- **Masking:** ข้อมูลสำคัญทางเครือข่ายมีการพรางค่า (Masking) บนหน้าจอ Dashboard
- **Parameterized Query:** ป้องกัน SQL Injection 100%
- **Privilege Separation:** แนะนำให้ใช้ DB User ที่มีสิทธิ์เฉพาะเจาะจงในการเชื่อมต่อ

---

## 👨‍💻 พัฒนาโดย
**งานยุทธศาสตร์ และสารสนเทศทางการแพทย์ โรงพยาบาลสารภี**  
Version: V1.20250526--stable

---
*หมายเหตุ: โปรแกรมนี้พัฒนาขึ้นเพื่ออำนวยความสะดวกในการบริหารจัดการข้อมูลภายในหน่วยงานเท่านั้น กรุณาตรวจสอบระเบียบการใช้งานข้อมูลของหน่วยงานท่านก่อนเริ่มใช้งานจริง*
