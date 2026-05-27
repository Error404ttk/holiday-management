import { api } from './api';
export async function getSettingsStatus() {
    const response = await api.get('/settings/status');
    return response.data.data;
}
