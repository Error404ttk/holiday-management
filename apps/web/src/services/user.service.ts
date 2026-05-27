import type { Role } from '../types/auth';
import { api, type ApiResponse } from './api';

export interface ManagedUser {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  active: boolean;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateUserInput {
  username: string;
  password: string;
  full_name: string;
  role: Role;
  active: boolean;
}

export interface UpdateUserInput {
  full_name: string;
  role: Role;
  active: boolean;
  password?: string;
}

export interface UserListParams {
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface UserListResult {
  items: ManagedUser[];
  total: number;
  limit: number;
  offset: number;
}

export async function getUsers(params: UserListParams = {}): Promise<UserListResult> {
  const response = await api.get<ApiResponse<UserListResult>>('/users', {
    params: {
      keyword: params.keyword || undefined,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0
    }
  });
  return response.data.data;
}

export async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  const response = await api.post<ApiResponse<ManagedUser>>('/users', input);
  return response.data.data;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<ManagedUser> {
  const response = await api.put<ApiResponse<ManagedUser>>(`/users/${id}`, input);
  return response.data.data;
}
