import { api } from './api';
export async function getAuditLogs(params) {
    const response = await api.get('/audit-logs', { params });
    return response.data.data;
}
export function listAuditActions(logs) {
    return Array.from(new Set(logs.map((log) => log.action)));
}
export function filterAuditLogs(logs, filters) {
    const username = (filters.username || '').toLocaleLowerCase('th-TH');
    return (logs || []).filter((log) => {
        if (!log)
            return false;
        const logDate = (log.created_at || '').slice(0, 10);
        const logUsername = (log.username || '').toLocaleLowerCase('th-TH');
        const matchesUsername = !username || logUsername.includes(username);
        const matchesAction = !filters.action || log.action === filters.action;
        const matchesStart = !filters.startDate || logDate >= filters.startDate;
        const matchesEnd = !filters.endDate || logDate <= filters.endDate;
        return matchesUsername && matchesAction && matchesStart && matchesEnd;
    });
}
export function formatAuditValue(value) {
    return value ? JSON.stringify(value, null, 2) : '-';
}
export function getAuditActionColor(action) {
    if (action.includes('FAILED') || action.includes('DISABLE'))
        return 'warning';
    if (action.includes('CREATE'))
        return 'success';
    if (action.includes('UPDATE'))
        return 'secondary';
    return 'primary';
}
