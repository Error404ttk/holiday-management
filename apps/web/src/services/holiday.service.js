import { beToCe, getYearRange } from '../utils/date';
import { api } from './api';
export async function getHolidays(params) {
    const response = await api.get('/holidays', {
        params: { year: beToCe(params.year), mode: params.mode }
    });
    return response.data.data;
}
export async function getHolidayById(id) {
    const response = await api.get(`/holidays/${id}`);
    return response.data.data;
}
export async function createHoliday(input) {
    const response = await api.post('/holidays', input);
    return response.data.data;
}
export async function updateHoliday(id, input, reason) {
    const response = await api.put(`/holidays/${id}`, { ...input, reason });
    return response.data.data;
}
export async function updateHolidayStatus(id, active, reason) {
    const response = await api.patch(`/holidays/${id}/status`, { active, reason });
    return response.data.data;
}
export async function checkHoliday(date) {
    const response = await api.get('/check-holiday', {
        params: { date }
    });
    return response.data.data;
}
export function filterHolidaysByKeyword(holidays, keyword) {
    const normalizedKeyword = keyword.toLocaleLowerCase('th-TH');
    return holidays.filter((holiday) => !normalizedKeyword || holiday.holiday_name.toLocaleLowerCase('th-TH').includes(normalizedKeyword));
}
export function getHolidayYearRange(beYear, mode) {
    return getYearRange(beYear, mode);
}
export async function getHolidaySchemaConfig() {
    const response = await api.get('/holidays/schema');
    return response.data.data;
}
