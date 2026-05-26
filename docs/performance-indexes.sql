-- Performance improvement: Add indexes to audit_logs table
-- Run this on the application database (APP_DB_NAME)

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_username ON audit_logs(username);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
