import type { RowDataPacket } from 'mysql2';
import { env } from '../config/env.js';
import { dbPool } from '../db/pool.js';
import { HttpError, ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

interface ColumnRow extends RowDataPacket {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: unknown;
  Extra: string;
}

export interface HolidaySchema {
  table: string;
  columns: Map<string, ColumnRow>;
  idColumn: string;
  dateColumn: string;
  nameColumn: string;
  typeColumn: string | null;
  activeColumn: string | null;
  noteColumn: string | null;
}

const identifierPattern = /^[a-z][a-z0-9_]*$/;

function assertIdentifier(value: string, label: string): string {
  if (!value || !identifierPattern.test(value.toLowerCase())) {
    logger.warn('Invalid SQL identifier detected', { value, label });
    throw new HttpError(400, `การตั้งค่า ${label} ไม่ถูกต้อง: ต้องเป็นตัวอักษร a-z, 0-9 หรือ _ และขึ้นต้นด้วยตัวอักษรเท่านั้น`, ErrorCode.SCHEMA_MISMATCH);
  }

  return value;
}

export function quoteIdentifier(value: string): string {
  return `\`${assertIdentifier(value, 'SQL identifier')}\``;
}

function requireColumn(columns: Map<string, ColumnRow>, column: string, label: string): string {
  const safeColumn = assertIdentifier(column, label);
  if (!columns.has(safeColumn)) {
    logger.error('Required column missing in schema', undefined, { column: safeColumn, label });
    throw new HttpError(400, `โครงสร้างตารางไม่ถูกต้อง: ไม่พบ column ${safeColumn} (กรุณาตรวจสอบการตั้งค่า ${label})`, ErrorCode.SCHEMA_MISMATCH);
  }

  return safeColumn;
}

function optionalColumn(columns: Map<string, ColumnRow>, column: string, label: string): string | null {
  if (!column) return null;
  return requireColumn(columns, column, label);
}

export async function getHolidaySchema(): Promise<HolidaySchema> {
  const table = assertIdentifier(env.HOLIDAY_TABLE, 'HOLIDAY_TABLE');
  const [rows] = await dbPool.query<ColumnRow[]>(`SHOW COLUMNS FROM ${quoteIdentifier(table)}`);
  const columns = new Map<string, ColumnRow>(rows.map((row) => [row.Field, row]));

  return {
    table,
    columns,
    idColumn: requireColumn(columns, env.HOLIDAY_ID_COLUMN, 'HOLIDAY_ID_COLUMN'),
    dateColumn: requireColumn(columns, env.HOLIDAY_DATE_COLUMN, 'HOLIDAY_DATE_COLUMN'),
    nameColumn: requireColumn(columns, env.HOLIDAY_NAME_COLUMN, 'HOLIDAY_NAME_COLUMN'),
    typeColumn: optionalColumn(columns, env.HOLIDAY_TYPE_COLUMN, 'HOLIDAY_TYPE_COLUMN'),
    activeColumn: optionalColumn(columns, env.HOLIDAY_ACTIVE_COLUMN, 'HOLIDAY_ACTIVE_COLUMN'),
    noteColumn: optionalColumn(columns, env.HOLIDAY_NOTE_COLUMN, 'HOLIDAY_NOTE_COLUMN')
  };
}

export function activeDbValue(active: boolean): string {
  return active ? env.HOLIDAY_ACTIVE_TRUE_VALUE : env.HOLIDAY_ACTIVE_FALSE_VALUE;
}

