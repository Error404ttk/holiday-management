<template>
  <v-card class="h-100 rounded-lg">
    <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
      <v-icon icon="mdi-table-cog" class="me-2" color="primary" />
      โครงสร้างข้อมูล (Schema)
    </v-card-title>
    <v-card-text class="pa-5">
      <div v-if="settings" class="schema-info">
        <div class="settings-row">
          <span class="text-body-2">ชื่อตารางหลัก</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.table }}</span>
        </div>
        <div class="settings-row">
          <span class="text-body-2">คอลัมน์รหัสรายการ</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.idColumn }}</span>
        </div>
        <div class="settings-row">
          <span class="text-body-2">คอลัมน์วันที่</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.dateColumn }}</span>
        </div>
        <div class="settings-row">
          <span class="text-body-2">คอลัมน์ชื่อวันหยุด</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.nameColumn }}</span>
        </div>
        <div class="settings-row">
          <span class="text-body-2">คอลัมน์ประเภทวันหยุด</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.typeColumn }}</span>
        </div>
        <div class="settings-row">
          <span class="text-body-2">คอลัมน์สถานะ (Active)</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.activeColumn }}</span>
        </div>
        <div class="settings-row">
          <span class="text-body-2">คอลัมน์หมายเหตุ</span>
          <span class="text-body-2 font-weight-bold text-mono">{{ settings.schema.noteColumn }}</span>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <v-progress-circular indeterminate color="primary" size="24" />
      </div>

      <v-alert
        :type="settings?.schema.ok ? 'success' : 'warning'"
        variant="tonal"
        density="compact"
        :icon="settings?.schema.ok ? 'mdi-check-circle-outline' : 'mdi-alert-outline'"
        class="mt-6 text-caption"
      >
        {{ settings?.schema.message || 'กำลังตรวจสอบ schema' }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { SettingsStatus } from '../../services/settings.service';

defineProps<{
  settings: SettingsStatus | null;
}>();
</script>
