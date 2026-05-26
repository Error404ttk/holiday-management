# Confirmed HOSxP Holiday Schema

เอกสารนี้ต้องกรอกหลังจากรัน `docs/schema-discovery.sql` กับฐาน HOSxP test/read-only แล้วเท่านั้น

## Connection Context

- Database name:
- HOSxP version:
- Environment: test / replica / production
- Checked by:
- Checked at:

## Confirmed Table

- Table name:
- Primary key:
- Date column:
- Holiday name column:
- Type column:
- Status/active column:
- Note column:

## DESCRIBE Output

```text
Paste DESCRIBE output here.
```

## Sample Rows

```text
Paste redacted sample rows here.
```

## Mutation Decision

- Create holiday allowed: yes / no
- Update holiday allowed: yes / no
- Disable holiday strategy:
- Backup completed before mutation test: yes / no
- Restricted DB user tested: yes / no

## Environment Mapping

```env
HOSXP_HOLIDAY_TABLE=
HOSXP_HOLIDAY_PK=
HOSXP_HOLIDAY_DATE_COLUMN=
HOSXP_HOLIDAY_NAME_COLUMN=
HOSXP_HOLIDAY_TYPE_COLUMN=
HOSXP_HOLIDAY_STATUS_COLUMN=
HOSXP_HOLIDAY_NOTE_COLUMN=
ENABLE_HOSXP_MUTATIONS=false
```

