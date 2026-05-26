import type { DateRange, Holiday, HolidayInput, YearMode } from '../types/holiday';
import { beToCe, getYearRange } from '../utils/date';
import { api, type ApiResponse } from './api';

export interface CheckHolidayResult {
  date: string;
  isHoliday: boolean;
  status: 'active' | 'inactive' | 'not_found';
  holiday: Holiday | null;
}

export interface HolidayListParams {
  year: number;
  mode: YearMode;
}

export async function getHolidays(params: HolidayListParams): Promise<Holiday[]> {
  const response = await api.get<ApiResponse<Holiday[]>>('/holidays', {
    params: { year: beToCe(params.year), mode: params.mode }
  });
  return response.data.data;
}

export async function getHolidayById(id: string | number): Promise<Holiday> {
  const response = await api.get<ApiResponse<Holiday>>(`/holidays/${id}`);
  return response.data.data;
}

export async function createHoliday(input: HolidayInput): Promise<Holiday> {
  const response = await api.post<ApiResponse<Holiday>>('/holidays', input);
  return response.data.data;
}

export async function updateHoliday(id: string | number, input: HolidayInput, reason: string): Promise<Holiday> {
  const response = await api.put<ApiResponse<Holiday>>(`/holidays/${id}`, { ...input, reason });
  return response.data.data;
}

export async function updateHolidayStatus(id: string | number, active: boolean, reason: string): Promise<Holiday> {
  const response = await api.patch<ApiResponse<Holiday>>(`/holidays/${id}/status`, { active, reason });
  return response.data.data;
}

export async function checkHoliday(date: string): Promise<CheckHolidayResult> {
  const response = await api.get<ApiResponse<CheckHolidayResult>>('/check-holiday', {
    params: { date }
  });
  return response.data.data;
}

export function filterHolidaysByKeyword(holidays: Holiday[], keyword: string): Holiday[] {
  const normalizedKeyword = keyword.toLocaleLowerCase('th-TH');

  return holidays.filter((holiday) =>
    !normalizedKeyword || holiday.holiday_name.toLocaleLowerCase('th-TH').includes(normalizedKeyword)
  );
}

export function getHolidayYearRange(beYear: number, mode: YearMode): DateRange {
  return getYearRange(beYear, mode);
}

export interface HolidaySchemaConfig {
  activeColumnSupported: boolean;
  typeColumnSupported: boolean;
  noteColumnSupported: boolean;
}

export async function getHolidaySchemaConfig(): Promise<HolidaySchemaConfig> {
  const response = await api.get<ApiResponse<HolidaySchemaConfig>>('/holidays/schema');
  return response.data.data;
}
