import axios from 'axios';
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3011/api',
    timeout: 15000
});
console.log('API Service initialized with baseURL:', api.defaults.baseURL);
api.interceptors.request.use((config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    const token = localStorage.getItem('hosxp_holiday_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Prevent browser and proxy caching for GET requests
    if (config.method?.toLowerCase() === 'get') {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
        // Add cache buster parameter to prevent any caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };
    }
    return config;
});
api.interceptors.response.use((response) => response, (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('hosxp_holiday_token');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
export function apiErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        return message || 'ไม่สามารถเชื่อมต่อ API ได้';
    }
    return 'ไม่สามารถทำรายการได้';
}
