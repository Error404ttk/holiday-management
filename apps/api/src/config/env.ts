import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

const envPath = process.env.ENV_FILE || '.env';
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  const fallbackPath = path.resolve(process.cwd(), '../../.env');
  if (fs.existsSync(fallbackPath)) {
    dotenv.config({ path: fallbackPath });
  } else {
    dotenv.config({ path: envPath });
  }
}

const rawEnv = {
  ...process.env,
  APP_ENV: process.env.APP_ENV ?? process.env.NODE_ENV,
  APP_PORT: process.env.APP_PORT ?? process.env.API_PORT,
  DB_HOST: process.env.DB_HOST ?? process.env.HOSXP_DB_HOST,
  DB_PORT: process.env.DB_PORT ?? process.env.HOSXP_DB_PORT,
  DB_USER: process.env.DB_USER ?? process.env.HOSXP_DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ?? process.env.HOSXP_DB_PASSWORD,
  DB_NAME: process.env.DB_NAME ?? process.env.HOSXP_DB_NAME,
  DB_USER_WRITE: process.env.DB_USER_WRITE ?? process.env.DB_USER ?? process.env.HOSXP_DB_USER,
  DB_PASSWORD_WRITE: process.env.DB_PASSWORD_WRITE ?? process.env.DB_PASSWORD ?? process.env.HOSXP_DB_PASSWORD,
  APP_DB_HOST: process.env.APP_DB_HOST ?? process.env.DB_HOST ?? process.env.HOSXP_DB_HOST,
  APP_DB_PORT: process.env.APP_DB_PORT ?? process.env.DB_PORT ?? process.env.HOSXP_DB_PORT,
  APP_DB_USER: process.env.APP_DB_USER ?? process.env.DB_USER_WRITE ?? process.env.DB_USER ?? process.env.HOSXP_DB_USER,
  APP_DB_PASSWORD: process.env.APP_DB_PASSWORD ?? process.env.DB_PASSWORD_WRITE ?? process.env.DB_PASSWORD ?? process.env.HOSXP_DB_PASSWORD,
  APP_DB_NAME: process.env.APP_DB_NAME ?? 'hosxp_holiday_app',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? process.env.FRONTEND_URL ?? 'http://localhost:5173'
};

const schema = z.object({
  APP_NAME: z.string().default('HOSxP Holiday Management'),
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('holiday_readonly'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('hosxp'),
  DB_USER_WRITE: z.string().default('holiday_write'),
  DB_PASSWORD_WRITE: z.string().default(''),
  DB_CHARSET: z.string().default('tis620'),
  APP_DB_HOST: z.string().default('127.0.0.1'),
  APP_DB_PORT: z.coerce.number().int().positive().default(3306),
  APP_DB_USER: z.string().default('holiday_app'),
  APP_DB_PASSWORD: z.string().default(''),
  APP_DB_NAME: z.string().default('hosxp_holiday_app'),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET ต้องตั้งค่าใน .env และยาวอย่างน้อย 24 ตัวอักษร'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  HOLIDAY_TABLE: z.string().default('holiday'),
  HOLIDAY_ID_COLUMN: z.string().default(''),
  HOLIDAY_DATE_COLUMN: z.string().default('holiday_date'),
  HOLIDAY_NAME_COLUMN: z.string().default('holiday_name'),
  HOLIDAY_TYPE_COLUMN: z.string().default(''),
  HOLIDAY_ACTIVE_COLUMN: z.string().default(''),
  HOLIDAY_NOTE_COLUMN: z.string().default(''),
  HOLIDAY_ACTIVE_TRUE_VALUE: z.string().default('1'),
  HOLIDAY_ACTIVE_FALSE_VALUE: z.string().default('0')
});

export const env = schema.parse(rawEnv);
