-- Run these queries against a read-only/test HOSxP database first.
-- Do not run mutation queries until the schema is confirmed.

SHOW TABLES LIKE '%holiday%';
SHOW TABLES LIKE '%holi%';
SHOW TABLES LIKE '%calendar%';
SHOW TABLES LIKE '%day%';

SELECT
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_KEY,
  EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
    TABLE_NAME LIKE '%holiday%'
    OR COLUMN_NAME LIKE '%holiday%'
    OR COLUMN_NAME LIKE '%date%'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- If the real table is confirmed as holiday:
SHOW TABLES LIKE 'holiday';
DESCRIBE holiday;
SELECT * FROM holiday ORDER BY holiday_date DESC LIMIT 20;

