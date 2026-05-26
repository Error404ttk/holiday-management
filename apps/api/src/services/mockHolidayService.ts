import { holidaysMock } from '../data/holidays.mock.js';
import type { Holiday, HolidayInput, YearMode } from '../types/holiday.js';
import { addAuditLog } from './mockAuditLogService.js';

function getYearRange(ceYear: number, mode: YearMode): { startDate: string; endDate: string } {
  if (mode === 'fiscal') {
    return {
      startDate: `${ceYear - 1}-10-01`,
      endDate: `${ceYear}-09-30`
    };
  }

  return {
    startDate: `${ceYear}-01-01`,
    endDate: `${ceYear}-12-31`
  };
}

export function listHolidays(year: number, mode: YearMode): Holiday[] {
  const range = getYearRange(year, mode);
  return holidaysMock.filter(
    (holiday) => holiday.holiday_date >= range.startDate && holiday.holiday_date <= range.endDate
  );
}

export function getHoliday(id: number): Holiday | undefined {
  return holidaysMock.find((holiday) => holiday.id === id);
}

export function createHoliday(input: HolidayInput, ipAddress?: string): Holiday {
  const holiday: Holiday = {
    id: Math.max(...holidaysMock.map((item) => item.id), 0) + 1,
    ...input
  };

  holidaysMock.push(holiday);
  addAuditLog({
    action: 'CREATE_HOLIDAY',
    targetId: String(holiday.id),
    oldValue: null,
    newValue: holiday,
    reason: 'mock create',
    ipAddress
  });

  return holiday;
}

export function updateHoliday(id: number, input: HolidayInput, ipAddress?: string): Holiday | null {
  const holiday = getHoliday(id);
  if (!holiday) return null;

  const oldValue = { ...holiday };
  Object.assign(holiday, input);
  addAuditLog({
    action: 'UPDATE_HOLIDAY',
    targetId: String(id),
    oldValue,
    newValue: { ...holiday },
    reason: 'mock update',
    ipAddress
  });

  return holiday;
}

export function updateHolidayStatus(id: number, active: boolean, ipAddress?: string): Holiday | null {
  const holiday = getHoliday(id);
  if (!holiday) return null;

  const oldValue = { ...holiday };
  holiday.active = active;
  addAuditLog({
    action: active ? 'UPDATE_HOLIDAY' : 'DISABLE_HOLIDAY',
    targetId: String(id),
    oldValue,
    newValue: { ...holiday },
    reason: 'mock status update',
    ipAddress
  });

  return holiday;
}

export function checkHoliday(date: string, ipAddress?: string): { date: string; isHoliday: boolean; status: string; holiday: Holiday | null } {
  const holiday = holidaysMock.find((item) => item.holiday_date === date) ?? null;
  addAuditLog({
    action: 'HOLIDAY_CHECK',
    targetId: date,
    oldValue: null,
    newValue: holiday,
    reason: 'mock check holiday',
    ipAddress
  });

  if (holiday?.active) {
    return { date, isHoliday: true, status: 'active', holiday };
  }

  if (holiday && !holiday.active) {
    return { date, isHoliday: false, status: 'inactive', holiday };
  }

  return { date, isHoliday: false, status: 'not_found', holiday: null };
}
