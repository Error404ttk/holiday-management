import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  charset: env.DB_CHARSET
});

export const dbWritePool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER_WRITE,
  password: env.DB_PASSWORD_WRITE,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  charset: env.DB_CHARSET
});

export const appDbPool = mysql.createPool({
  host: env.APP_DB_HOST,
  port: env.APP_DB_PORT,
  user: env.APP_DB_USER,
  password: env.APP_DB_PASSWORD,
  database: env.APP_DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4'
});
