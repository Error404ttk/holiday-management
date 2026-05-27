import { api, type ApiResponse } from './api';

export interface DbHealth {
  ok: number;
  host: string;
  port: number;
  database: string;
  table: string;
}

export async function getDbHealth(): Promise<DbHealth> {
  const response = await api.get<ApiResponse<DbHealth>>('/db/health');
  return response.data.data;
}
