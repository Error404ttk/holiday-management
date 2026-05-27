import { api, type ApiResponse } from './api';

export interface SettingsStatus {
  app: {
    name: string;
    environment: 'development' | 'test' | 'production';
  };
  hosxpDatabase: DatabaseStatus;
  appDatabase: DatabaseStatus;
  schema: SchemaStatus;
}

export interface DatabaseStatus {
  host: string;
  port: number;
  database: string;
  status: {
    ok: boolean;
    message: string;
  };
}

export interface SchemaStatus {
  ok: boolean;
  message: string;
  table: string;
  idColumn: string;
  dateColumn: string;
  nameColumn: string;
  typeColumn: string;
  activeColumn: string;
  noteColumn: string;
  activeColumnSupported: boolean;
  typeColumnSupported: boolean;
  noteColumnSupported: boolean;
}

export async function getSettingsStatus(): Promise<SettingsStatus> {
  const response = await api.get<ApiResponse<SettingsStatus>>('/settings/status');
  return response.data.data;
}
