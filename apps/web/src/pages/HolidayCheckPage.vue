<template>
  <section class="holiday-check-page">
    <div class="check-heading">
      <div>
        <h1 class="page-title">ตรวจสอบวันหยุด</h1>
        <p class="page-subtitle">ค้นหาและตรวจสอบสถานะวันหยุดจากฐานข้อมูล HOSxP</p>
      </div>
      <v-chip color="secondary" variant="tonal" prepend-icon="mdi-calendar-search" class="d-none d-sm-inline-flex">
        HOSxP API
      </v-chip>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <v-row class="mt-2">
      <!-- ฝั่งซ้าย: ปฏิทินและการเลือก -->
      <v-col cols="12" md="5" lg="4">
        <div class="sticky-top">
          <v-card class="calendar-card mx-auto" elevation="3">
            <div class="calendar-header px-4 py-3 bg-primary text-white d-flex justify-space-between align-center">
              <div>
                <div class="text-caption opacity-80 font-weight-medium">เลือกวันที่ตรวจสอบ</div>
                <div class="text-h6 font-weight-bold">พ.ศ. {{ currentYearBE }}</div>
              </div>
              <v-icon size="28">mdi-calendar-month</v-icon>
            </div>
            <v-card-text class="pa-0 d-flex justify-center">
              <v-date-picker
                v-model="internalDate"
                color="primary"
                hide-header
                show-adjacent-months
                @update:model-value="onDateChanged"
              />
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-3 bg-slate-50 justify-center">
              <v-btn variant="flat" color="primary" size="small" rounded="pill" prepend-icon="mdi-calendar-today" @click="setToday">
                วันนี้
              </v-btn>
              <v-btn variant="tonal" color="secondary" size="small" rounded="pill" prepend-icon="mdi-calendar-arrow-right" @click="setTomorrow">
                พรุ่งนี้
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>

      <!-- ฝั่งขวา: ผลการตรวจสอบและรายการถัดไป -->
      <v-col cols="12" md="7" lg="8">
        <!-- ผลการตรวจสอบ -->
        <v-card v-if="result" class="result-card mb-6" :color="result.cardColor" variant="flat">
          <v-card-text class="d-flex align-center py-6">
            <v-avatar :color="result.iconColor" size="64" class="mr-6 shadow-sm">
              <v-icon :icon="result.icon" size="36" color="white" />
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-overline mb-1 opacity-80">{{ formatThaiDateShort(result.date) }}</div>
              <h2 class="text-h5 font-weight-bold mb-1">{{ result.message }}</h2>
              <div class="d-flex align-center gap-2">
                <template v-if="result.holiday">
                  <span class="text-subtitle-1 font-weight-medium opacity-90">{{ result.holiday.holiday_name }}</span>
                  <v-chip :color="getTypeColor(getDisplayType(result.holiday))" size="x-small" variant="flat">
                    {{ getDisplayType(result.holiday) }}
                  </v-chip>
                </template>
                <span v-else class="text-subtitle-1 opacity-70">เปิดปฏิบัติงานตามปกติ</span>
              </div>
              <div v-if="result.daysDiff !== undefined" class="text-caption mt-2 opacity-70">
                <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                {{ result.daysDiff === 0 ? 'คือวันนี้' : (result.daysDiff > 0 ? `อีก ${result.daysDiff} วันจะถึง` : `ผ่านมาแล้ว ${Math.abs(result.daysDiff)} วัน`) }}
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- รายการวันหยุดที่กำลังจะมาถึง -->
        <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-calendar-star</v-icon>
          วันหยุดที่กำลังจะมาถึง
        </h3>
        <v-card elevation="1">
          <v-list v-if="upcomingHolidays.length > 0" lines="two">
            <v-list-item
              v-for="h in upcomingHolidays"
              :key="h.id"
              @click="selectHoliday(h)"
            >
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="40">
                  <span class="text-caption font-weight-bold">{{ getDayOnly(h.holiday_date) }}</span>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-bold">{{ h.holiday_name }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatThaiDateShort(h.holiday_date) }}</v-list-item-subtitle>

              <template #append>
                <div class="text-right">
                  <v-chip size="x-small" variant="outlined" color="primary" class="mb-1">{{ getDaysUntil(h.holiday_date) }} วัน</v-chip>
                  <div><v-icon size="small" color="grey-lighten-1">mdi-chevron-right</v-icon></div>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center py-8 text-grey">
            <v-icon size="40" class="mb-2">mdi-calendar-blank</v-icon>
            <div>ไม่มีข้อมูลวันหยุดถัดไป</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiErrorMessage } from '../services/api';
import { checkHoliday as checkHolidayApi, getHolidays } from '../services/holiday.service';
import { useHolidayStore } from '../stores/holiday';
import type { Holiday } from '../types/holiday';
import { formatThaiDateShort, currentBeYear, ceToBe } from '../utils/date';
import { guessHolidayType } from '../utils/holidayCategorizer';

type ResultState = {
  date: string;
  message: string;
  cardColor: string;
  iconColor: string;
  icon: string;
  holiday: Holiday | null;
  daysDiff?: number;
};

const holidayStore = useHolidayStore();
const internalDate = ref<Date>(new Date());
const result = ref<ResultState | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const holidays = ref<Holiday[]>([]);

const currentYearBE = computed(() => {
  return internalDate.value ? ceToBe(internalDate.value.getFullYear()) : currentBeYear();
});

const upcomingHolidays = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return holidays.value
    .filter(h => h.holiday_date >= todayStr && h.active !== false)
    .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
    .slice(0, 5);
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
  
  if (t.includes('ราชการ') || t.includes('นักขัตฤกษ์')) return 'teal';
  if (t.includes('ธนาคาร')) return 'indigo';
  if (t.includes('พิเศษ') || t.includes('ประเพณี') || t.includes('ท้องถิ่น')) return 'deep-orange';
  if (t.includes('ชดเชย')) return 'amber-darken-2';
  
  return 'secondary';
}

function getDayOnly(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? parts[2] : '';
}

function getDaysUntil(dateStr: string) {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function onDateChanged(val: any) {
  if (!val) return;
  const d = Array.isArray(val) ? val[0] : val;
  if (!(d instanceof Date) || isNaN(d.getTime())) return;
  
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  checkHoliday(dateStr);
}

function setToday() {
  internalDate.value = new Date();
  onDateChanged(internalDate.value);
}

function setTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  internalDate.value = tomorrow;
  onDateChanged(internalDate.value);
}

function selectHoliday(h: Holiday) {
  if (!h.holiday_date) return;
  const [y, m, d] = h.holiday_date.split('-').map(Number);
  internalDate.value = new Date(y, m - 1, d);
  checkHoliday(h.holiday_date);
}

async function loadHolidays() {
  try {
    const data = await getHolidays({ year: currentBeYear(), mode: 'calendar' });
    holidays.value = data;
  } catch (error) {
    console.error('Failed to load upcoming holidays', error);
  }
}

async function checkHoliday(dateStr: string) {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await checkHolidayApi(dateStr);
    const holiday = response.holiday;
    const daysDiff = getDaysUntil(dateStr);

    if (response.status === 'active' && holiday) {
      result.value = {
        date: dateStr,
        message: 'เป็นวันหยุด',
        cardColor: 'teal-lighten-5',
        iconColor: 'teal',
        icon: 'mdi-emoticon-happy',
        holiday,
        daysDiff
      };
    } else if (response.status === 'inactive' && holiday) {
      result.value = {
        date: dateStr,
        message: 'เป็นวันทำงานปกติ',
        cardColor: 'blue-lighten-5',
        iconColor: 'blue',
        icon: 'mdi-briefcase-check',
        holiday,
        daysDiff
      };
    } else {
      result.value = {
        date: dateStr,
        message: 'เป็นวันทำงานปกติ',
        cardColor: 'blue-lighten-5',
        iconColor: 'blue',
        icon: 'mdi-briefcase-check',
        holiday: null,
        daysDiff
      };
    }
  } catch (error) {
    result.value = null;
    errorMessage.value = apiErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadHolidays();
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await checkHoliday(dateStr);
});
</script>

<style scoped>
.holiday-check-page {
  max-width: 1200px;
  margin: 0 auto;
}

.check-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.calendar-card {
  max-width: 350px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.sticky-top {
  position: sticky;
  top: 24px;
}

.calendar-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.shadow-sm {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }
.opacity-70 { opacity: 0.7; }

@media (max-width: 960px) {
  .sticky-top {
    position: static;
    margin-bottom: 24px;
  }
  .calendar-card {
    max-width: 100%;
  }
}
</style>
