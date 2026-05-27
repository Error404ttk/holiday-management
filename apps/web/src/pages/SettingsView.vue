<template>
  <section class="settings-page pb-10">
    <!-- Header -->
    <div class="settings-header mb-8">
      <div class="d-flex align-center gap-3 mb-1">
        <v-icon icon="mdi-cog-outline" color="primary" size="32" />
        <h1 class="text-h4 font-weight-bold text-slate-900 mb-0">ตั้งค่าระบบ</h1>
      </div>
      <p class="text-body-1 text-slate-500 mb-0">จัดการการเชื่อมต่อฐานข้อมูล สิทธิ์การใช้งาน และข้อมูลพื้นฐานของระบบ</p>
    </div>

    <v-row>
      <!-- 1. การเชื่อมต่อฐานข้อมูล -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl">
          <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
            <v-icon icon="mdi-database-settings" class="me-2" color="primary" />
            การเชื่อมต่อฐานข้อมูล
          </v-card-title>
          <v-card-text class="pa-5">
            <div class="info-group mb-4">
              <div class="text-overline text-primary">HOSxP Database (MySQL)</div>
              <div class="d-flex justify-space-between align-center py-2 border-b border-dashed">
                <span class="text-body-2">Server Address</span>
                <span class="text-body-2 font-weight-bold">{{ dbHealth ? maskedIp : '-' }}</span>
              </div>
              <div class="d-flex justify-space-between align-center py-2 border-b border-dashed">
                <span class="text-body-2">Database Name</span>
                <span class="text-body-2 font-weight-bold">{{ dbHealth?.database || '-' }}</span>
              </div>
              <div class="d-flex justify-space-between align-center py-2 border-b border-dashed">
                <span class="text-body-2">Status</span>
                <v-chip
                  size="x-small"
                  :color="dbStatusColor"
                  variant="flat"
                >
                  {{ dbStatusText }}
                </v-chip>
              </div>
            </div>

            <div class="info-group">
              <div class="text-overline text-primary">App Database (Local/Audit)</div>
              <div class="d-flex justify-space-between align-center py-2 border-b border-dashed">
                <span class="text-body-2">Status</span>
                <v-chip size="x-small" color="success" variant="flat">Connected</v-chip>
              </div>
            </div>

            <v-alert v-if="healthError" type="error" variant="tonal" density="compact" class="mt-6 text-caption">
              {{ healthError }}
            </v-alert>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              icon="mdi-developer-board"
              class="mt-6 text-caption"
            >
              ส่วนการแก้ไขการเชื่อมต่อผ่านหน้าจอ <strong>กำลังพัฒนา</strong>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 2. โครงสร้างข้อมูล (Schema) -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl">
          <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
            <v-icon icon="mdi-table-cog" class="me-2" color="primary" />
            โครงสร้างข้อมูล (Schema)
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="schemaConfig" class="schema-info">
              <div class="d-flex justify-space-between py-2 border-b border-dashed">
                <span class="text-body-2">ชื่อตารางหลัก</span>
                <span class="text-body-2 font-weight-bold text-mono">{{ dbHealth?.table || '-' }}</span>
              </div>
              <div class="d-flex justify-space-between py-2 border-b border-dashed">
                <span class="text-body-2">คอลัมน์วันที่</span>
                <span class="text-body-2 font-weight-bold text-mono"> holiday_date (Default) </span>
              </div>
              <div class="d-flex justify-space-between py-2 border-b border-dashed">
                <span class="text-body-2">คอลัมน์ประเภทวันหยุด</span>
                <v-icon :icon="schemaConfig.typeColumnSupported ? 'mdi-check-circle' : 'mdi-minus-circle'" :color="schemaConfig.typeColumnSupported ? 'success' : 'grey-lighten-1'" size="18" />
              </div>
              <div class="d-flex justify-space-between py-2 border-b border-dashed">
                <span class="text-body-2">คอลัมน์สถานะ (Active)</span>
                <v-icon :icon="schemaConfig.activeColumnSupported ? 'mdi-check-circle' : 'mdi-minus-circle'" :color="schemaConfig.activeColumnSupported ? 'success' : 'grey-lighten-1'" size="18" />
              </div>
            </div>
            <div v-else class="text-center py-5">
              <v-progress-circular indeterminate color="primary" size="24" />
            </div>

            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              icon="mdi-code-braces"
              class="mt-6 text-caption"
            >
              ระบบรองรับการปรับเปลี่ยน Schema อัตโนมัติตามไฟล์ Config
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 3. การจัดการผู้ใช้งาน -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl" color="grey-lighten-4" variant="flat">
          <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center text-grey-darken-2">
            <v-icon icon="mdi-account-group-outline" class="me-2" />
            การจัดการผู้ใช้งาน
          </v-card-title>
          <v-card-text class="pa-10 text-center">
            <v-icon icon="mdi-account-cog" size="48" color="grey-lighten-1" class="mb-2" />
            <div class="text-h6 font-weight-bold text-grey-darken-1">ส่วนจัดการผู้ใช้งาน</div>
            <div class="text-body-2 text-grey">ระบบกำลังพัฒนา (Coming Soon)</div>
            <v-btn disabled variant="outlined" color="primary" class="mt-4" rounded="pill">
              เพิ่มผู้ใช้งานใหม่
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 4. ข้อมูลระบบและสภาพแวดล้อม -->
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl">
          <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
            <v-icon icon="mdi-information-outline" class="me-2" color="secondary" />
            เกี่ยวกับระบบ
          </v-card-title>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between py-2 border-b border-dashed">
              <span class="text-body-2">แอปพลิเคชัน</span>
              <span class="text-body-2 font-weight-bold">HOSxP Holiday System</span>
            </div>
            <div class="d-flex justify-space-between py-2 border-b border-dashed">
              <span class="text-body-2">เวอร์ชันปัจจุบัน</span>
              <span class="text-body-2 font-weight-bold text-secondary">V1.{{ versionDate }}--stable</span>
            </div>
            <div class="d-flex justify-space-between py-2 border-b border-dashed">
              <span class="text-body-2">สภาพแวดล้อม</span>
              <v-chip size="x-small" color="secondary" variant="flat">Production</v-chip>
            </div>
            <div class="d-flex justify-space-between py-2 border-b border-dashed">
              <span class="text-body-2">เฟรมเวิร์ค</span>
              <span class="text-body-2 font-weight-bold">Vue 3 / Vuetify 3 / Node.js</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { apiErrorMessage } from '../services/api';
import { getDbHealth, type DbHealth } from '../services/db.service';
import { getHolidaySchemaConfig, type HolidaySchemaConfig } from '../services/holiday.service';
import { getVersionDate } from '../utils/date';

const schemaConfig = ref<HolidaySchemaConfig | null>(null);
const dbHealth = ref<DbHealth | null>(null);
const loadingHealth = ref(false);
const healthError = ref('');

const versionDate = computed(() => getVersionDate());

const maskedIp = computed(() => {
  const host = dbHealth.value?.host || '';
  const parts = host.split('.');
  if (parts.length !== 4) return host;
  return `${parts[0]}.${parts[1]}.**.**`;
});

const dbStatusText = computed(() => {
  if (loadingHealth.value) return 'Checking';
  if (healthError.value) return 'Disconnected';
  return dbHealth.value?.ok === 1 ? 'Connected' : 'Unknown';
});

const dbStatusColor = computed(() => {
  if (loadingHealth.value) return 'grey';
  if (healthError.value) return 'error';
  return dbHealth.value?.ok === 1 ? 'success' : 'warning';
});

async function loadSettings() {
  loadingHealth.value = true;
  healthError.value = '';
  try {
    const [schema, health] = await Promise.all([
      getHolidaySchemaConfig(),
      getDbHealth()
    ]);
    schemaConfig.value = schema;
    dbHealth.value = health;
  } catch (error) {
    console.error('Failed to load settings', error);
    healthError.value = apiErrorMessage(error);
  } finally {
    loadingHealth.value = false;
  }
}

onMounted(loadSettings);
</script>

<style scoped>
.text-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.border-dashed {
  border-bottom-style: dashed !important;
}
</style>
