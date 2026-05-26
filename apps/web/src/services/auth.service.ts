import { ref } from 'vue';
import type { AuthUser, Permission } from '../types/auth';
import { api, type ApiResponse } from './api';

const tokenKey = 'hosxp_holiday_token';
const currentUser = ref<AuthUser | null>(null);

export function getToken(): string {
  return localStorage.getItem(tokenKey) ?? '';
}

export function setToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function clearAuth() {
  localStorage.removeItem(tokenKey);
  currentUser.value = null;
}

export function getCurrentUser(): AuthUser | null {
  return currentUser.value;
}

export function hasPermission(permission: Permission): boolean {
  return Boolean(currentUser.value?.permissions.includes(permission));
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const response = await api.post<ApiResponse<{ token: string; user: AuthUser }>>('/auth/login', {
    username,
    password
  });
  setToken(response.data.data.token);
  currentUser.value = response.data.data.user;
  return currentUser.value;
}

export async function loadMe(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  const response = await api.get<ApiResponse<AuthUser>>('/auth/me');
  currentUser.value = response.data.data;
  return currentUser.value;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAuth();
  }
}

