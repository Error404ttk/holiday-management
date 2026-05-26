import { computed, onMounted, ref, watch } from 'vue';
import { apiErrorMessage } from '../services/api';
import { useHolidayStore } from '../stores/holiday';
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
function getDaysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
function isWeeklyWeekend(name) {
    if (!name)
        return false;
    const n = name.trim();
    return (n === 'วันเสาร์' || n === 'วันอาทิตย์' || n === 'วันเสาร์-อาทิตย์' ||
        n === 'เสาร์' || n === 'อาทิตย์' || n.includes('หยุดประจำสัปดาห์'));
}
const activeHolidays = computed(() => holidays.value.filter((h) => h.active !== false && !isWeeklyWeekend(h.holiday_name)));
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
function classifyHolidayType(name) {
    if (!name)
        return 'standard';
    const n = name.trim();
    if (n.includes('เฉลิมพระชนมพรรษา') || n.includes('วันชาติ') || n.includes('สวรรคต') || n.includes('จักรี') || n.includes('ปิยมหาราช'))
        return 'government';
    if (n.includes('บูชา') || n.includes('พรรษา') || n.includes('สงกรานต์') || n.includes('ปีใหม่'))
        return 'religious';
    if (n.includes('ชดเชย') || n.includes('พิเศษ') || n.includes('กรณีพิเศษ'))
        return 'special';
    return 'government';
}
function getHolidayIcon(type) {
    switch (type) {
        case 'religious': return 'mdi-flower-tulip';
        case 'special': return 'mdi-calendar-star';
        default: return 'mdi-bank';
    }
}
function getHolidayTypeText(type) {
    switch (type) {
        case 'religious': return 'นักขัตฤกษ์';
        case 'special': return 'วันหยุดพิเศษ';
        default: return 'วันหยุดราชการ';
    }
}
function getHolidayDescription(name) {
    if (!name)
        return '';
    if (name.includes('จักรี'))
        return 'วันระลึกมหาจักรีบรมราชวงศ์';
    if (name.includes('สงกรานต์'))
        return 'ประเพณีปีใหม่ไทย';
    if (name.includes('ชดเชย'))
        return 'วันหยุดชดเชยตามประกาศ ครม.';
    return 'วันหยุดราชการประจำปี';
}
const calendarGrid = computed(() => {
    const targetDate = calendarDate.value;
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const createCell = (cellYear, cellMonth, cellDay, isCurrent) => {
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
    if (newError)
        errorMessage.value = newError;
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            errorMessage.value = apiErrorMessage(error);
        }
    }
}
async function initDashboard() {
    errorMessage.value = '';
    try {
        await holidayStore.fetchHolidays(year.value, 'calendar');
    }
    catch (error) {
        errorMessage.value = apiErrorMessage(error);
    }
}
onMounted(initDashboard);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['kpi-card-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['is-other']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['is-weekend']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-day']} */ ;
/** @type {__VLS_StyleScopedClasses['type-government']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-name-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['type-religious']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-name-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['type-special']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-name-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['type-government']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['type-religious']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['type-special']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-name-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-holiday-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-holiday-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-holiday-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "dashboard-page pb-10" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard-header mb-8" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center gap-3 mb-1" },
});
const __VLS_0 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    icon: "mdi-view-dashboard-outline",
    color: "primary",
    size: "32",
}));
const __VLS_2 = __VLS_1({
    icon: "mdi-view-dashboard-outline",
    color: "primary",
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "text-h4 font-weight-bold text-slate-900 mb-0" },
});
(__VLS_ctx.year);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-body-1 text-slate-500 mb-0" },
});
(__VLS_ctx.year);
if (__VLS_ctx.errorMessage) {
    const __VLS_4 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-6 rounded-xl border" },
    }));
    const __VLS_6 = __VLS_5({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-6 rounded-xl border" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_7;
}
const __VLS_8 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "mb-6" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "mb-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.kpis))) {
    const __VLS_12 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        key: (item.label),
        cols: "12",
        sm: "6",
        lg: "4",
    }));
    const __VLS_14 = __VLS_13({
        key: (item.label),
        cols: "12",
        sm: "6",
        lg: "4",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ class: "kpi-card-v2 overflow-hidden" },
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "kpi-card-v2 overflow-hidden" },
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kpi-accent-line" },
        ...{ class: (item.accentClass) },
    });
    const __VLS_20 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ class: "pa-5" },
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "pa-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "d-flex justify-space-between align-start mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kpi-icon-box" },
        ...{ class: (item.colorClass) },
    });
    const __VLS_24 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        icon: (item.icon),
        size: "24",
    }));
    const __VLS_26 = __VLS_25({
        icon: (item.icon),
        size: "24",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        size: "x-small",
        variant: "tonal",
        color: (item.chipColor),
        ...{ class: "font-weight-bold" },
    }));
    const __VLS_30 = __VLS_29({
        size: "x-small",
        variant: "tonal",
        color: (item.chipColor),
        ...{ class: "font-weight-bold" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (item.tag);
    var __VLS_31;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kpi-label-v2" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kpi-value-v2" },
        ...{ class: ({ 'text-slate-300': item.value === '-' }) },
    });
    (item.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kpi-note-v2 d-flex align-center gap-1" },
    });
    const __VLS_32 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        icon: (item.value === '-' ? 'mdi-alert-circle-outline' : 'mdi-information-outline'),
        size: "14",
    }));
    const __VLS_34 = __VLS_33({
        icon: (item.value === '-' ? 'mdi-alert-circle-outline' : 'mdi-information-outline'),
        size: "14",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    (item.note);
    var __VLS_23;
    var __VLS_19;
    var __VLS_15;
}
var __VLS_11;
const __VLS_36 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    cols: "12",
}));
const __VLS_42 = __VLS_41({
    cols: "12",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ class: "main-panel rounded-xl" },
}));
const __VLS_46 = __VLS_45({
    ...{ class: "main-panel rounded-xl" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel-toolbar d-flex align-center justify-space-between pa-5 border-b" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center gap-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "toolbar-icon-bg" },
});
const __VLS_48 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    icon: "mdi-calendar-month",
    color: "teal-darken-2",
}));
const __VLS_50 = __VLS_49({
    icon: "mdi-calendar-month",
    color: "teal-darken-2",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-h6 font-weight-bold text-slate-800 line-height-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-caption text-slate-500 font-weight-medium" },
});
(__VLS_ctx.year);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "month-selector d-flex align-center bg-slate-50 rounded-pill pa-1 border" },
});
const __VLS_52 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    icon: "mdi-chevron-left",
    variant: "text",
    size: "small",
    rounded: "pill",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    icon: "mdi-chevron-left",
    variant: "text",
    size: "small",
    rounded: "pill",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (__VLS_ctx.prevMonth)
};
var __VLS_55;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mx-4 text-body-2 font-weight-bold text-teal-darken-3 min-w-140 text-center" },
});
(__VLS_ctx.currentMonthName);
const __VLS_60 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    icon: "mdi-chevron-right",
    variant: "text",
    size: "small",
    rounded: "pill",
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    icon: "mdi-chevron-right",
    variant: "text",
    size: "small",
    rounded: "pill",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.nextMonth)
};
var __VLS_63;
const __VLS_68 = {}.VDivider;
/** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    vertical: true,
    ...{ class: "mx-2 my-2" },
}));
const __VLS_70 = __VLS_69({
    vertical: true,
    ...{ class: "mx-2 my-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
    variant: "text",
    color: "teal-darken-1",
    size: "small",
    ...{ class: "px-4 font-weight-bold" },
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
    variant: "text",
    color: "teal-darken-1",
    size: "small",
    ...{ class: "px-4 font-weight-bold" },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (__VLS_ctx.resetToCurrentMonth)
};
__VLS_75.slots.default;
var __VLS_75;
const __VLS_80 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ class: "pa-6" },
}));
const __VLS_82 = __VLS_81({
    ...{ class: "pa-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    cols: "12",
    lg: "8",
}));
const __VLS_90 = __VLS_89({
    cols: "12",
    lg: "8",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calendar-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calendar-week-labels" },
});
for (const [day] of __VLS_getVForSourceType((__VLS_ctx.THAI_SHORT_WEEKDAYS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (day),
        ...{ class: "week-label" },
        ...{ class: ({ 'weekend-label': day === 'อา.' || day === 'ส.' }) },
    });
    (day);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calendar-main-grid" },
});
for (const [cell, index] of __VLS_getVForSourceType((__VLS_ctx.calendarGrid))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "grid-cell" },
        ...{ class: ({
                'is-other': !cell.isCurrentMonth,
                'is-weekend': cell.isWeekend,
                'has-holiday': cell.isHoliday,
                [`type-${cell.holidayType}`]: cell.isHoliday,
                'is-today': cell.isToday
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cell-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "cell-day" },
    });
    (cell.dayNumber);
    if (cell.isHoliday) {
        const __VLS_92 = {}.VIcon;
        /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            size: "14",
            ...{ class: "holiday-icon" },
            icon: (__VLS_ctx.getHolidayIcon(cell.holidayType)),
        }));
        const __VLS_94 = __VLS_93({
            size: "14",
            ...{ class: "holiday-icon" },
            icon: (__VLS_ctx.getHolidayIcon(cell.holidayType)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    }
    if (cell.isHoliday) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "cell-name-v2" },
            title: (cell.holidayName),
        });
        (cell.holidayName);
    }
    if (cell.isToday && !cell.isHoliday) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "today-marker" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center flex-wrap gap-4 mt-6 pt-6 border-t" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-pill shadow-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot gov" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ms-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-pill shadow-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot rel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ms-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-pill shadow-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot spec" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ms-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "legend-pill shadow-sm border-teal-lighten-2 border" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot today" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "ms-1" },
});
var __VLS_91;
const __VLS_96 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    cols: "12",
    lg: "4",
}));
const __VLS_98 = __VLS_97({
    cols: "12",
    lg: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-sidebar bg-slate-50 rounded-xl pa-5 h-100 border" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center justify-space-between mb-5" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-subtitle-1 font-weight-bold text-slate-700" },
});
const __VLS_100 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    size: "x-small",
    color: "primary",
    variant: "flat",
    ...{ class: "text-white font-weight-bold" },
}));
const __VLS_102 = __VLS_101({
    size: "x-small",
    color: "primary",
    variant: "flat",
    ...{ class: "text-white font-weight-bold" },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
var __VLS_103;
if (__VLS_ctx.upcomingHolidays.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "holiday-mini-list scrollable-area" },
    });
    for (const [h] of __VLS_getVForSourceType((__VLS_ctx.upcomingHolidays))) {
        const __VLS_104 = {}.VHover;
        /** @type {[typeof __VLS_components.VHover, typeof __VLS_components.vHover, typeof __VLS_components.VHover, typeof __VLS_components.vHover, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            key: (h.id),
        }));
        const __VLS_106 = __VLS_105({
            key: (h.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        {
            const { default: __VLS_thisSlot } = __VLS_107.slots;
            const [{ isHovering, props }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.upcomingHolidays.length))
                            return;
                        __VLS_ctx.$router.push(`/holidays/${h.id}/edit`);
                    } },
                ...(props),
                ...{ class: "mini-holiday-card shadow-sm" },
                ...{ class: ([h.type, { 'elevation-3': isHovering }]) },
                ...{ style: {} },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "d-flex justify-space-between mb-1" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "text-caption font-weight-bold text-teal-darken-2" },
            });
            (__VLS_ctx.formatThaiDate(h.holiday_date));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "text-caption-2" },
            });
            (__VLS_ctx.getHolidayTypeText(h.type));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "text-body-2 font-weight-bold text-slate-800" },
            });
            (h.holiday_name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "text-caption text-blue-darken-2 mt-1 font-weight-bold" },
            });
            (__VLS_ctx.getDaysUntil(h.holiday_date));
            __VLS_107.slots['' /* empty slot name completion */];
        }
        var __VLS_107;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-sidebar d-flex flex-column align-center justify-center py-10 text-center" },
    });
    const __VLS_108 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        icon: "mdi-calendar-blank",
        size: "48",
        color: "slate-lighten-4",
    }));
    const __VLS_110 = __VLS_109({
        icon: "mdi-calendar-blank",
        size: "48",
        color: "slate-lighten-4",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-body-2 font-weight-bold text-slate-400 mt-2" },
    });
}
var __VLS_99;
var __VLS_87;
var __VLS_83;
var __VLS_47;
var __VLS_43;
var __VLS_39;
/** @type {__VLS_StyleScopedClasses['dashboard-page']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-card-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-accent-line']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-start']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-icon-box']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-label-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-value-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi-note-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['main-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['toolbar-icon-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['line-height-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['month-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-darken-3']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-140']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
/** @type {__VLS_StyleScopedClasses['my-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-6']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-week-labels']} */ ;
/** @type {__VLS_StyleScopedClasses['week-label']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-top']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-day']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-name-v2']} */ ;
/** @type {__VLS_StyleScopedClasses['today-marker']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['gov']} */ ;
/** @type {__VLS_StyleScopedClasses['ms-1']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['rel']} */ ;
/** @type {__VLS_StyleScopedClasses['ms-1']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['spec']} */ ;
/** @type {__VLS_StyleScopedClasses['ms-1']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['border-teal-lighten-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['today']} */ ;
/** @type {__VLS_StyleScopedClasses['ms-1']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-100']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-subtitle-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-mini-list']} */ ;
/** @type {__VLS_StyleScopedClasses['scrollable-area']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-holiday-card']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-darken-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-darken-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-column']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatThaiDate: formatThaiDate,
            year: year,
            errorMessage: errorMessage,
            loading: loading,
            THAI_SHORT_WEEKDAYS: THAI_SHORT_WEEKDAYS,
            currentMonthName: currentMonthName,
            getDaysUntil: getDaysUntil,
            upcomingHolidays: upcomingHolidays,
            kpis: kpis,
            getHolidayIcon: getHolidayIcon,
            getHolidayTypeText: getHolidayTypeText,
            calendarGrid: calendarGrid,
            prevMonth: prevMonth,
            nextMonth: nextMonth,
            resetToCurrentMonth: resetToCurrentMonth,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
