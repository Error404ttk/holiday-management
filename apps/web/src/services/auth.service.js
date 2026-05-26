import { ref } from 'vue';
import { api } from './api';
const tokenKey = 'hosxp_holiday_token';
const currentUser = ref(null);
export function getToken() {
    return localStorage.getItem(tokenKey) ?? '';
}
export function setToken(token) {
    localStorage.setItem(tokenKey, token);
}
export function clearAuth() {
    localStorage.removeItem(tokenKey);
    currentUser.value = null;
}
export function getCurrentUser() {
    return currentUser.value;
}
export function hasPermission(permission) {
    return Boolean(currentUser.value?.permissions.includes(permission));
}
export async function login(username, password) {
    const response = await api.post('/auth/login', {
        username,
        password
    });
    setToken(response.data.data.token);
    currentUser.value = response.data.data.user;
    return currentUser.value;
}
export async function loadMe() {
    if (!getToken())
        return null;
    const response = await api.get('/auth/me');
    currentUser.value = response.data.data;
    return currentUser.value;
}
export async function logout() {
    try {
        await api.post('/auth/logout');
    }
    finally {
        clearAuth();
    }
}
