import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './pages/LoginPage.vue';
import DashboardPage from './pages/DashboardPage.vue';
import HolidayFormPage from './pages/HolidayFormPage.vue';
import HolidayListPage from './pages/HolidayListPage.vue';
import HolidayCheckPage from './pages/HolidayCheckPage.vue';
import AuditLogPage from './pages/AuditLogPage.vue';
import { getCurrentUser, hasPermission, loadMe } from './services/auth.service';
import type { Permission } from './types/auth';
import SettingsView from './pages/SettingsView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
    { path: '/', name: 'dashboard', component: DashboardPage, meta: { permission: 'holiday.view' } },
    { path: '/holidays', name: 'holidays', component: HolidayListPage, meta: { permission: 'holiday.view' } },
    { path: '/holidays/create', name: 'holiday-create', component: HolidayFormPage, meta: { permission: 'holiday.create' } },
    { path: '/holidays/:id/edit', name: 'holiday-edit', component: HolidayFormPage, meta: { permission: 'holiday.update' } },
    { path: '/check-holiday', name: 'check-holiday', component: HolidayCheckPage, meta: { permission: 'holiday.view' } },
    { path: '/audit-logs', redirect: '/audit-log' },
    { path: '/audit-log', name: 'audit-log', component: AuditLogPage, meta: { permission: 'audit.view' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { permission: 'setting.manage' } }
  ]
});

router.beforeEach(async (to) => {
  if (to.meta.public) return true;

  let user = getCurrentUser();
  if (!user) {
    user = await loadMe().catch(() => null);
  }

  if (!user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  const permission = to.meta.permission as Permission | undefined;
  if (permission && !hasPermission(permission)) {
    return '/';
  }

  return true;
});
