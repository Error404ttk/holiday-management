<template>
  <section>
    <div class="holiday-heading">
      <div>
        <h1 class="page-title">รายการวันหยุด [{{ selectedYear }}]</h1>
        <p class="page-subtitle">
          {{ yearMode === 'fiscal' ? 'ปีงบประมาณ' : 'ปีปฏิทิน' }} {{ selectedYear }} ({{ formatThaiDate(range.startDate) }} - {{ formatThaiDate(range.endDate) }})
        </p>
      </div>
      <div class="d-flex align-center gap-3">
        <v-btn v-if="canCreate" color="secondary" prepend-icon="mdi-plus" to="/holidays/create" elevation="1">
          เพิ่มวันหยุดใหม่
        </v-btn>
        <v-chip color="secondary" variant="tonal" prepend-icon="mdi-database-check" class="d-none d-sm-inline-flex">
          HOSxP API
        </v-chip>
      </div>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-card class="filter-card">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              label="ปี พ.ศ."
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="yearMode"
              :items="yearModeOptions"
              item-title="title"
              item-value="value"
              label="มุมมองวันที่"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedMonth"
              :items="monthOptions"
              item-title="title"
              item-value="value"
              label="เดือน"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.trim="search"
              label="ค้นหาชื่อวันหยุด"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn block variant="tonal" color="grey-darken-1" prepend-icon="mdi-filter-variant-remove" @click="resetFilters">
              ล้างตัวกรอง
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div class="summary-bar mt-4 mb-2 d-flex align-center">
      <v-icon size="small" color="primary" class="mr-2">mdi-information-outline</v-icon>
      <span class="text-caption text-grey-darken-1">
        พบวันหยุดทั้งหมด <strong>{{ filteredHolidays.length }}</strong> รายการ
      </span>
    </div>

    <v-card>
      <v-data-table
        :headers="visibleHeaders"
        :items="filteredHolidays"
        :loading="loading"
        :items-per-page="15"
        item-value="id"
        class="holiday-table"
        hover
        :sort-by="[{ key: 'holiday_date', order: 'asc' }]"
      >
        <template #item.holiday_date="{ item }">
          <div class="font-weight-medium">{{ formatThaiDate(item.holiday_date) }}</div>
        </template>

        <template #item.holiday_name="{ item }">
          <div class="text-body-2">{{ item.holiday_name }}</div>
          <div v-if="item.note" class="text-caption text-grey">{{ item.note }}</div>
        </template>

        <template #item.holiday_type="{ item }">
          <v-chip
            :color="getTypeColor(getDisplayType(item))"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getDisplayType(item) }}
          </v-chip>
        </template>

        <template #item.active="{ item }">
          <v-chip
            :color="item.active === false ? 'grey-lighten-1' : 'success'"
            size="x-small"
            variant="tonal"
            class="px-2"
          >
            <v-icon 
              start 
              size="10" 
              :icon="item.active === false ? 'mdi-minus-circle' : 'mdi-check-circle'" 
            />
            {{ item.active === false ? 'ปิดใช้งาน' : 'ใช้งาน' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="action-buttons">
            <v-tooltip text="ดูรายละเอียด" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-eye-outline" variant="text" size="small" @click="openPreview(item)" />
              </template>
            </v-tooltip>
            
            <v-tooltip v-if="canUpdate" text="แก้ไข" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" color="primary" :to="`/holidays/${item.id}/edit`" />
              </template>
            </v-tooltip>

            <v-tooltip v-if="canDisable && item.active === true" text="ปิดใช้งาน" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-power"
                  color="warning"
                  variant="text"
                  size="small"
                  :disabled="statusSaving"
                  @click="openDisableDialog(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="empty-state py-8">
            <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-calendar-search</v-icon>
            <div>ไม่พบรายการวันหยุดตามเงื่อนไขที่เลือก</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="previewDialog" max-width="520">
      <v-card v-if="selectedHoliday">
        <v-card-title class="d-flex align-center">
          <span>รายละเอียดวันหยุด</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="previewDialog = false" />
        </v-card-title>
        <v-card-text class="pt-2">
          <div class="preview-row">
            <span>วันที่</span>
            <strong>{{ formatThaiDate(selectedHoliday.holiday_date) }}</strong>
          </div>
          <div class="preview-row">
            <span>ชื่อวันหยุด</span>
            <strong>{{ selectedHoliday.holiday_name }}</strong>
          </div>
          <div v-if="schemaConfig?.typeColumnSupported" class="preview-row">
            <span>ประเภท</span>
            <v-chip :color="getTypeColor(selectedHoliday.holiday_type)" size="x-small" variant="flat">
              {{ selectedHoliday.holiday_type || 'ทั่วไป' }}
            </v-chip>
          </div>
          <div v-if="schemaConfig?.activeColumnSupported" class="preview-row">
            <span>สถานะ</span>
            <v-chip
              v-if="typeof selectedHoliday.active === 'boolean'"
              :color="selectedHoliday.active ? 'success' : 'grey-lighten-1'"
              size="x-small"
              variant="tonal"
            >
              {{ selectedHoliday.active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
            </v-chip>
          </div>
          <div v-if="selectedHoliday.note" class="preview-row flex-column align-start border-0">
            <span class="mb-1">หมายเหตุ</span>
            <div class="text-body-2 text-grey-darken-3">{{ selectedHoliday.note }}</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="previewDialog = false">ปิดหน้าต่าง</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="disableDialog" max-width="520">
      <v-card v-if="disableTarget">
        <v-card-title>ยืนยันการปิดใช้งาน</v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            ระบบจะไม่ลบข้อมูลจริง และจะบันทึก audit log ทุกครั้ง
          </v-alert>
          <div class="preview-row">
            <span>วันที่</span>
            <strong>{{ formatThaiDate(disableTarget.holiday_date) }}</strong>
          </div>
          <div class="preview-row">
            <span>ชื่อวันหยุด</span>
            <strong>{{ disableTarget.holiday_name }}</strong>
          </div>
          <v-textarea
            v-model.trim="disableReason"
            label="เหตุผลในการปิดใช้งาน"
            rows="3"
            auto-grow
            class="mt-4"
            :error-messages="disableReasonError"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="statusSaving" @click="disableDialog = false">ยกเลิก</v-btn>
          <v-btn color="warning" variant="flat" :loading="statusSaving" @click="confirmDisableHoliday">
            ปิดใช้งาน
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="1800">
      {{ snackbarMessage }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { apiErrorMessage } from '../services/api';
import { hasPermission } from '../services/auth.service';
import { useHolidayStore } from '../stores/holiday';
import { filterHolidaysByKeyword, getHolidayYearRange, updateHolidayStatus, getHolidaySchemaConfig, type HolidaySchemaConfig } from '../services/holiday.service';
import type { Holiday, YearMode } from '../types/holiday';
import { formatThaiDate, currentBeYear, ceToBe } from '../utils/date';
import { guessHolidayType } from '../utils/holidayCategorizer';

const holidayStore = useHolidayStore();
const currentYear = currentBeYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const yearModeOptions = [
  { title: 'ปีปฏิทิน', value: 'calendar' },
  { title: 'ปีงบประมาณ', value: 'fiscal' }
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const monthOptions = [
  { title: 'ทุกเดือน', value: 0 },
  ...THAI_MONTHS.map((name, i) => ({ title: name, value: i + 1 }))
];

const allHeaders = [
  { title: 'วันที่', key: 'holiday_date', sortable: true, width: '130px' },
  { title: 'ชื่อวันหยุด', key: 'holiday_name', sortable: true, minWidth: '220px' },
  { title: 'ประเภท', key: 'holiday_type', sortable: true, width: '120px' },
  { title: 'สถานะ', key: 'active', sortable: true, width: '110px' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const, width: '130px' }
];

const selectedYear = ref(currentBeYear());
const yearMode = ref<YearMode>('calendar');
const selectedMonth = ref(0);
const search = ref('');
const errorMessage = ref('');
const loading = computed(() => holidayStore.loading);
const holidays = computed(() => holidayStore.holidays);
const schemaConfig = ref<HolidaySchemaConfig | null>(null);

const previewDialog = ref(false);
const selectedHoliday = ref<Holiday | null>(null);
const disableDialog = ref(false);
const disableTarget = ref<Holiday | null>(null);
const disableReason = ref('');
const disableReasonError = ref('');
const statusSaving = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error'>('success');
const canCreate = computed(() => hasPermission('holiday.create'));
const canUpdate = computed(() => hasPermission('holiday.update'));
const canDisable = computed(() => hasPermission('holiday.disable'));

const range = computed(() => getHolidayYearRange(selectedYear.value, yearMode.value));

const visibleHeaders = computed(() => {
  // Always show all headers as per mockup to keep UI consistent
  // We handle the "Unsupported" state within the cell templates instead
  return allHeaders;
});

const filteredHolidays = computed(() => {
  let result = holidays.value;
  if (selectedMonth.value > 0) {
    const monthStr = String(selectedMonth.value).padStart(2, '0');
    result = result.filter((h) => {
      const date = h.holiday_date || '';
      const datePart = date.slice(0, 10);
      return datePart.split('-')[1] === monthStr;
    });
  }
  return filterHolidaysByKeyword(result, search.value);
});

function getDisplayType(item: Holiday): string {
  if (item.holiday_type && item.holiday_type.trim()) {
    return item.holiday_type;
  }
  return guessHolidayType(item.holiday_name) || 'วันหยุดทั่วไป';
}

function getTypeColor(type: string | undefined): string {
  if (!type) return 'blue-grey-lighten-2';
  const t = String(type).trim();
  
  // วันหยุดราชการ / นักขัตฤกษ์
  if (t.includes('ราชการ') || t.includes('นักขัตฤกษ์')) return 'teal';
  
  // วันหยุดธนาคาร
  if (t.includes('ธนาคาร')) return 'indigo';
  
  // วันหยุดพิเศษ / ประเพณี / ท้องถิ่น
  if (t.includes('พิเศษ') || t.includes('ประเพณี') || t.includes('ท้องถิ่น')) return 'deep-orange';
  
  // วันหยุดชดเชย
  if (t.includes('ชดเชย')) return 'amber-darken-2';
  
  return 'secondary';
}

async function loadInitialData() {
  errorMessage.value = '';
  try {
    // Only load schema if not already loaded to reduce redundant requests
    if (!schemaConfig.value) {
      schemaConfig.value = await getHolidaySchemaConfig();
    }
    await loadHolidays();
  } catch (error) {
    errorMessage.value = apiErrorMessage(error);
    console.error('Failed to load initial data', error);
  }
}

async function loadHolidays() {
  errorMessage.value = '';
  try {
    await holidayStore.fetchHolidays(selectedYear.value, yearMode.value);
  } catch (error) {
    errorMessage.value = apiErrorMessage(error);
  }
}

function resetFilters() {
  selectedYear.value = currentBeYear();
  yearMode.value = 'calendar';
  selectedMonth.value = 0;
  search.value = '';
}

function openPreview(holiday: Holiday) {
  selectedHoliday.value = holiday;
  previewDialog.value = true;
}

function showSnackbar(message: string, color: 'success' | 'error' = 'success') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

function openDisableDialog(holiday: Holiday) {
  disableTarget.value = holiday;
  disableReason.value = '';
  disableReasonError.value = '';
  disableDialog.value = true;
}

async function confirmDisableHoliday() {
  if (!disableTarget.value) return;
  if (!disableReason.value.trim()) {
    disableReasonError.value = 'กรุณาระบุเหตุผลในการปิดใช้งาน';
    return;
  }

  statusSaving.value = true;
  disableReasonError.value = '';
  try {
    await updateHolidayStatus(disableTarget.value.id, false, disableReason.value);
    disableDialog.value = false;
    showSnackbar('ปิดใช้งานวันหยุดสำเร็จ');
    await holidayStore.fetchHolidays(selectedYear.value, yearMode.value, true);
  } catch (error) {
    const message = apiErrorMessage(error);
    errorMessage.value = message;
    showSnackbar(message, 'error');
  } finally {
    statusSaving.value = false;
  }
}

onMounted(loadInitialData);
watch([selectedYear, yearMode], loadHolidays);
</script>

<style scoped>
.holiday-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
}

.filter-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.holiday-table {
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.summary-bar {
  padding-left: 4px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.preview-row span {
  color: #64748b;
  font-size: 0.9rem;
}

.preview-row strong {
  color: #0f172a;
  text-align: right;
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .holiday-heading {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .holiday-heading > div:last-child {
    width: 100%;
  }

  .holiday-heading .v-btn {
    flex-grow: 1;
  }

  .preview-row {
    flex-direction: column;
    gap: 4px;
  }

  .preview-row strong {
    text-align: left;
  }
}
</style>
