import mysql from 'mysql2/promise';
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
    const fallbackPathApi = path.resolve(process.cwd(), '../.env');
    if (fs.existsSync(fallbackPathApi)) {
      dotenv.config({ path: fallbackPathApi });
    } else {
      dotenv.config({ path: envPath });
    }
  }
}

async function testHosxpHolder(poolName, config) {
  console.log(`\nTesting connection to [${poolName}] at ${config.host}:${config.port}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectTimeout: 5000 // 5 seconds timeout
    });
    
    console.log(`✅ [${poolName}] Connected successfully!`);
    
    // Check if the table exists or run a simple query
    if (poolName === 'HOSxP Read (dbPool)' || poolName === 'HOSxP Write (dbWritePool)') {
      const tableName = process.env.HOLIDAY_TABLE || 'holiday';
      console.log(`Checking if table "${tableName}" exists in database "${config.database}"...`);
      const [rows] = await connection.query(`SHOW TABLES LIKE ?`, [tableName]);
      if (rows.length > 0) {
        console.log(`✅ Table "${tableName}" exists!`);
        const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
        console.log(`Table "${tableName}" has columns: ${columns.map(c => c.Field).join(', ')}`);
        
        // Count rows
        const [countRow] = await connection.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``);
        console.log(`Total rows in "${tableName}": ${countRow[0].total}`);
      } else {
        console.log(`❌ Table "${tableName}" does NOT exist in database "${config.database}"!`);
      }
    } else if (poolName === 'App Database (appDbPool)') {
      console.log('Checking app database tables...');
      const [rows] = await connection.query(`SHOW TABLES`);
      console.log(`Existing tables: ${rows.map(r => Object.values(r)[0]).join(', ')}`);
      
      const [userCount] = await connection.query(`SELECT COUNT(*) AS total FROM users`);
      console.log(`Total users: ${userCount[0].total}`);
    }
  } catch (error) {
    console.log(`❌ [${poolName}] Connection FAILED:`, error.message);
    console.log(`Details: Code = ${error.code || 'N/A'}, Errno = ${error.errno || 'N/A'}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testAll() {
  console.log('======================================================');
  console.log('       Database Connection Diagnostician');
  console.log('======================================================');

  // 1. HOSxP Read Pool
  await testHosxpHolder('HOSxP Read (dbPool)', {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'holiday_readonly',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hosxp',
  });

  // 2. HOSxP Write Pool
  await testHosxpHolder('HOSxP Write (dbWritePool)', {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER_WRITE || 'holiday_write',
    password: process.env.DB_PASSWORD_WRITE || '',
    database: process.env.DB_NAME || 'hosxp',
  });

  // 3. App Database Pool
  await testHosxpHolder('App Database (appDbPool)', {
    host: process.env.APP_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.APP_DB_PORT || '3306'),
    user: process.env.APP_DB_USER || 'holiday_app',
    password: process.env.APP_DB_PASSWORD || '',
    database: process.env.APP_DB_NAME || 'hosxp_holiday_app',
  });

  console.log('\n======================================================');
}

testAll();
