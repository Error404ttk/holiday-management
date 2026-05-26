export type Role = 'super_admin' | 'admin' | 'viewer';

export type Permission =
  | 'holiday.view'
  | 'holiday.create'
  | 'holiday.update'
  | 'holiday.disable'
  | 'audit.view'
  | 'user.manage'
  | 'setting.manage';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  permissions: Permission[];
}

