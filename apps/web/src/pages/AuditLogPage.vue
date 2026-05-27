<template>
  <section>
    <div class="audit-heading">
      <div>
        <h1 class="page-title">ประวัติการแก้ไข</h1>
        <p class="page-subtitle">แสดง Audit Log จากฐานข้อมูลระบบสำหรับตรวจสอบย้อนหลัง</p>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadAuditLogs"
        >
          รีเฟรชข้อมูล
        </v-btn>
        <v-chip color="secondary" variant="tonal" prepend-icon="mdi-shield-search">
          Audit Log
        </v-chip>
      </div>
    </div>

    <v-alert v-if="loading" type="info" variant="tonal" class="mb-4">
      กำลังโหลดข้อมูลประวัติ...
    </v-alert>

    <v-alert v-if="!loading && auditLogs.length > 0" color="teal-lighten-5" class="mb-4 border">
      <div class="d-flex justify-space-between align-center">
        <div class="text-teal-darken-3">
          <v-icon icon="mdi-database-check" class="me-2" />
          พบข้อมูลประวัติทั้งหมด <strong>{{ auditLogs.length }}</strong> รายการ
          <span v-if="filteredLogs.length < auditLogs.length" class="text-caption ms-2">
            (แสดง {{ filteredLogs.length }} รายการตามตัวกรอง)
          </span>
        </div>
        <v-btn size="small" color="teal" variant="flat" prepend-icon="mdi-refresh" @click="loadAuditLogs">
          โหลดข้อมูลใหม่
        </v-btn>
      </div>
    </v-alert>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="!loading && auditLogs.length === 0" type="info" variant="tonal" class="mb-4">
      ไม่พบข้อมูลประวัติในฐานข้อมูล (จำนวนทั้งหมด: {{ auditLogs.length }})
    </v-alert>

    <v-alert v-if="!loading && auditLogs.length > 0 && filteredLogs.length === 0" type="warning" variant="tonal" class="mb-4">
      ไม่พบข้อมูลที่ตรงตามเงื่อนไขตัวกรอง (พบทั้งหมด {{ auditLogs.length }} รายการ)
    </v-alert>

    <v-card class="filter-card">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.trim="usernameSearch"
              label="ค้นหาผู้ใช้งาน"
              prepend-inner-icon="mdi-account-search"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="selectedAction"
              :items="actionOptions"
              label="Action"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="startDate"
              label="จากวันที่"
              type="date"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="endDate"
              label="ถึงวันที่"
              type="date"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-data-table
        :headers="headers"
        :items="filteredLogs"
        :loading="loading"
        :items-per-page="10"
        item-value="id"
        class="elevation-0"
      >
        <template #item.created_at="{ item }">
          {{ formatThaiDateTime(item.created_at) }}
        </template>

        <template #item.action="{ item }">
          <v-chip :color="actionColor(item.action)" size="small" variant="tonal">
            {{ item.action }}
          </v-chip>
        </template>

        <template #item.reason="{ item }">
          <span class="reason-text">{{ item.reason || '-' }}</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            color="primary"
            @click="openDetail(item)"
          />
        </template>

        <template #no-data>
          <v-sheet class="pa-12 text-center">
            <v-icon icon="mdi-database-off" size="48" color="grey-lighten-1" class="mb-2" />
            <div class="text-grey">ไม่พบรายการ Audit Log</div>
            <v-btn color="primary" variant="text" class="mt-2" @click="loadAuditLogs">ลองโหลดใหม่อีกครั้ง</v-btn>
          </v-sheet>
        </template>
      </v-data-table>
    </v-card>

    <!-- Fallback view if table is completely broken (Visible during debug) -->
    <div v-if="!loading && filteredLogs.length > 0" class="mt-4">
      <div class="text-h6 mb-2">รายการข้อมูลแบบย่อ (สำรอง):</div>
      <v-card v-for="log in filteredLogs.slice(0, 5)" :key="log.id" class="mb-2 pa-3 border-dashed">
        <div class="d-flex justify-space-between align-center">
          <strong>{{ log.username }}</strong>
          <v-chip :color="actionColor(log.action)" size="x-small">{{ log.action }}</v-chip>
        </div>
        <div class="text-caption mt-1">{{ formatThaiDateTime(log.created_at) }}</div>
        <div class="text-body-2 mt-1">{{ log.reason }}</div>
        <v-btn block size="small" variant="tonal" class="mt-2" @click="openDetail(log)">ดูรายละเอียด</v-btn>
      </v-card>
    </div>

    <v-dialog v-model="detailDialog" max-width="760">
      <v-card v-if="selectedLog">
        <v-card-title>รายละเอียด Audit Log</v-card-title>
        <v-card-text>
          <div class="detail-grid">
            <div>
              <span>ผู้ใช้งาน</span>
              <strong>{{ selectedLog.full_name ? `${selectedLog.username} (${selectedLog.full_name})` : selectedLog.username }}</strong>
            </div>
            <div>
              <span>วันเวลา</span>
              <strong>{{ formatThaiDateTime(selectedLog.created_at) }}</strong>
            </div>
            <div>
              <span>IP Address</span>
              <strong>{{ selectedLog.ip_address }}</strong>
            </div>
            <div>
              <span>User Agent</span>
              <strong>{{ selectedLog.user_agent || '-' }}</strong>
            </div>
            <div>
              <span>Action</span>
              <v-chip :color="actionColor(selectedLog.action)" size="small" variant="tonal">
                {{ selectedLog.action }}
              </v-chip>
            </div>
            <div>
              <span>ตารางที่เกี่ยวข้อง</span>
              <strong>{{ selectedLog.target_table }}</strong>
            </div>
            <div>
              <span>Target ID</span>
              <strong>{{ selectedLog.target_id }}</strong>
            </div>
          </div>

          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <div class="json-panel">
                <div class="json-title">ข้อมูลก่อนแก้</div>
                <pre>{{ formatJson(selectedLog.old_value) }}</pre>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="json-panel">
                <div class="json-title">ข้อมูลหลังแก้</div>
                <pre>{{ formatJson(selectedLog.new_value) }}</pre>
              </div>
            </v-col>
          </v-row>

          <div class="reason-panel">
            <span>เหตุผลในการแก้ไข</span>
            <strong>{{ selectedLog.reason || '-' }}</strong>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="detailDialog = false">ปิด</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiErrorMessage } from '../services/api';
import {
  filterAuditLogs,
  formatAuditValue,
  getAuditLogs,
  getAuditActionColor,
  listAuditActions
} from '../services/audit-log.service';
import type { AuditAction, AuditLog } from '../types/audit-log';
import { formatThaiDateTime } from '../utils/date';

const headers = [
  { title: 'วันเวลา', key: 'created_at', sortable: true },
  { title: 'ผู้ใช้งาน', key: 'username', sortable: true },
  { title: 'Action', key: 'action', sortable: true },
  { title: 'ตาราง', key: 'target_table', sortable: true },
  { title: 'IP Address', key: 'ip_address', sortable: true },
  { title: 'เหตุผล', key: 'reason', sortable: false },
  { title: 'จัดการ', key: 'actions', sortable: false, align: 'end' as const }
];

const auditLogs = ref<AuditLog[]>([]);
const loading = ref(false);
const errorMessage = ref('');
const actionOptions = computed(() => listAuditActions(auditLogs.value || []));
const usernameSearch = ref('');
const selectedAction = ref<AuditAction | null>(null);
const startDate = ref('');
const endDate = ref('');
const detailDialog = ref(false);
const selectedLog = ref<AuditLog | null>(null);
let auditRequestSeq = 0;

const filteredLogs = computed(() => {
  console.log('Calculating filteredLogs from:', auditLogs.value.length, 'records');
  const result = filterAuditLogs(auditLogs.value || [], {
    username: usernameSearch.value,
    action: selectedAction.value,
    startDate: startDate.value,
    endDate: endDate.value
  });
  console.log('Filtered result count:', result.length);
  return result;
});

function formatJson(value: Record<string, unknown> | null): string {
  return formatAuditValue(value);
}

function actionColor(action: AuditAction): string {
  return getAuditActionColor(action);
}

function openDetail(log: AuditLog) {
  selectedLog.value = log;
  detailDialog.value = true;
}

async function loadAuditLogs() {
  const requestId = ++auditRequestSeq;
  loading.value = true;
  errorMessage.value = '';
  console.log('Fetching audit logs');
  try {
    const data = await getAuditLogs();
    console.log('Received audit logs:', data);
    if (requestId !== auditRequestSeq) return;
    auditLogs.value = data;
  } catch (error) {
    if (requestId !== auditRequestSeq) return;
    console.error('Audit log fetch error:', error);
    errorMessage.value = apiErrorMessage(error);
  } finally {
    if (requestId === auditRequestSeq) {
      loading.value = false;
    }
  }
}

onMounted(loadAuditLogs);
</script>

<style scoped>
.audit-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.filter-card {
  border: 1px solid rgba(15, 118, 110, 0.1);
}

.reason-text {
  display: inline-block;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-grid div,
.reason-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.detail-grid span,
.reason-panel span,
.json-title {
  display: block;
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.detail-grid strong,
.reason-panel strong {
  color: #0f172a;
  overflow-wrap: anywhere;
}

.json-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  height: 100%;
}

.json-panel pre {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 0.85rem;
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
  color: #334155;
  border: 1px solid #f1f5f9;
}

.reason-panel {
  margin-top: 16px;
}

@media (max-width: 700px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
