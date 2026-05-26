-- Run as a database admin after replacing host, password, database, and table names.
-- This user is for Step 12 write tests only and must not have DELETE, DROP, ALTER, or GRANT OPTION.

CREATE USER 'holiday_write'@'192.168.99.50'
IDENTIFIED BY 'StrongPasswordHere';

GRANT SELECT, INSERT, UPDATE
ON hosxp.holiday
TO 'holiday_write'@'192.168.99.50';

-- Required for atomic holiday write + audit log transaction.
-- The same write connection inserts audit_logs and rolls back holiday changes if audit logging fails.
GRANT INSERT
ON hosxp_holiday_app.audit_logs
TO 'holiday_write'@'192.168.99.50';

FLUSH PRIVILEGES;

-- Verify grants:
SHOW GRANTS FOR 'holiday_write'@'192.168.99.50';
