# Deploy ด้วย PM2

เอกสารนี้สำหรับ deploy ระบบจัดการวันหยุด HOSxP บน server จริง โดย frontend build เป็น static files และ backend รันด้วย PM2

## 1. เตรียมเครื่อง

ติดตั้ง Node.js LTS, npm, PM2 และ Nginx

```bash
npm install -g pm2
```

ติดตั้ง dependencies ในโฟลเดอร์โปรเจกต์

```bash
npm install
```

## 2. ตั้งค่า environment

สร้างไฟล์ `.env` จาก `.env.example` แล้วแก้ค่าจริง

```bash
cp .env.example .env
```

ค่าที่ต้องตรวจ:

- `NODE_ENV=production`
- `API_PORT=3000`
- `FRONTEND_ORIGIN=https://your-domain.example`
- `JWT_SECRET` ต้องเปลี่ยนจากค่า default และยาวพอ
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DB_USER_WRITE`, `DB_PASSWORD_WRITE`
- `APP_DB_HOST`, `APP_DB_PORT`, `APP_DB_NAME`, `APP_DB_USER`, `APP_DB_PASSWORD`
- `HOLIDAY_*_COLUMN` ต้องตรงกับ `SHOW COLUMNS FROM holiday`

ห้าม commit `.env` เข้า repository

## 3. Build

```bash
npm run build
```

ผลลัพธ์ที่คาดหวัง:

- Backend: `apps/api/dist/server.js`
- Frontend: `apps/web/dist`

## 4. Start backend ด้วย PM2

```bash
pm2 start apps/api/dist/server.js --name hosxp-holiday-api
pm2 save
pm2 startup
```

ดู log:

```bash
pm2 logs hosxp-holiday-api
```

Restart:

```bash
pm2 restart hosxp-holiday-api
```

Stop:

```bash
pm2 stop hosxp-holiday-api
```

## 5. ตัวอย่าง Nginx Reverse Proxy

ตัวอย่างนี้ให้ Nginx serve frontend static และ proxy `/api` ไป backend ที่ `localhost:3000`

```nginx
server {
    listen 80;
    server_name your-domain.example;

    root /var/www/hosxp-holiday-system/apps/web/dist;
    index index.html;

    client_max_body_size 1m;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

หลังแก้ config:

```bash
nginx -t
systemctl reload nginx
```

## 6. Network และ Firewall

- เปิดเฉพาะ port ที่จำเป็น เช่น 80/443
- ไม่ต้องเปิด port backend `3000` ให้ client ภายนอก ถ้าใช้ Nginx proxy
- จำกัด MySQL/MariaDB ให้รับเฉพาะ IP server ที่รัน backend
- ห้ามเปิด MySQL/MariaDB ให้ client ทั่วไป
- Frontend user ห้ามต่อฐานข้อมูลโดยตรง ทุกอย่างต้องผ่าน backend API
- DB user ของ HOSxP ต้องไม่มี `DELETE`, `DROP`, `ALTER`, `TRUNCATE`

## 7. Smoke Test หลัง deploy

```bash
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/db/health
```

จาก browser:

- เปิดหน้า login
- login ด้วย admin
- เปิด Dashboard
- เปิดรายการวันหยุด
- ดู Audit Log
