<template>
  <v-card class="h-100 rounded-lg">
    <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
      <v-icon icon="mdi-database-settings" class="me-2" color="primary" />
      การเชื่อมต่อฐานข้อมูล
    </v-card-title>
    <v-card-text class="pa-5">
      <div v-if="loading && !settings" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="28" />
      </div>

      <template v-else-if="settings">
        <div class="info-group mb-4">
          <div class="text-overline text-primary">HOSxP Database (MySQL)</div>
          <div class="settings-row">
            <span class="text-body-2">Server Address</span>
            <span class="text-body-2 font-weight-bold">{{ settings.hosxpDatabase.host }}:{{ settings.hosxpDatabase.port }}</span>
          </div>
          <div class="settings-row">
            <span class="text-body-2">Database Name</span>
            <span class="text-body-2 font-weight-bold">{{ settings.hosxpDatabase.database }}</span>
          </div>
          <div class="settings-row">
            <span class="text-body-2">Status</span>
            <v-chip size="small" :color="statusColor(settings.hosxpDatabase.status.ok)" variant="flat">
              {{ settings.hosxpDatabase.status.message }}
            </v-chip>
          </div>
        </div>

        <div class="info-group">
          <div class="text-overline text-primary">App Database (Local/Audit)</div>
          <div class="settings-row">
            <span class="text-body-2">Server Address</span>
            <span class="text-body-2 font-weight-bold">{{ settings.appDatabase.host }}:{{ settings.appDatabase.port }}</span>
          </div>
          <div class="settings-row">
            <span class="text-body-2">Database Name</span>
            <span class="text-body-2 font-weight-bold">{{ settings.appDatabase.database }}</span>
          </div>
          <div class="settings-row">
            <span class="text-body-2">Status</span>
            <v-chip size="small" :color="statusColor(settings.appDatabase.status.ok)" variant="flat">
              {{ settings.appDatabase.status.message }}
            </v-chip>
          </div>
        </div>

        <v-alert
          :type="allDatabasesOk ? 'success' : 'warning'"
          variant="tonal"
          density="compact"
          :icon="allDatabasesOk ? 'mdi-check-circle-outline' : 'mdi-alert-outline'"
          class="mt-6 text-caption"
        >
          {{ allDatabasesOk ? 'ฐานข้อมูลพร้อมใช้งาน' : 'พบการเชื่อมต่อที่ต้องตรวจสอบ' }}
        </v-alert>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SettingsStatus } from '../../services/settings.service';

const props = defineProps<{
  settings: SettingsStatus | null;
  loading: boolean;
}>();

const allDatabasesOk = computed(() => {
  return Boolean(props.settings?.hosxpDatabase.status.ok && props.settings?.appDatabase.status.ok);
});

function statusColor(ok: boolean) {
  return ok ? 'success' : 'error';
}
</script>
