import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { env } from '../config/env.js';
import { appDbPool } from '../db/pool.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { getHolidaySchema } from '../services/holidaySchemaService.js';
import { checkDatabaseHealth } from '../services/hosxpHolidayReadService.js';
import { logger } from '../utils/logger.js';

export const settingsRoutes = Router();

type ConnectionStatus = {
  ok: boolean;
  message: string;
};

function maskHost(host: string): string {
  const parts = host.split('.');
  if (parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part))) {
    return `${parts[0]}.${parts[1]}.**.**`;
  }

  if (host.length <= 4) return host;
  return `${host.slice(0, 2)}***${host.slice(-2)}`;
}

async function checkAppDatabaseHealth(): Promise<{ ok: number }> {
  const [rows] = await appDbPool.execute<RowDataPacket[]>('SELECT 1 AS ok');
  return { ok: Number(rows[0]?.ok ?? 0) };
}

async function resolveConnectionStatus(check: () => Promise<{ ok: number }>, name: string): Promise<ConnectionStatus> {
  try {
    const result = await check();
    return {
      ok: result.ok === 1,
      message: result.ok === 1 ? 'เชื่อมต่อได้' : 'เชื่อมต่อไม่สมบูรณ์'
    };
  } catch (error) {
    logger.error(`${name} settings health check failed`, error);
    return {
      ok: false,
      message: 'เชื่อมต่อไม่ได้'
    };
  }
}

settingsRoutes.get('/settings/status', authenticate, requirePermission('setting.manage'), async (_req, res) => {
  const [hosxpStatus, appStatus] = await Promise.all([
    resolveConnectionStatus(checkDatabaseHealth, 'HOSxP DB'),
    resolveConnectionStatus(checkAppDatabaseHealth, 'App DB')
  ]);

  let schemaStatus = {
    ok: false,
    message: 'ยังตรวจสอบ schema ไม่สำเร็จ',
    activeColumnSupported: false,
    typeColumnSupported: false,
    noteColumnSupported: false
  };

  try {
    const schema = await getHolidaySchema();
    schemaStatus = {
      ok: true,
      message: 'ตรวจสอบ schema สำเร็จ',
      activeColumnSupported: Boolean(schema.activeColumn),
      typeColumnSupported: Boolean(schema.typeColumn),
      noteColumnSupported: Boolean(schema.noteColumn)
    };
  } catch (error) {
    logger.error('Settings schema check failed', error);
  }

  res.json({
    success: true,
    data: {
      app: {
        name: env.APP_NAME,
        environment: env.APP_ENV
      },
      hosxpDatabase: {
        host: maskHost(env.DB_HOST),
        port: env.DB_PORT,
        database: env.DB_NAME,
        status: hosxpStatus
      },
      appDatabase: {
        host: maskHost(env.APP_DB_HOST),
        port: env.APP_DB_PORT,
        database: env.APP_DB_NAME,
        status: appStatus
      },
      schema: {
        table: env.HOLIDAY_TABLE,
        idColumn: env.HOLIDAY_ID_COLUMN || '-',
        dateColumn: env.HOLIDAY_DATE_COLUMN,
        nameColumn: env.HOLIDAY_NAME_COLUMN,
        typeColumn: env.HOLIDAY_TYPE_COLUMN || '-',
        activeColumn: env.HOLIDAY_ACTIVE_COLUMN || '-',
        noteColumn: env.HOLIDAY_NOTE_COLUMN || '-',
        ...schemaStatus
      }
    }
  });
});
