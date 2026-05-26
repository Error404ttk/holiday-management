export type Permission =
  | 'holiday.view'
  | 'holiday.create'
  | 'holiday.update'
  | 'holiday.disable'
  | 'audit.view'
  | 'user.manage'
  | 'setting.manage';

export type Role = 'super_admin' | 'admin' | 'viewer';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  permissions: Permission[];
}

