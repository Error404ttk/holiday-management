<template>
  <v-app-bar color="primary" density="comfortable" elevation="0">
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
    <v-app-bar-title>ระบบจัดการวันหยุด HOSxP</v-app-bar-title>
    <v-spacer />
    <v-chip class="d-none d-sm-inline-flex mr-3" color="secondary" variant="flat">
      {{ userLabel }}
    </v-chip>
    <v-btn icon="mdi-logout" variant="text" aria-label="ออกจากระบบ" @click="handleLogout" />
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    width="280"
    color="surface"
  >
    <v-list nav density="comfortable" class="pa-3">
      <v-list-item
        v-for="item in visibleMenuItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        rounded="lg"
      />
    </v-list>
  </v-navigation-drawer>

  <v-main>
    <v-container fluid class="page-shell">
      <router-view />
    </v-container>
  </v-main>

  <v-footer app border class="text-slate-500 text-caption pa-2 bg-white">
    <div class="d-flex w-100 align-center px-4">
      <span>&copy; {{ new Date().getFullYear() }} — <strong>HOSxP Holiday Management</strong></span>
      <v-spacer />
      <div class="d-flex align-center gap-4">
        <v-btn variant="text" size="x-small" color="secondary" class="font-weight-bold" @click="releaseDialog = true">
          Release Note
        </v-btn>
        <v-divider vertical class="mx-2 my-2 d-none d-sm-inline" />
        <span class="d-none d-sm-inline">โรงพยาบาลสารภี งานยุทธศาสตร์ และสารสนเทศทางการแพทย์</span>
        <v-divider vertical class="mx-2 my-2 d-none d-sm-inline" />
        <span>V1.{{ getVersionDate() }}--stable</span>
      </div>
    </div>
  </v-footer>

  <!-- Release Note Dialog -->
  <v-dialog v-model="releaseDialog" max-width="480">
    <v-card class="rounded-xl pa-2">
      <v-card-title class="d-flex align-center pb-0">
        <v-icon color="primary" class="mr-2">mdi-rocket-launch-outline</v-icon>
        <span class="font-weight-bold">บันทึกการปรับปรุงระบบ</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="releaseDialog = false" />
      </v-card-title>
      
      <v-card-text class="pt-4 overflow-y-auto" style="max-height: 500px">
        <div class="text-subtitle-2 font-weight-bold text-primary mb-3">เวอร์ชันปัจจุบัน (V1.{{ getVersionDate() }})</div>
        <v-list density="compact" class="pa-0 mb-6">
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">ปรับปรุง UX wiring, ป้องกัน stale response และตั้งค่า port เป็น 5172/3011</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">เพิ่ม Senior Code Review และ hardening ก่อนเตรียม push ขึ้น GitHub</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">เพิ่มระบบวิเคราะห์ประเภทวันหยุดอัตโนมัติในหน้า Form</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">ปรับหน้า ตั้งค่าระบบ ให้ตรวจสถานะ API, HOSxP DB, App DB และ Schema จากข้อมูลจริง</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">เพิ่มระบบจัดการผู้ใช้งาน พร้อมค้นหา แบ่งหน้า เพิ่มผู้ใช้ แก้ไขสิทธิ์ และเปิด/ปิดบัญชี</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">เพิ่ม policy ป้องกันการเปลี่ยนสิทธิ์ตนเอง และควบคุมการจัดการสิทธิ์ super_admin</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">ปรับการบันทึกผู้ใช้งานและ Audit Log ให้อยู่ใน transaction เดียวกัน</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-check-circle" color="success" class="min-h-0">
            <v-list-item-title class="text-body-2">เพิ่มเอกสารแผน Owner-based Cancel / Soft Delete สำหรับฟังก์ชั่นยกเลิกรายการวันหยุด</v-list-item-title>
          </v-list-item>
        </v-list>

        <div class="text-subtitle-2 font-weight-bold text-slate-400 mb-3 border-t pt-4">ประวัติการปรับปรุง (History)</div>
        <div class="history-item mb-3">
          <div class="text-caption font-weight-bold text-slate-600">V1.20260526</div>
          <div class="text-caption text-slate-500">• เพิ่มระบบวิเคราะห์ประเภทวันหยุดอัตโนมัติในหน้า Form</div>
          <div class="text-caption text-slate-500">• ปรับปรุงระบบบันทึก Audit Log ให้เสถียรและอ่านง่ายขึ้น</div>
          <div class="text-caption text-slate-500">• แก้ไขบั๊กการดึงข้อมูล Primary Key ในตาราง HOSxP</div>
          <div class="text-caption text-slate-500">• เพิ่มการตรวจสอบข้อมูลซ้ำ (Atomic Check) ที่ฝั่ง Backend</div>
        </div>
        <div class="history-item mb-3">
          <div class="text-caption font-weight-bold text-slate-600">V1.20250522</div>
          <div class="text-caption text-slate-500">• รองรับปฏิทิน พ.ศ. และปรับโฉม Dashboard ใหม่</div>
        </div>
        <div class="history-item mb-3">
          <div class="text-caption font-weight-bold text-slate-600">V1.20250521</div>
          <div class="text-caption text-slate-500">• เพิ่มระบบ Audit Log และการควบคุมสิทธิ์ (RBAC)</div>
        </div>
        <div class="history-item mb-3">
          <div class="text-caption font-weight-bold text-slate-600">V1.20250520</div>
          <div class="text-caption text-slate-500">• เชื่อมต่อฐานข้อมูล HOSxP (Read/Write) สมบูรณ์</div>
        </div>
        <div class="history-item">
          <div class="text-caption font-weight-bold text-slate-600">V1.20250515</div>
          <div class="text-caption text-slate-500">• เริ่มต้นโครงการและระบบจัดการข้อมูลพื้นฐาน</div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn block color="primary" variant="flat" rounded="pill" @click="releaseDialog = false">ปิดหน้าต่าง</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { getCurrentUser, hasPermission, logout } from '../services/auth.service';
import type { Permission } from '../types/auth';
import { getVersionDate } from '../utils/date';

const { mdAndUp } = useDisplay();
const router = useRouter();
const drawer = ref(mdAndUp.value);
const releaseDialog = ref(false);

watch(mdAndUp, (isDesktop) => {
  drawer.value = isDesktop;
});

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', permission: 'holiday.view' },
  { title: 'รายการวันหยุด', icon: 'mdi-calendar-month', to: '/holidays', permission: 'holiday.view' },
  { title: 'ตรวจสอบวันหยุด', icon: 'mdi-calendar-check', to: '/check-holiday', permission: 'holiday.view' },
  { title: 'Audit Log', icon: 'mdi-clipboard-text-clock-outline', to: '/audit-log', permission: 'audit.view' },
  { title: 'ตั้งค่าระบบ', icon: 'mdi-cog', to: '/settings', permission: 'setting.manage' }
];

const visibleMenuItems = computed(() =>
  menuItems.filter((item) => hasPermission(item.permission as Permission))
);

const userLabel = computed(() => getCurrentUser()?.full_name ?? 'ผู้ใช้งาน');

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>
