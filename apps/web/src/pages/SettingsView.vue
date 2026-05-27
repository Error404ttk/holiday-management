<template>
  <section class="settings-page pb-10">
    <div class="settings-header mb-8">
      <div class="d-flex align-center gap-3 mb-1">
        <v-icon icon="mdi-cog-outline" color="primary" size="32" />
        <h1 class="text-h4 font-weight-bold text-slate-900 mb-0">ตั้งค่าระบบ</h1>
      </div>
      <div class="d-flex flex-wrap align-center justify-space-between ga-3">
        <p class="text-body-1 text-slate-500 mb-0">ตรวจสอบการเชื่อมต่อฐานข้อมูล โครงสร้างตาราง และข้อมูลพื้นฐานของระบบ</p>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadSettings">
          ตรวจสอบอีกครั้ง
        </v-btn>
      </div>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" icon="mdi-alert-circle-outline" class="mb-5">
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <DatabaseStatusCard :settings="settings" :loading="loading" />
      </v-col>

      <v-col cols="12" md="6">
        <SchemaStatusCard :settings="settings" />
      </v-col>

      <v-col cols="12" md="6">
        <UserManagementCard />
      </v-col>

      <v-col cols="12" md="6">
        <SystemInfoCard :settings="settings" :version-date="versionDate" />
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DatabaseStatusCard from '../components/settings/DatabaseStatusCard.vue';
import SchemaStatusCard from '../components/settings/SchemaStatusCard.vue';
import SystemInfoCard from '../components/settings/SystemInfoCard.vue';
import UserManagementCard from '../components/settings/UserManagementCard.vue';
import '../components/settings/settings-card.css';
import { apiErrorMessage } from '../services/api';
import { getSettingsStatus, type SettingsStatus } from '../services/settings.service';
import { getVersionDate } from '../utils/date';

const settings = ref<SettingsStatus | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const versionDate = computed(() => getVersionDate());

async function loadSettings() {
  loading.value = true;
  errorMessage.value = '';
  try {
    settings.value = await getSettingsStatus();
  } catch (error) {
    console.error('Failed to load settings', error);
    errorMessage.value = apiErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadSettings);
</script>

<style scoped>
.settings-page :deep(.v-data-table) {
  border-radius: 0 0 8px 8px;
}
</style>
