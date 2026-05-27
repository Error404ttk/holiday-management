<template>
  <v-card class="h-100 rounded-lg">
    <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
      <v-icon icon="mdi-information-outline" class="me-2" color="secondary" />
      เกี่ยวกับระบบ
    </v-card-title>
    <v-card-text class="pa-5">
      <div class="settings-row">
        <span class="text-body-2">แอปพลิเคชัน</span>
        <span class="text-body-2 font-weight-bold">{{ settings?.app.name || 'HOSxP Holiday System' }}</span>
      </div>
      <div class="settings-row">
        <span class="text-body-2">เวอร์ชันปัจจุบัน</span>
        <span class="text-body-2 font-weight-bold text-secondary">V1.{{ versionDate }}--stable</span>
      </div>
      <div class="settings-row">
        <span class="text-body-2">สภาพแวดล้อม</span>
        <v-chip size="small" color="secondary" variant="flat">{{ settings?.app.environment || '-' }}</v-chip>
      </div>
      <div class="settings-row">
        <span class="text-body-2">เฟรมเวิร์ค</span>
        <span class="text-body-2 font-weight-bold">Vue 3 / Vuetify 3 / Node.js</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { SettingsStatus } from '../../services/settings.service';

defineProps<{
  settings: SettingsStatus | null;
  versionDate: string;
}>();
</script>
