import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env configuration
const envPath = process.env.ENV_FILE || '.env';
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  const fallbackPath = path.resolve(process.cwd(), '../../.env');
  if (fs.existsSync(fallbackPath)) {
    dotenv.config({ path: fallbackPath });
  } else {
    // If running inside apps/api
    const fallbackPathApi = path.resolve(process.cwd(), '../.env');
    if (fs.existsSync(fallbackPathApi)) {
      dotenv.config({ path: fallbackPathApi });
    } else {
      dotenv.config({ path: envPath });
    }
  }
}

const dbConfig = {
  host: process.env.APP_DB_HOST || process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.APP_DB_PORT || process.env.DB_PORT || '3306'),
  user: process.env.APP_DB_USER || process.env.DB_USER_WRITE || 'holiday_app',
  password: process.env.APP_DB_PASSWORD || process.env.DB_PASSWORD_WRITE || '',
  database: process.env.APP_DB_NAME || 'hosxp_holiday_app',
};

const USERNAME = 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD;
const FULL_NAME = 'System Administrator';

async function seed() {
  if (!PASSWORD || PASSWORD.length < 12) {
    console.error('ADMIN_PASSWORD must be set and at least 12 characters long before running seed-user.js');
    process.exitCode = 1;
    return;
  }

  console.log(`Connecting to database host: ${dbConfig.host}:${dbConfig.port}...`);
  
  let connection;
  try {
    // Connect without database first to ensure database exists
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    
    console.log('Connected to MySQL server. Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbConfig.database}\``);
    
    console.log('Creating tables...');
    
    // 1. Roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(50) NOT NULL,
        name_th VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_roles_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 2. Users table
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 3. Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_settings_key (setting_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 4. Audit logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NULL,
        username VARCHAR(80) NULL,
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('Tables created. Inserting initial roles and settings...');
    
    // Insert roles
    await connection.query(`
      INSERT IGNORE INTO roles (code, name_th) VALUES
        ('SUPER_ADMIN', 'ผู้ดูแลระบบสูงสุด'),
        ('ADMIN', 'ผู้ดูแลระบบ'),
        ('VIEWER', 'ผู้ใช้งานอ่านข้อมูล')
    `);
    
    // Insert settings
    await connection.query(`
      INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
        ('organization_name', 'โรงพยาบาลสารภี'),
        ('default_year_mode', 'calendar'),
        ('default_be_year', '2569')
    `);
    
    console.log('Hashing password for admin...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(PASSWORD, salt);
    
    console.log('Checking if admin user already exists...');
    const [rows] = await connection.query('SELECT id FROM users WHERE username = ?', [USERNAME]);
    
    if (rows.length > 0) {
      console.log(`User "${USERNAME}" already exists. Updating password...`);
      await connection.query(
        'UPDATE users SET password_hash = ?, full_name = ?, role = "super_admin", active = 1 WHERE username = ?',
        [passwordHash, FULL_NAME, USERNAME]
      );
    } else {
      console.log(`Creating user "${USERNAME}" as super_admin...`);
      await connection.query(
        'INSERT INTO users (username, password_hash, full_name, role, active) VALUES (?, ?, ?, "super_admin", 1)',
        [USERNAME, passwordHash, FULL_NAME]
      );
    }
    
    console.log('\n======================================================');
    console.log('   🎉 Database setup and User Seeding Successful!');
    console.log('======================================================');
    console.log(`Database Name: ${dbConfig.database}`);
    console.log(`Username     : ${USERNAME}`);
    console.log('Password     : set from ADMIN_PASSWORD environment variable');
    console.log(`Role         : super_admin (สิทธิ์สูงสุด)`);
    console.log('======================================================\n');
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
    console.error('\nกรุณาตรวจสอบว่า:');
    console.log('1. MySQL/MariaDB server กำลังทำงานอยู่');
    console.log('2. ข้อมูลการเชื่อมต่อใน .env (APP_DB_HOST, APP_DB_PORT, APP_DB_USER, APP_DB_PASSWORD) ถูกต้อง');
    console.log('3. User ที่ใช้มีสิทธิ์เพียงพอในการสร้าง Database และ Tables\n');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
