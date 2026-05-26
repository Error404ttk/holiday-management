import type { RowDataPacket } from 'mysql2';
import { env } from '../config/env.js';
import { dbPool } from '../db/pool.js';
import type { YearMode } from '../types/holiday.js';
import { getHolidaySchema, quoteIdentifier } from './holidaySchemaService.js';

export interface HosxpHolidayRow extends RowDataPacket {
  id?: string | number;
  holiday_date?: string | Date;
  holiday_name?: string;
  holiday_type?: string;
  active?: boolean;
}

export function getCeYearRange(year: number, mode: YearMode): { startDate: string; endDate: string } {
  if (mode === 'fiscal') {
    return {
      startDate: `${year - 1}-10-01`,
      endDate: `${year}-09-30`
    };
  }

  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  };
}

export async function checkDatabaseHealth(): Promise<{ ok: number }> {
  const [rows] = await dbPool.execute<RowDataPacket[]>('SELECT 1 AS ok');
  return { ok: Number(rows[0]?.ok ?? 0) };
}

function isValidHoliday(row: HosxpHolidayRow): boolean {
  return Boolean(row.holiday_name && row.holiday_name.trim() !== '');
}

export async function listHolidaysFromHosxp(year: number, mode: YearMode): Promise<HosxpHolidayRow[]> {
  const schema = await getHolidaySchema();
  const { startDate, endDate } = getCeYearRange(year, mode);
  const [rows] = await dbPool.execute<HosxpHolidayRow[]>(
    `SELECT *
     FROM ${quoteIdentifier(schema.table)}
     WHERE ${quoteIdentifier(schema.dateColumn)} BETWEEN ? AND ?
     ORDER BY ${quoteIdentifier(schema.dateColumn)}`,
    [startDate, endDate]
  );

  return rows.map((row) => normalizeHolidayRow(row, schema)).filter(isValidHoliday);
}

export async function getHolidayFromHosxpById(id: string | number): Promise<HosxpHolidayRow | null> {
  const schema = await getHolidaySchema();
  const [rows] = await dbPool.execute<HosxpHolidayRow[]>(
    `SELECT *
     FROM ${quoteIdentifier(schema.table)}
     WHERE ${quoteIdentifier(schema.idColumn)} = ?
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) return null;
  const normalized = normalizeHolidayRow(rows[0], schema);
  return isValidHoliday(normalized) ? normalized : null;
}

export async function getHolidayFromHosxpByDate(date: string): Promise<HosxpHolidayRow | null> {
  const schema = await getHolidaySchema();
  const [rows] = await dbPool.execute<HosxpHolidayRow[]>(
    `SELECT *
     FROM ${quoteIdentifier(schema.table)}
     WHERE ${quoteIdentifier(schema.dateColumn)} = ?
     LIMIT 1`,
    [date]
  );

  if (!rows[0]) return null;
  const normalized = normalizeHolidayRow(rows[0], schema);
  return isValidHoliday(normalized) ? normalized : null;
}


function dateToIsoDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(value);
  // Already a plain YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // ISO datetime string — extract date portion in local time
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return str;
}

function normalizeHolidayRow(row: HosxpHolidayRow, schema: import('./holidaySchemaService.js').HolidaySchema): HosxpHolidayRow {
  const normalized = { ...row } as HosxpHolidayRow;

  // Normalize holiday_date to plain YYYY-MM-DD string to prevent
  // timezone shift when JSON.stringify converts Date objects to UTC.
  const dateCol = schema.dateColumn;
  const rawDate = row[dateCol];
  const normalizedDate = dateToIsoDateString(rawDate);
  if (normalizedDate) {
    normalized.holiday_date = normalizedDate;
    if (dateCol !== 'holiday_date') {
      normalized[dateCol] = normalizedDate;
    }
  }

  if (schema.idColumn && row[schema.idColumn] !== undefined) {
    const rawId = row[schema.idColumn];
    const normalizedId = dateToIsoDateString(rawId);
    normalized.id = normalizedId || rawId;
  }

  if (schema.nameColumn && row[schema.nameColumn] !== undefined) {
    normalized.holiday_name = String(row[schema.nameColumn] ?? '');
  }

  if (schema.typeColumn && row[schema.typeColumn] !== undefined) {
    normalized.holiday_type = String(row[schema.typeColumn] ?? '');
  }

  if (schema.activeColumn && row[schema.activeColumn] !== undefined) {
    normalized.active = String(row[schema.activeColumn]) === env.HOLIDAY_ACTIVE_TRUE_VALUE;
  }

  return normalized;
}
