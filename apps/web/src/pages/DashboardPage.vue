<template>
  <section class="dashboard-page pb-10">
    <!-- Header Section -->
    <div class="dashboard-header mb-8">
      <div class="d-flex align-center gap-3 mb-1">
        <v-icon icon="mdi-view-dashboard-outline" color="primary" size="32" />
        <h1 class="text-h4 font-weight-bold text-slate-900 mb-0">Dashboard [{{ year }}]</h1>
      </div>
      <p class="text-body-1 text-slate-500 mb-0">
        ภาพรวมข้อมูลวันหยุดในระบบ HOSxP ประจำปีปฏิทิน {{ year }}
      </p>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6 rounded-xl border">
      {{ errorMessage }}
    </v-alert>

    <!-- KPI Section -->
    <v-row class="mb-6">
      <v-col v-for="item in kpis" :key="item.label" cols="12" sm="6" lg="4">
        <v-card class="kpi-card-v2 overflow-hidden" :loading="loading">
          <div class="kpi-accent-line" :class="item.accentClass"></div>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-4">
              <div class="kpi-icon-box" :class="item.colorClass">
                <v-icon :icon="item.icon" size="24" />
              </div>
              <v-chip size="x-small" variant="tonal" :color="item.chipColor" class="font-weight-bold">
                {{ item.tag }}
              </v-chip>
            </div>
            <div class="kpi-label-v2">{{ item.label }}</div>
            <div class="kpi-value-v2" :class="{ 'text-slate-300': item.value === '-' }">
              {{ item.value }}
            </div>
            <div class="kpi-note-v2 d-flex align-center gap-1">
              <v-icon :icon="item.value === '-' ? 'mdi-alert-circle-outline' : 'mdi-information-outline'" size="14" />
              {{ item.note }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Grid -->
    <v-row>
      <v-col cols="12">
        <v-card class="main-panel rounded-xl">
          <div class="panel-toolbar d-flex align-center justify-space-between pa-5 border-b">
            <div class="d-flex align-center gap-3">
              <div class="toolbar-icon-bg">
                <v-icon icon="mdi-calendar-month" color="teal-darken-2" />
              </div>
              <div>
                <div class="text-h6 font-weight-bold text-slate-800 line-height-1">ปฏิทินวันหยุดรายเดือน</div>
                <div class="text-caption text-slate-500 font-weight-medium">แสดงปฏิทินวันหยุดประจำปี พ.ศ. {{ year }}</div>
              </div>
            </div>
            
            <div class="month-selector d-flex align-center bg-slate-50 rounded-pill pa-1 border">
              <v-btn icon="mdi-chevron-left" variant="text" size="small" rounded="pill" @click="prevMonth" />
              <div class="mx-4 text-body-2 font-weight-bold text-teal-darken-3 min-w-140 text-center">
                {{ currentMonthName }}
              </div>
              <v-btn icon="mdi-chevron-right" variant="text" size="small" rounded="pill" @click="nextMonth" />
              <v-divider vertical class="mx-2 my-2" />
              <v-btn variant="text" color="teal-darken-1" size="small" class="px-4 font-weight-bold" @click="resetToCurrentMonth">วันนี้</v-btn>
            </div>
          </div>

          <v-card-text class="pa-6">
            <v-row>
              <!-- Calendar Area -->
              <v-col cols="12" lg="8">
                <div class="calendar-container">
                  <div class="calendar-week-labels">
                    <div v-for="day in THAI_SHORT_WEEKDAYS" :key="day" class="week-label" :class="{ 'weekend-label': day === 'อา.' || day === 'ส.' }">
                      {{ day }}
                    </div>
                  </div>

                  <div class="calendar-main-grid">
                    <div 
                      v-for="(cell, index) in calendarGrid" 
                      :key="index" 
                      class="grid-cell"
                      :class="{ 
                        'is-other': !cell.isCurrentMonth,
                        'is-weekend': cell.isWeekend,
                        'has-holiday': cell.isHoliday,
                        [`type-${cell.holidayType}`]: cell.isHoliday,
                        'is-today': cell.isToday
                      }"
                    >
                      <div class="cell-top">
                        <span class="cell-day">{{ cell.dayNumber }}</span>
                        <v-icon v-if="cell.isHoliday" size="14" class="holiday-icon" :icon="getHolidayIcon(cell.holidayType)" />
                      </div>
                      <div v-if="cell.isHoliday" class="cell-name-v2" :title="cell.holidayName">
                        {{ cell.holidayName }}
                      </div>
                      <div v-if="cell.isToday && !cell.isHoliday" class="today-marker"></div>
                    </div>
                  </div>
                </div>

                <!-- Color Legends -->
                <div class="d-flex align-center flex-wrap gap-4 mt-6 pt-6 border-t">
                  <div class="legend-pill shadow-sm">
                    <span class="dot gov"></span> <span class="ms-1">วันหยุดราชการ</span>
                  </div>
                  <div class="legend-pill shadow-sm">
                    <span class="dot rel"></span> <span class="ms-1">นักขัตฤกษ์/ศาสนา</span>
                  </div>
                  <div class="legend-pill shadow-sm">
                    <span class="dot spec"></span> <span class="ms-1">วันหยุดพิเศษ/ชดเชย</span>
                  </div>
                  <div class="legend-pill shadow-sm border-teal-lighten-2 border">
                    <span class="dot today"></span> <span class="ms-1">วันปัจจุบัน</span>
                  </div>
                </div>
              </v-col>

              <!-- Sidebar Area -->
              <v-col cols="12" lg="4">
                <div class="detail-sidebar bg-slate-50 rounded-xl pa-5 h-100 border">
                  <div class="d-flex align-center justify-space-between mb-5">
                    <div class="text-subtitle-1 font-weight-bold text-slate-700">เร็วๆ นี้</div>
                    <v-chip size="x-small" color="primary" variant="flat" class="text-white font-weight-bold">
                      Upcoming
                    </v-chip>
                  </div>

                  <div v-if="upcomingHolidays.length" class="holiday-mini-list scrollable-area">
                    <v-hover v-for="h in upcomingHolidays" :key="h.id" v-slot="{ isHovering, props }">
                      <div 
                        v-bind="props"
                        class="mini-holiday-card shadow-sm"
                        :class="[h.type, { 'elevation-3': isHovering }]"
                        @click="$router.push(`/holidays/${h.id}/edit`)"
                        style="cursor: pointer"
                      >
                        <div class="d-flex justify-space-between mb-1">
                          <span class="text-caption font-weight-bold text-teal-darken-2">{{ formatThaiDate(h.holiday_date) }}</span>
                          <span class="text-caption-2">{{ getHolidayTypeText(h.type) }}</span>
                        </div>
                        <div class="text-body-2 font-weight-bold text-slate-800">{{ h.holiday_name }}</div>
                        <div class="text-caption text-blue-darken-2 mt-1 font-weight-bold">
                          อีก {{ getDaysUntil(h.holiday_date) }} วันจะถึง
                        </div>
                      </div>
                    </v-hover>
                  </div>
                  
                  <div v-else class="empty-sidebar d-flex flex-column align-center justify-center py-10 text-center">
                    <v-icon icon="mdi-calendar-blank" size="48" color="slate-lighten-4" />
                    <div class="text-body-2 font-weight-bold text-slate-400 mt-2">ไม่มีวันหยุดเร็วๆ นี้</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { apiErrorMessage } from '../services/api';
import { useHolidayStore } from '../stores/holiday';
import type { Holiday } from '../types/holiday';
import { currentBeYear, formatThaiDate, getTodayString } from '../utils/date';

const holidayStore = useHolidayStore();
const year = ref(currentBeYear());
const errorMessage = ref('');

const loading = computed(() => holidayStore.loading);
const holidays = computed(() => holidayStore.holidays);

const calendarDate = ref(new Date());

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];
const THAI_SHORT_WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const currentMonthName = computed(() => {
  const m = calendarDate.value.getMonth();
  const y = calendarDate.value.getFullYear() + 543;
  return `${THAI_MONTHS[m]} ${y}`;
});

function getDaysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function isWeeklyWeekend(name: string): boolean {
  if (!name) return false;
  const n = name.trim();
  return (
    n === 'วันเสาร์' || n === 'วันอาทิตย์' || n === 'วันเสาร์-อาทิตย์' ||
    n === 'เสาร์' || n === 'อาทิตย์' || n.includes('หยุดประจำสัปดาห์')
  );
}

const activeHolidays = computed(() => 
  holidays.value.filter((h) => h.active !== false && !isWeeklyWeekend(h.holiday_name))
);

const upcomingHolidays = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return holidays.value
    .filter(h => h.holiday_date >= todayStr && h.active !== false && !isWeeklyWeekend(h.holiday_name))
    .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
    .slice(0, 5)
    .map(h => ({
      ...h,
      type: classifyHolidayType(h.holiday_name)
    }));
});

const nextHoliday = computed(() => upcomingHolidays.value[0] || null);

const kpis = computed(() => {
  let nextValue = '-';
  let nextNote = 'ไม่มีรายการใกล้ถึง';
  
  if (nextHoliday.value) {
    const dStr = nextHoliday.value.holiday_date;
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2]);
      const monthIdx = parseInt(parts[1]) - 1;
      const daysLeft = getDaysUntil(dStr);
      nextValue = `${day} ${THAI_MONTHS_SHORT[monthIdx] || ''}`;
      nextNote = daysLeft === 0 ? 'คือวันนี้' : `อีก ${daysLeft} วันจะถึง (${nextHoliday.value.holiday_name})`;
    }
  }

  const govCount = activeHolidays.value.filter(h => classifyHolidayType(h.holiday_name) === 'government').length;
  const specCount = activeHolidays.value.filter(h => classifyHolidayType(h.holiday_name) === 'special').length;

  return [
    {
      label: 'วันหยุดราชการปีนี้',
      value: `${govCount} วัน`,
      note: `ประกาศตามปฏิทินหลวง`,
      icon: 'mdi-bank',
      colorClass: 'kpi-icon-teal',
      accentClass: 'bg-teal',
      chipColor: 'teal',
      tag: 'หลัก'
    },
    {
      label: 'วันหยุดถัดไป',
      value: nextValue,
      note: nextNote,
      icon: 'mdi-clock-fast',
      colorClass: 'kpi-icon-blue',
      accentClass: 'bg-blue',
      chipColor: 'blue',
      tag: 'เร็วๆ นี้'
    },
    {
      label: 'วันหยุดพิเศษ/ชดเชย',
      value: `${specCount} วัน`,
      note: `ตามประกาศ ครม. เพิ่มเติม`,
      icon: 'mdi-calendar-star',
      colorClass: 'kpi-icon-indigo',
      accentClass: 'bg-indigo',
      chipColor: 'indigo',
      tag: 'พิเศษ'
    }
  ];
});

function classifyHolidayType(name: string): 'government' | 'religious' | 'special' | 'standard' {
  if (!name) return 'standard';
  const n = name.trim();
  if (n.includes('เฉลิมพระชนมพรรษา') || n.includes('วันชาติ') || n.includes('สวรรคต') || n.includes('จักรี') || n.includes('ปิยมหาราช')) return 'government';
  if (n.includes('บูชา') || n.includes('พรรษา') || n.includes('สงกรานต์') || n.includes('ปีใหม่')) return 'religious';
  if (n.includes('ชดเชย') || n.includes('พิเศษ') || n.includes('กรณีพิเศษ')) return 'special';
  return 'government';
}

function getHolidayIcon(type: string): string {
  switch (type) {
    case 'religious': return 'mdi-flower-tulip';
    case 'special': return 'mdi-calendar-star';
    default: return 'mdi-bank';
  }
}

function getHolidayTypeText(type: string): string {
  switch (type) {
    case 'religious': return 'นักขัตฤกษ์';
    case 'special': return 'วันหยุดพิเศษ';
    default: return 'วันหยุดราชการ';
  }
}

function getHolidayDescription(name: string): string {
  if (!name) return '';
  if (name.includes('จักรี')) return 'วันระลึกมหาจักรีบรมราชวงศ์';
  if (name.includes('สงกรานต์')) return 'ประเพณีปีใหม่ไทย';
  if (name.includes('ชดเชย')) return 'วันหยุดชดเชยตามประกาศ ครม.';
  return 'วันหยุดราชการประจำปี';
}

const calendarGrid = computed(() => {
  const targetDate = calendarDate.value;
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const firstDay = new Date(y, m, 1);
  const startDayOfWeek = firstDay.getDay(); 
  const totalDays = new Date(y, m + 1, 0).getDate();
  
  const createCell = (cellYear: number, cellMonth: number, cellDay: number, isCurrent: boolean) => {
    const d = new Date(cellYear, cellMonth, cellDay);
    const dateStr = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(cellDay).padStart(2, '0')}`;
    const todayString = getTodayString();
    const matchedHoliday = holidays.value.find((h) => h.holiday_date.startsWith(dateStr) && h.active !== false && !isWeeklyWeekend(h.holiday_name));

    return {
      dateString: dateStr,
      dayNumber: cellDay,
      isCurrentMonth: isCurrent,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isHoliday: !!matchedHoliday,
      holidayName: matchedHoliday ? matchedHoliday.holiday_name : '',
      holidayType: matchedHoliday ? classifyHolidayType(matchedHoliday.holiday_name) : 'standard',
      isToday: dateStr === todayString
    };
  };

  const cells = [];
  const prevMonthLastDate = new Date(y, m, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const pMonth = m === 0 ? 11 : m - 1;
    const pYear = m === 0 ? y - 1 : y;
    cells.push(createCell(pYear, pMonth, prevMonthLastDate - i, false));
  }
  for (let i = 1; i <= totalDays; i++) {
    cells.push(createCell(y, m, i, true));
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nMonth = m === 11 ? 0 : m + 1;
    const nYear = m === 11 ? y + 1 : y;
    cells.push(createCell(nYear, nMonth, i, false));
  }
  return cells;
});

const holidaysInViewMonth = computed(() => {
  const y = calendarDate.value.getFullYear();
  const m = calendarDate.value.getMonth();
  const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
  return holidays.value
    .filter((h) => h.holiday_date.startsWith(monthPrefix) && h.active !== false && !isWeeklyWeekend(h.holiday_name))
    .map((h) => ({
      ...h,
      type: classifyHolidayType(h.holiday_name),
      desc: h.note || getHolidayDescription(h.holiday_name)
    }))
    .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));
});

watch(() => holidayStore.error, (newError) => {
  if (newError) errorMessage.value = newError;
});

async function prevMonth() {
  const d = new Date(calendarDate.value);
  d.setMonth(d.getMonth() - 1);
  calendarDate.value = d;
  const beYear = d.getFullYear() + 543;
  if (beYear !== year.value) {
    year.value = beYear;
    try {
      await holidayStore.fetchHolidays(beYear, 'calendar');
    } catch (error) {
      errorMessage.value = apiErrorMessage(error);
    }
  }
}

async function nextMonth() {
  const d = new Date(calendarDate.value);
  d.setMonth(d.getMonth() + 1);
  calendarDate.value = d;
  const beYear = d.getFullYear() + 543;
  if (beYear !== year.value) {
    year.value = beYear;
    try {
      await holidayStore.fetchHolidays(beYear, 'calendar');
    } catch (error) {
      errorMessage.value = apiErrorMessage(error);
    }
  }
}

async function resetToCurrentMonth() {
  calendarDate.value = new Date();
  const currentBe = currentBeYear();
  if (currentBe !== year.value) {
    year.value = currentBe;
    try {
      await holidayStore.fetchHolidays(currentBe, 'calendar');
    } catch (error) {
      errorMessage.value = apiErrorMessage(error);
    }
  }
}

async function initDashboard() {
  errorMessage.value = '';
  try {
    await holidayStore.fetchHolidays(year.value, 'calendar');
  } catch (error) {
    errorMessage.value = apiErrorMessage(error);
  }
}

onMounted(initDashboard);
</script>

<style scoped>
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.min-w-140 { min-width: 160px; }
.line-height-1 { line-height: 1.2; }

.kpi-card-v2 {
  position: relative;
  background: white !important;
  border-radius: 20px !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 4px 15px -1px rgba(0, 0, 0, 0.02) !important;
  transition: all 0.3s ease;
}

.kpi-card-v2:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px -5px rgba(15, 118, 110, 0.1) !important;
}

.kpi-accent-line { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.kpi-icon-box { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; color: white; }
.kpi-icon-teal { background: linear-gradient(135deg, #0d9488, #0f766e); }
.kpi-icon-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.kpi-icon-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.kpi-icon-green { background: linear-gradient(135deg, #22c55e, #16a34a); }

.kpi-label-v2 { font-size: 0.875rem; color: #64748b; font-weight: 600; margin-bottom: 2px; }
.kpi-value-v2 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.kpi-note-v2 { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

.main-panel, .side-panel { background: white !important; border: 1px solid rgba(0,0,0,0.05) !important; }
.toolbar-icon-bg { width: 40px; height: 40px; background: #f0fdfa; border-radius: 10px; display: grid; place-items: center; }

/* Calendar Grid Fixed */
.calendar-main-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(85px, 1fr); 
  gap: 10px;
}

.grid-cell {
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 10px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.grid-cell:hover:not(.is-other) {
  border-color: #0d9488;
  background: white;
  transform: translateY(-2px);
  z-index: 10;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.calendar-week-labels { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 12px; }
.week-label { text-align: center; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.weekend-label { color: #f43f5e; }

.grid-cell.is-other { opacity: 0.3; background: transparent; border: 1px dashed #e2e8f0; }
.grid-cell.is-weekend:not(.has-holiday) { background: #fff1f2; border-color: #fecdd3; }
.grid-cell.is-weekend .cell-day { color: #e11d48; }

.grid-cell.is-today {
  border: 2px solid #0d9488 !important;
  background: white !important;
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
  z-index: 5;
}

.today-marker { position: absolute; bottom: 8px; right: 8px; width: 6px; height: 6px; background: #0d9488; border-radius: 50%; }

.cell-top { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 4px; }
.cell-day { font-size: 1rem; font-weight: 700; color: #1e293b; }

.cell-name-v2 {
  font-size: 0.65rem;
  font-weight: 800;
  margin-top: auto;
  line-height: 1.3;
  padding: 4px 6px;
  border-radius: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  width: 100%;
}

.type-government { border-top: 4px solid #3b82f6 !important; background: white; }
.type-religious { border-top: 4px solid #10b981 !important; background: white; }
.type-special { border-top: 4px solid #f59e0b !important; background: white; }

.type-government .cell-name-v2 { background: #eff6ff; color: #1e40af; }
.type-religious .cell-name-v2 { background: #ecfdf5; color: #065f46; }
.type-special .cell-name-v2 { background: #fffbeb; color: #92400e; }

.holiday-icon { opacity: 0.8; }
.type-government .holiday-icon { color: #3b82f6; }
.type-religious .holiday-icon { color: #10b981; }
.type-special .holiday-icon { color: #f59e0b; }

.legend-pill { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; color: #475569; background: white; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.gov { background: #3b82f6; }
.dot.rel { background: #10b981; }
.dot.spec { background: #f59e0b; }
.dot.today { border: 2px solid #0d9488; background: transparent; }

@media (max-width: 960px) {
  .grid-cell { min-height: 65px; padding: 4px; border-radius: 10px; }
  .cell-name-v2 { display: none; }
  .calendar-main-grid { gap: 6px; }
}

.mini-holiday-card { background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 12px; border-left: 5px solid transparent; transition: all 0.2s ease; }
.mini-holiday-card.government { border-left-color: #3b82f6; }
.mini-holiday-card.religious { border-left-color: #10b981; }
.mini-holiday-card.special { border-left-color: #f59e0b; }
.scrollable-area { max-height: 550px; overflow-y: auto; padding-right: 8px; }
</style>
