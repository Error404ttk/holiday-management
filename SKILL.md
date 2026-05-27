# SKILL: HOSxP Holiday Management System

## Purpose

This skill defines the rules, constraints, architecture, and implementation guidance for building a HOSxP Holiday Management System. The system allows authorized users to check, add, edit, disable, and audit holiday records used by HOSxP.

The system must be safe, auditable, Thai-language friendly, and suitable for a Thai government hospital environment.

---

## Core Rule

Never assume the real HOSxP holiday table name or column names.

Before implementing insert, update, or delete-like behavior, inspect the real database schema first.

Use actual schema only. Do not invent table structures when writing production SQL.

---

## Recommended Stack

### Frontend

Use:

- Vue 3
- Vuetify 3
- TypeScript
- Vite
- Vue Router
- Pinia
- dayjs

UI should be clean, modern, and suitable for hospital/government internal systems.

### Backend

Preferred options:

1. Node.js + Express/Fastify
2. PHP + Laravel

For Node.js:

- Use TypeScript when possible
- Use mysql2, Prisma, or equivalent safe DB connector
- Use Zod or equivalent validation
- Use parameterized queries only

For Laravel:

- Use Laravel validation
- Use Eloquent/Query Builder carefully
- Use Sanctum or session-based auth

---

## UI Style

Use a Thai government/hospital-friendly style.

### Fonts

Frontend web app:

- Sarabun
- Noto Sans Thai

Official document/export:

- TH Sarabun New

Do not bundle or distribute proprietary font files unless explicitly allowed by the project owner.

### Colors

Use this suggested palette:

```text
Primary:     #0F766E
Secondary:   #2563EB
Background:  #F8FAFC
Card:        #FFFFFF
Success:     #16A34A
Warning:     #F59E0B
Error:       #DC2626
Text:        #0F172A
```

### Layout

Use Vuetify layout components:

```text
v-app
├── v-app-bar
├── v-navigation-drawer
└── v-main
    └── v-container
        ├── v-card
        ├── v-data-table
        ├── v-dialog
        └── v-form
```

---

## Required Pages

### 1. Login

Required fields:

- Username
- Password

Required behavior:

- Validate input
- Show error for failed login
- Log `LOGIN_SUCCESS` and `LOGIN_FAILED`
- Show authorized-use notice

### 2. Dashboard

Show:

- Total holidays in selected year
- Next holiday
- Holidays edited this month
- Recent audit log
- Calendar preview if possible

### 3. Holiday List

Must support filters:

- Calendar year
- Fiscal year
- Holiday type
- Status
- Search keyword

Required actions:

- View
- Edit
- Disable

Do not show permanent delete as a primary action.

### 4. Add Holiday

Required fields:

- Holiday date
- Holiday name
- Holiday type
- Status
- Note

Required validation:

- Date is required
- Name is required
- Type is required
- Duplicate dates must trigger warning/confirmation

### 5. Edit Holiday

Required fields:

- Holiday date
- Holiday name
- Holiday type
- Status
- Reason for edit

Reason for edit is mandatory.

Must store old and new values in audit log.

### 6. Check Holiday

Input:

- Date

Output:

- Is holiday or not
- Holiday name if found
- Holiday type if found
- Status

### 7. Audit Log

Must support filters:

- Date range
- Username
- Action

Must show:

- Timestamp
- User
- Action
- Detail
- IP address
- User-Agent if available

### 8. User and Role Management

Roles:

- Super Admin
- Admin
- Viewer

---

## Roles and Permissions

### Super Admin

Can:

- Manage users
- Manage roles
- Add holidays
- Edit holidays
- Disable holidays
- View audit log
- Export reports
- Manage settings

### Admin

Can:

- Add holidays
- Edit holidays
- Disable holidays
- View audit log
- Export reports

### Viewer

Can:

- View holiday list
- Check holiday
- Export reports if allowed

---

## Database Permission Rules

Use a dedicated database user for the app.

Never use:

- root
- ALL PRIVILEGES
- GRANT OPTION
- DROP
- ALTER
- DELETE unless explicitly approved

Recommended grants:

```sql
GRANT SELECT, INSERT, UPDATE
ON hosxp.<actual_holiday_table>
TO 'holiday_app'@'<app_server_ip>';
```

For the app-owned database:

```sql
GRANT SELECT, INSERT, UPDATE
ON hosxp_holiday_app.*
TO 'holiday_app'@'<app_server_ip>';
```

Use a fixed app server IP when possible. Avoid `%` host unless there is no alternative.

---

## Schema Discovery

Before implementation, run these queries on a test or read-only connection:

```sql
SHOW TABLES LIKE '%holiday%';
SHOW TABLES LIKE '%holi%';
SHOW TABLES LIKE '%calendar%';
SHOW TABLES LIKE '%day%';
```

Then inspect candidate tables:

```sql
DESCRIBE <candidate_table>;
SELECT * FROM <candidate_table> LIMIT 20;
```

Use information_schema if needed:

```sql
SELECT 
  TABLE_NAME,
  COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
    TABLE_NAME LIKE '%holiday%'
    OR COLUMN_NAME LIKE '%holiday%'
    OR COLUMN_NAME LIKE '%date%'
  )
ORDER BY TABLE_NAME, COLUMN_NAME;
```

Document the confirmed table and columns before writing mutation queries.

---

## Date Handling

Database dates should be stored as Gregorian/ISO dates:

```text
YYYY-MM-DD
```

UI should display Thai Buddhist Era dates when appropriate:

```text
DD/MM/BBBB
```

Example:

```text
Database: 2026-05-21
Display: 21/05/2569
```

### Calendar Year

Thai Buddhist Era 2569 maps to Gregorian 2026.

```text
2569 calendar year = 2026-01-01 to 2026-12-31
```

### Fiscal Year

Thai fiscal year 2569 maps to:

```text
2025-10-01 to 2026-09-30
```

---

## API Requirements

### Auth

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Holidays

```text
GET    /api/holidays
GET    /api/holidays/:id
POST   /api/holidays
PUT    /api/holidays/:id
PATCH  /api/holidays/:id/disable
GET    /api/holidays/check?date=YYYY-MM-DD
```

### Audit Logs

```text
GET /api/audit-logs
GET /api/audit-logs/:id
```

### Users

```text
GET    /api/users
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/disable
```

### Settings

```text
GET /api/settings
PUT /api/settings
```

---

## Audit Log Requirements

Every important action must create an audit log.

Required actions:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
HOLIDAY_CREATE
HOLIDAY_UPDATE
HOLIDAY_DISABLE
EXPORT_EXCEL
EXPORT_PDF
USER_CREATE
USER_UPDATE
SETTING_UPDATE
```

Recommended audit log fields:

```text
id
user_id
username
action
table_name
record_id
old_value JSON
new_value JSON
reason
ip_address
user_agent
created_at
```

For update operations, always store before and after values.

---

## Security Requirements

Must:

- Hash passwords with bcrypt or argon2
- Use parameterized SQL queries
- Validate on both frontend and backend
- Enforce role-based access control
- Use HTTPS in deployment
- Implement session timeout
- Log auth attempts
- Restrict database user by host/IP
- Backup before production mutation tests

Must not:

- Store plaintext passwords
- Use root database user
- Give broad database privileges
- Build SQL by string concatenation from user input
- Permanently delete holiday records in MVP
- Modify unconfirmed HOSxP tables

---

## Soft Delete / Disable Rule

Do not permanently delete holiday records by default.

Use disable behavior instead:

```text
status = inactive
is_active = 0
active = 'N'
```

The exact field depends on the confirmed schema.

If the HOSxP table does not support a status field, do not invent one in the HOSxP table. Discuss and document the safe approach first.

---

## Validation Rules

### Add Holiday

- Date required
- Name required
- Type required
- Check duplicate date
- Confirm before duplicate create/update

### Edit Holiday

- Reason required
- Old value must be read before update
- New value must be validated
- Audit log required

### Disable Holiday

- Reason required
- Must use UPDATE, not DELETE
- Audit log required

---

## MVP Scope

Build first:

1. Login
2. Dashboard
3. Holiday list
4. Year selector: calendar/fiscal
5. Add holiday
6. Edit holiday
7. Disable holiday
8. Check holiday
9. Audit log
10. Settings

Do later:

- Import Excel
- Advanced PDF export
- Provider ID login
- LDAP login
- LINE notification
- Multi-hospital support

---

## Development Workflow

1. Confirm actual HOSxP schema
2. Document confirmed table/columns
3. Create app database
4. Create restricted DB user
5. Build backend API
6. Build frontend UI
7. Add audit log
8. Test on test database
9. Review permissions
10. Deploy internally

---

## Testing Checklist

### Auth

- Valid login works
- Invalid login fails
- Failed login is logged
- Logout works
- Session expires

### Holiday List

- Calendar year filter works
- Fiscal year filter works
- Search works
- Status filter works
- Type filter works

### Add Holiday

- Required validation works
- Duplicate warning works
- Save works
- Audit log is created

### Edit Holiday

- Existing data loads
- Reason is required
- Save works
- Old/new values are logged

### Disable Holiday

- Requires reason
- Does not delete record permanently
- Audit log is created

### Security

- Viewer cannot add/edit
- Admin cannot manage super admin unless allowed
- SQL injection attempts fail
- DB user has limited privileges

---

## Documentation Requirements

Every implementation should include:

- README.md
- Environment variable sample
- Database setup guide
- Confirmed HOSxP schema notes
- Deployment guide
- User manual
- Backup/restore notes

---

## Environment Variables

Use environment variables for secrets.

Example:

```env
APP_NAME="HOSxP Holiday Management"
APP_PORT=3011
DB_HOST=192.168.99.10
DB_PORT=3306
DB_NAME=hosxp
DB_USER=holiday_app
DB_PASSWORD=change_me
APP_DB_NAME=hosxp_holiday_app
JWT_SECRET=change_me
```

Never commit real credentials.

---

## Tone and Language

Use Thai as the primary UI language.

Use clear labels such as:

```text
รายการวันหยุด
เพิ่มวันหยุด
แก้ไขวันหยุด
ตรวจสอบวันหยุด
ประวัติการแก้ไข
ผู้ใช้งานและสิทธิ์
ตั้งค่าระบบ
```

Error messages should be clear and non-technical for users.

Example:

```text
ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบวันที่และชื่อวันหยุดอีกครั้ง
```

Technical details should go to logs, not user-facing messages.

---



---

## HOSxP v3 MySQL Example: `holiday` Table

The user may provide this known working query for HOSxP v3:

```sql
SELECT * FROM holiday WHERE YEAR(holiday_date) = '2026';
```

Treat this as a useful confirmed starting point only for systems where the real schema has already been checked.

### Required confirmation before mutation

Before generating production `INSERT` or `UPDATE`, confirm at minimum:

```sql
SHOW TABLES LIKE 'holiday';
DESCRIBE holiday;
SELECT * FROM holiday ORDER BY holiday_date DESC LIMIT 20;
```

Also inspect exact column names:

```sql
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_KEY,
  EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'holiday'
ORDER BY ORDINAL_POSITION;
```

### SELECT examples

Calendar year CE 2026:

```sql
SELECT *
FROM holiday
WHERE YEAR(holiday_date) = '2026'
ORDER BY holiday_date ASC;
```

Preferred index-friendly version:

```sql
SELECT *
FROM holiday
WHERE holiday_date BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY holiday_date ASC;
```

Thai Buddhist Era 2569 maps to CE 2026:

```sql
SELECT *
FROM holiday
WHERE holiday_date BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY holiday_date ASC;
```

Thai fiscal year 2569:

```sql
SELECT *
FROM holiday
WHERE holiday_date BETWEEN '2025-10-01' AND '2026-09-30'
ORDER BY holiday_date ASC;
```

Check a single date:

```sql
SELECT *
FROM holiday
WHERE holiday_date = '2026-05-04'
LIMIT 1;
```

Duplicate check before insert:

```sql
SELECT COUNT(*) AS total
FROM holiday
WHERE holiday_date = '2026-05-04';
```

### INSERT examples

Only generate this after confirming real columns.

Minimal example if columns are confirmed as `holiday_date` and `holiday_name`:

```sql
INSERT INTO holiday (
  holiday_date,
  holiday_name
) VALUES (
  '2026-05-04',
  'วันฉัตรมงคล'
);
```

Extended example only if these columns exist:

```sql
INSERT INTO holiday (
  holiday_date,
  holiday_name,
  holiday_type,
  active_status,
  note
) VALUES (
  '2026-05-04',
  'วันฉัตรมงคล',
  'ราชการ',
  'Y',
  'เพิ่มจากระบบจัดการวันหยุด HOSxP'
);
```

### UPDATE examples

Never generate `UPDATE` without a clear `WHERE` condition.

By holiday date:

```sql
UPDATE holiday
SET holiday_name = 'วันฉัตรมงคล'
WHERE holiday_date = '2026-05-04';
```

By primary key, preferred if the primary key is confirmed:

```sql
UPDATE holiday
SET 
  holiday_date = '2026-05-04',
  holiday_name = 'วันฉัตรมงคล'
WHERE holiday_id = 123;
```

### Disable instead of delete

If a status column exists:

```sql
UPDATE holiday
SET active_status = 'N'
WHERE holiday_date = '2026-05-04';
```

If an `is_active` column exists:

```sql
UPDATE holiday
SET is_active = 0
WHERE holiday_date = '2026-05-04';
```

If no disable/status column exists in HOSxP `holiday`, do not invent one or alter the table automatically. Use an app-owned status table or require explicit approval after testing.

### DELETE rule

Do not implement `DELETE` in MVP.

Only mention delete as not recommended:

```sql
-- Not recommended for production MVP
DELETE FROM holiday
WHERE holiday_date = '2026-05-04';
```

### Transaction rule for mutations

Every `INSERT` or `UPDATE` against HOSxP should be paired with audit logging in one transaction where possible.

```sql
START TRANSACTION;

UPDATE holiday
SET holiday_name = 'วันฉัตรมงคล'
WHERE holiday_date = '2026-05-04';

INSERT INTO hosxp_holiday_app.audit_logs (
  username,
  action,
  table_name,
  record_key,
  old_value,
  new_value,
  reason,
  ip_address,
  created_at
) VALUES (
  'admin',
  'HOLIDAY_UPDATE',
  'holiday',
  '2026-05-04',
  JSON_OBJECT('holiday_date', '2026-05-04', 'holiday_name', 'ชื่อเดิม'),
  JSON_OBJECT('holiday_date', '2026-05-04', 'holiday_name', 'วันฉัตรมงคล'),
  'แก้ไขตามประกาศวันหยุดราชการล่าสุด',
  '192.168.99.50',
  NOW()
);

COMMIT;
```

Use `ROLLBACK` on error.

### Parameterized query requirement

Never concatenate user input into SQL.

Bad:

```js
const sql = "SELECT * FROM holiday WHERE YEAR(holiday_date) = '" + year + "'";
```

Good:

```js
const [rows] = await db.execute(
  `SELECT *
   FROM holiday
   WHERE holiday_date BETWEEN ? AND ?
   ORDER BY holiday_date ASC`,
  [startDate, endDate]
);
```

### BE/CE conversion

```text
CE = BE - 543
BE 2569 = CE 2026
```

Calendar year BE 2569:

```text
2026-01-01 to 2026-12-31
```

Fiscal year BE 2569:

```text
2025-10-01 to 2026-09-30
```

### Mutation checklist

Before allowing insert/update in generated code:

- Confirm table name: `holiday`
- Confirm date column: `holiday_date`
- Confirm holiday name column
- Confirm primary key
- Confirm optional status/type/note columns
- Use restricted DB user
- Use parameterized queries
- Check duplicate date before insert
- Write audit log
- Avoid permanent delete
- Test on backup/test DB first

## Final Implementation Principle

This system touches HOSxP data, so correctness and auditability are more important than speed.

Build safely:

- Confirm before modifying
- Log every important action
- Restrict every permission
- Prefer disable over delete
- Keep UI simple
- Keep schema assumptions explicit
