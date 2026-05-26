import type { Permission, Role } from '../types/auth.js';

const permissionsByRole: Record<Role, Permission[]> = {
  super_admin: [
    'holiday.view',
    'holiday.create',
    'holiday.update',
    'holiday.disable',
    'audit.view',
    'user.manage',
    'setting.manage'
  ],
  admin: [
    'holiday.view',
    'holiday.create',
    'holiday.update',
    'holiday.disable',
    'audit.view',
    'setting.manage'
  ],
  viewer: ['holiday.view', 'audit.view']
};

export function getPermissionsForRole(role: Role): Permission[] {
  return permissionsByRole[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

