-- Run before testing any INSERT or UPDATE against the real HOSxP holiday table.
-- Replace backup suffix with the current date/time.

CREATE TABLE holiday_backup_before_step12_YYYYMMDD_HHMMSS AS
SELECT *
FROM holiday;

SELECT COUNT(*) AS source_rows
FROM holiday;

SELECT COUNT(*) AS backup_rows
FROM holiday_backup_before_step12_YYYYMMDD_HHMMSS;

-- Optional CSV export example from mysql client:
-- mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> \
--   -e "SELECT * FROM holiday" \
--   --batch --raw > holiday_backup_before_step12.tsv

