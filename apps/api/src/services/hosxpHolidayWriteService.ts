import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { dbWritePool } from '../db/pool.js';
import type { HolidayInput } from '../types/holiday.js';
import { HttpError, ErrorCode } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';
import { writeAppAuditLogWithConnection } from './appAuditLogService.js';
import { activeDbValue, getHolidaySchema, quoteIdentifier, type HolidaySchema } from './holidaySchemaService.js';

interface Actor {
  username: string;
  fullName?: string;
  ipAddress: string;
  userAgent?: string;
}

type HolidayPayload = HolidayInput & {
  reason?: string;
};

type SqlValue = string | number | boolean | null | Date;

function asRecord(row: RowDataPacket | undefined): Record<string, unknown> | null {
  return row ? { ...row } : null;
}

function assertPrimaryKey(schema: HolidaySchema): void {
  const idColumn = schema.columns.get(schema.idColumn);
  if (!idColumn || idColumn.Key !== 'PRI') {
    logger.error('Primary key missing or invalid in HOSxP holiday table', undefined, { table: schema.table, idColumn: schema.idColumn });
    throw new HttpError(409, 'ไม่สามารถแก้ไขข้อมูลได้: ตาราง holiday ยังไม่ได้ระบุ primary key ที่ชัดเจน', ErrorCode.SCHEMA_MISMATCH);
  }
}

function assertValidIsoDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD', ErrorCode.VALIDATION_ERROR);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, 'วันที่วันหยุดไม่ถูกต้อง', ErrorCode.VALIDATION_ERROR);
  }
}

function assertMaxLength(value: string | undefined, max: number, label: string): void {
  if ((value ?? '').length > max) {
    throw new HttpError(400, `${label}ยาวเกิน ${max} ตัวอักษร`, ErrorCode.VALIDATION_ERROR);
  }
}

function requirePayload(payload: HolidayPayload, isUpdate: boolean): void {
  if (!payload.holiday_date) {
    throw new HttpError(400, 'กรุณาระบุวันที่วันหยุด', ErrorCode.VALIDATION_ERROR);
  }

  assertValidIsoDate(payload.holiday_date);

  if (!payload.holiday_name?.trim()) {
    throw new HttpError(400, 'กรุณาระบุชื่อวันหยุด', ErrorCode.VALIDATION_ERROR);
  }

  if (isUpdate && !payload.reason?.trim()) {
    throw new HttpError(400, 'กรุณาระบุเหตุผลในการแก้ไข', ErrorCode.VALIDATION_ERROR);
  }

  assertMaxLength(payload.holiday_name, 255, 'ชื่อวันหยุด');
  assertMaxLength(payload.holiday_type, 100, 'ประเภทวันหยุด');
  assertMaxLength(payload.note, 1000, 'หมายเหตุ');
  assertMaxLength(payload.reason, 1000, 'เหตุผลในการแก้ไข');
}

function requireReason(reason: string): void {
  if (!reason?.trim()) {
    throw new HttpError(400, 'กรุณาระบุเหตุผลในการแก้ไขสถานะ', ErrorCode.VALIDATION_ERROR);
  }
  assertMaxLength(reason, 1000, 'เหตุผลในการแก้ไข');
}

async function selectById(
  connection: PoolConnection,
  schema: HolidaySchema,
  id: string | number
): Promise<Record<string, unknown> | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT *
     FROM ${quoteIdentifier(schema.table)}
     WHERE ${quoteIdentifier(schema.idColumn)} = ?
     LIMIT 1`,
    [id]
  );

  return asRecord(rows[0]);
}

async function assertNoDuplicateDate(
  connection: PoolConnection,
  schema: HolidaySchema,
  date: string,
  ignoreId?: string | number
): Promise<void> {
  const params: SqlValue[] = [date];
  let sql = `SELECT ${quoteIdentifier(schema.idColumn)} AS id
             FROM ${quoteIdentifier(schema.table)}
             WHERE ${quoteIdentifier(schema.dateColumn)} = ?`;

  if (ignoreId !== undefined) {
    sql += ` AND ${quoteIdentifier(schema.idColumn)} <> ?`;
    params.push(ignoreId);
  }

  sql += ' LIMIT 1';
  const [rows] = await connection.execute<RowDataPacket[]>(sql, params);
  if (rows.length > 0) {
    throw new HttpError(409, 'พบวันที่วันหยุดซ้ำในระบบ กรุณาตรวจสอบก่อนบันทึก', ErrorCode.CONFLICT);
  }
}

function payloadToColumns(
  schema: HolidaySchema,
  payload: HolidayPayload,
  includeStatus: boolean
): { columns: string[]; values: SqlValue[] } {
  const columns: string[] = [schema.dateColumn, schema.nameColumn];
  const values: SqlValue[] = [payload.holiday_date, payload.holiday_name.trim()];

  if (schema.typeColumn && payload.holiday_type) {
    columns.push(schema.typeColumn);
    values.push(payload.holiday_type.trim());
  }

  if (schema.noteColumn) {
    columns.push(schema.noteColumn);
    values.push(payload.note?.trim() ?? '');
  }

  if (includeStatus) {
    if (!schema.activeColumn) {
      throw new HttpError(409, 'โครงสร้างตารางไม่รองรับการปิดใช้งาน (active column missing)', ErrorCode.SCHEMA_MISMATCH);
    }
    columns.push(schema.activeColumn);
    values.push(activeDbValue(payload.active));
  }

  return { columns, values };
}

async function rollback(connection: PoolConnection): Promise<void> {
  try {
    await connection.rollback();
  } catch (error) {
    logger.error('Holiday transaction rollback failed', error);
  }
}

export async function createHoliday(payload: HolidayPayload, actor: Actor): Promise<Record<string, unknown>> {
  requirePayload(payload, false);
  const schema = await getHolidaySchema();
  assertPrimaryKey(schema);

  const connection = await dbWritePool.getConnection();
  try {
    await connection.beginTransaction();
    await assertNoDuplicateDate(connection, schema, payload.holiday_date);

    const { columns, values } = payloadToColumns(schema, payload, Boolean(schema.activeColumn));
    const placeholders = columns.map(() => '?').join(', ');
    const columnSql = columns.map(quoteIdentifier).join(', ');

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO ${quoteIdentifier(schema.table)} (${columnSql})
       VALUES (${placeholders})`,
      values
    );

    // Determine the actual ID of the record. 
    // If insertId is 0, it likely means the PK is not auto-increment (e.g. holiday_date is PK)
    const effectiveId = result.insertId || (payload as any)[schema.idColumn] || payload.holiday_date;
    const targetId = String(effectiveId);
    
    // Attempt to refetch the record to get the "absolute" truth from DB for Audit Log
    const newValue = await selectById(connection, schema, effectiveId);

    await writeAppAuditLogWithConnection(connection, {
      action: 'CREATE_HOLIDAY',
      username: actor.username,
      fullName: actor.fullName,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      targetTable: schema.table,
      targetId,
      oldValue: null,
      newValue: newValue || { ...payload },
      reason: payload.reason?.trim() || 'เพิ่มวันหยุด'
    });

    await connection.commit();
    logger.info('Holiday created successfully', { targetId, actor: actor.username });
    return newValue ?? { ...payload };
  } catch (error) {
    await rollback(connection);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateHoliday(id: string, payload: HolidayPayload, actor: Actor): Promise<Record<string, unknown>> {
  requirePayload(payload, true);
  const schema = await getHolidaySchema();
  assertPrimaryKey(schema);

  const connection = await dbWritePool.getConnection();
  try {
    await connection.beginTransaction();
    const oldValue = await selectById(connection, schema, id);
    if (!oldValue) {
      throw new HttpError(404, 'ไม่พบรายการวันหยุดที่ต้องการแก้ไข', ErrorCode.NOT_FOUND);
    }

    await assertNoDuplicateDate(connection, schema, payload.holiday_date, id);
    const { columns, values } = payloadToColumns(schema, payload, Boolean(schema.activeColumn));
    const setSql = columns.map((column) => `${quoteIdentifier(column)} = ?`).join(', ');

    await connection.execute(
      `UPDATE ${quoteIdentifier(schema.table)}
       SET ${setSql}
       WHERE ${quoteIdentifier(schema.idColumn)} = ?`,
      [...values, id]
    );

    const newValue = await selectById(connection, schema, id);
    await writeAppAuditLogWithConnection(connection, {
      action: 'UPDATE_HOLIDAY',
      username: actor.username,
      fullName: actor.fullName,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      targetTable: schema.table,
      targetId: String(id),
      oldValue,
      newValue,
      reason: payload.reason?.trim() ?? ''
    });

    await connection.commit();
    logger.info('Holiday updated successfully', { targetId: id, actor: actor.username });
    return newValue ?? oldValue;
  } catch (error) {
    await rollback(connection);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateHolidayStatus(id: string, active: boolean, reason: string, actor: Actor): Promise<Record<string, unknown>> {
  requireReason(reason);
  const schema = await getHolidaySchema();
  assertPrimaryKey(schema);

  if (!schema.activeColumn) {
    throw new HttpError(409, 'โครงสร้างตารางไม่รองรับการปิดใช้งาน (active column missing)', ErrorCode.SCHEMA_MISMATCH);
  }

  const connection = await dbWritePool.getConnection();
  try {
    await connection.beginTransaction();
    const oldValue = await selectById(connection, schema, id);
    if (!oldValue) {
      throw new HttpError(404, 'ไม่พบรายการวันหยุดที่ต้องการแก้ไขสถานะ', ErrorCode.NOT_FOUND);
    }

    await connection.execute(
      `UPDATE ${quoteIdentifier(schema.table)}
       SET ${quoteIdentifier(schema.activeColumn)} = ?
       WHERE ${quoteIdentifier(schema.idColumn)} = ?`,
      [activeDbValue(active), id]
    );

    const newValue = await selectById(connection, schema, id);
    await writeAppAuditLogWithConnection(connection, {
      action: active ? 'ENABLE_HOLIDAY' : 'DISABLE_HOLIDAY',
      username: actor.username,
      fullName: actor.fullName,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      targetTable: schema.table,
      targetId: String(id),
      oldValue,
      newValue,
      reason: reason.trim()
    });

    await connection.commit();
    logger.info(`Holiday ${active ? 'enabled' : 'disabled'} successfully`, { targetId: id, actor: actor.username });
    return newValue ?? oldValue;
  } catch (error) {
    await rollback(connection);
    throw error;
  } finally {
    connection.release();
  }
}
