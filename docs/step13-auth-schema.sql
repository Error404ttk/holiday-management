-- Run this in the app-owned database, for example hosxp_holiday_app.
-- Do not run this in the HOSxP database unless that is intentionally your app database.

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('super_admin', 'admin', 'viewer') NOT NULL DEFAULT 'viewer',
  active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  KEY idx_users_role (role),
  KEY idx_users_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(150) NULL,
  full_name VARCHAR(150) NULL,
  action VARCHAR(80) NOT NULL,
  table_name VARCHAR(100) NULL,
  record_id VARCHAR(120) NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  reason TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_created_at (created_at),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password hash with:
-- node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('CHANGE_PASSWORD', 12).then(console.log)"
--
-- Then insert the first admin:
-- INSERT INTO users (username, password_hash, full_name, role, active)
-- VALUES ('admin', '<BCRYPT_HASH>', 'System Administrator', 'super_admin', 1);
