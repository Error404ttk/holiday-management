import { computed, onMounted, ref } from 'vue';
import { apiErrorMessage } from '../services/api';
import { checkHoliday as checkHolidayApi, getHolidays } from '../services/holiday.service';
import { useHolidayStore } from '../stores/holiday';
import { formatThaiDateShort, currentBeYear, ceToBe } from '../utils/date';
import { guessHolidayType } from '../utils/holidayCategorizer';
const holidayStore = useHolidayStore();
const internalDate = ref(new Date());
const result = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const holidays = ref([]);
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
function getDisplayType(item) {
    if (item.holiday_type && item.holiday_type.trim()) {
        return item.holiday_type;
    }
    return guessHolidayType(item.holiday_name) || 'วันหยุดทั่วไป';
}
function getTypeColor(type) {
    if (!type)
        return 'blue-grey-lighten-2';
    const t = String(type).trim();
    if (t.includes('ราชการ') || t.includes('นักขัตฤกษ์'))
        return 'teal';
    if (t.includes('ธนาคาร'))
        return 'indigo';
    if (t.includes('พิเศษ') || t.includes('ประเพณี') || t.includes('ท้องถิ่น'))
        return 'deep-orange';
    if (t.includes('ชดเชย'))
        return 'amber-darken-2';
    return 'secondary';
}
function getDayOnly(dateStr) {
    if (!dateStr)
        return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? parts[2] : '';
}
function getDaysUntil(dateStr) {
    if (!dateStr)
        return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
function onDateChanged(val) {
    if (!val)
        return;
    const d = Array.isArray(val) ? val[0] : val;
    if (!(d instanceof Date) || isNaN(d.getTime()))
        return;
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
function selectHoliday(h) {
    if (!h.holiday_date)
        return;
    const [y, m, d] = h.holiday_date.split('-').map(Number);
    internalDate.value = new Date(y, m - 1, d);
    checkHoliday(h.holiday_date);
}
async function loadHolidays() {
    try {
        const data = await getHolidays({ year: currentBeYear(), mode: 'calendar' });
        holidays.value = data;
    }
    catch (error) {
        console.error('Failed to load upcoming holidays', error);
    }
}
async function checkHoliday(dateStr) {
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
        }
        else if (response.status === 'inactive' && holiday) {
            result.value = {
                date: dateStr,
                message: 'เป็นวันทำงานปกติ',
                cardColor: 'blue-lighten-5',
                iconColor: 'blue',
                icon: 'mdi-briefcase-check',
                holiday,
                daysDiff
            };
        }
        else {
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
    }
    catch (error) {
        result.value = null;
        errorMessage.value = apiErrorMessage(error);
    }
    finally {
        loading.value = false;
    }
}
onMounted(async () => {
    await loadHolidays();
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    await checkHoliday(dateStr);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sticky-top']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "holiday-check-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "check-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
const __VLS_0 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-calendar-search",
    ...{ class: "d-none d-sm-inline-flex" },
}));
const __VLS_2 = __VLS_1({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-calendar-search",
    ...{ class: "d-none d-sm-inline-flex" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
if (__VLS_ctx.errorMessage) {
    const __VLS_4 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-6" },
    }));
    const __VLS_6 = __VLS_5({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_7;
}
const __VLS_8 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "mt-2" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "mt-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    cols: "12",
    md: "5",
    lg: "4",
}));
const __VLS_14 = __VLS_13({
    cols: "12",
    md: "5",
    lg: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sticky-top" },
});
const __VLS_16 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "calendar-card mx-auto" },
    elevation: "3",
}));
const __VLS_18 = __VLS_17({
    ...{ class: "calendar-card mx-auto" },
    elevation: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "calendar-header px-4 py-3 bg-primary text-white d-flex justify-space-between align-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-caption opacity-80 font-weight-medium" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-h6 font-weight-bold" },
});
(__VLS_ctx.currentYearBE);
const __VLS_20 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    size: "28",
}));
const __VLS_22 = __VLS_21({
    size: "28",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "pa-0 d-flex justify-center" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "pa-0 d-flex justify-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.VDatePicker;
/** @type {[typeof __VLS_components.VDatePicker, typeof __VLS_components.vDatePicker, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.internalDate),
    color: "primary",
    hideHeader: true,
    showAdjacentMonths: true,
}));
const __VLS_30 = __VLS_29({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.internalDate),
    color: "primary",
    hideHeader: true,
    showAdjacentMonths: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    'onUpdate:modelValue': (__VLS_ctx.onDateChanged)
};
var __VLS_31;
var __VLS_27;
const __VLS_36 = {}.VDivider;
/** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ class: "pa-3 bg-slate-50 justify-center" },
}));
const __VLS_42 = __VLS_41({
    ...{ class: "pa-3 bg-slate-50 justify-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    variant: "flat",
    color: "primary",
    size: "small",
    rounded: "pill",
    prependIcon: "mdi-calendar-today",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    variant: "flat",
    color: "primary",
    size: "small",
    rounded: "pill",
    prependIcon: "mdi-calendar-today",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.setToday)
};
__VLS_47.slots.default;
var __VLS_47;
const __VLS_52 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    variant: "tonal",
    color: "secondary",
    size: "small",
    rounded: "pill",
    prependIcon: "mdi-calendar-arrow-right",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    variant: "tonal",
    color: "secondary",
    size: "small",
    rounded: "pill",
    prependIcon: "mdi-calendar-arrow-right",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (__VLS_ctx.setTomorrow)
};
__VLS_55.slots.default;
var __VLS_55;
var __VLS_43;
var __VLS_19;
var __VLS_15;
const __VLS_60 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    cols: "12",
    md: "7",
    lg: "8",
}));
const __VLS_62 = __VLS_61({
    cols: "12",
    md: "7",
    lg: "8",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
if (__VLS_ctx.result) {
    const __VLS_64 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ class: "result-card mb-6" },
        color: (__VLS_ctx.result.cardColor),
        variant: "flat",
    }));
    const __VLS_66 = __VLS_65({
        ...{ class: "result-card mb-6" },
        color: (__VLS_ctx.result.cardColor),
        variant: "flat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ class: "d-flex align-center py-6" },
    }));
    const __VLS_70 = __VLS_69({
        ...{ class: "d-flex align-center py-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    const __VLS_72 = {}.VAvatar;
    /** @type {[typeof __VLS_components.VAvatar, typeof __VLS_components.vAvatar, typeof __VLS_components.VAvatar, typeof __VLS_components.vAvatar, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        color: (__VLS_ctx.result.iconColor),
        size: "64",
        ...{ class: "mr-6 shadow-sm" },
    }));
    const __VLS_74 = __VLS_73({
        color: (__VLS_ctx.result.iconColor),
        size: "64",
        ...{ class: "mr-6 shadow-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    const __VLS_76 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        icon: (__VLS_ctx.result.icon),
        size: "36",
        color: "white",
    }));
    const __VLS_78 = __VLS_77({
        icon: (__VLS_ctx.result.icon),
        size: "36",
        color: "white",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    var __VLS_75;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex-grow-1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-overline mb-1 opacity-80" },
    });
    (__VLS_ctx.formatThaiDateShort(__VLS_ctx.result.date));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "text-h5 font-weight-bold mb-1" },
    });
    (__VLS_ctx.result.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "d-flex align-center gap-2" },
    });
    if (__VLS_ctx.result.holiday) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "text-subtitle-1 font-weight-medium opacity-90" },
        });
        (__VLS_ctx.result.holiday.holiday_name);
        const __VLS_80 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            color: (__VLS_ctx.getTypeColor(__VLS_ctx.getDisplayType(__VLS_ctx.result.holiday))),
            size: "x-small",
            variant: "flat",
        }));
        const __VLS_82 = __VLS_81({
            color: (__VLS_ctx.getTypeColor(__VLS_ctx.getDisplayType(__VLS_ctx.result.holiday))),
            size: "x-small",
            variant: "flat",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        (__VLS_ctx.getDisplayType(__VLS_ctx.result.holiday));
        var __VLS_83;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "text-subtitle-1 opacity-70" },
        });
    }
    if (__VLS_ctx.result.daysDiff !== undefined) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-caption mt-2 opacity-70" },
        });
        const __VLS_84 = {}.VIcon;
        /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            size: "14",
            ...{ class: "mr-1" },
        }));
        const __VLS_86 = __VLS_85({
            size: "14",
            ...{ class: "mr-1" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
        var __VLS_87;
        (__VLS_ctx.result.daysDiff === 0 ? 'คือวันนี้' : (__VLS_ctx.result.daysDiff > 0 ? `อีก ${__VLS_ctx.result.daysDiff} วันจะถึง` : `ผ่านมาแล้ว ${Math.abs(__VLS_ctx.result.daysDiff)} วัน`));
    }
    var __VLS_71;
    var __VLS_67;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-h6 font-weight-bold mb-3 d-flex align-center" },
});
const __VLS_88 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    color: "primary",
    ...{ class: "mr-2" },
}));
const __VLS_90 = __VLS_89({
    color: "primary",
    ...{ class: "mr-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
var __VLS_91;
const __VLS_92 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    elevation: "1",
}));
const __VLS_94 = __VLS_93({
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
if (__VLS_ctx.upcomingHolidays.length > 0) {
    const __VLS_96 = {}.VList;
    /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        lines: "two",
    }));
    const __VLS_98 = __VLS_97({
        lines: "two",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    for (const [h] of __VLS_getVForSourceType((__VLS_ctx.upcomingHolidays))) {
        const __VLS_100 = {}.VListItem;
        /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onClick': {} },
            key: (h.id),
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onClick': {} },
            key: (h.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_104;
        let __VLS_105;
        let __VLS_106;
        const __VLS_107 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.upcomingHolidays.length > 0))
                    return;
                __VLS_ctx.selectHoliday(h);
            }
        };
        __VLS_103.slots.default;
        {
            const { prepend: __VLS_thisSlot } = __VLS_103.slots;
            const __VLS_108 = {}.VAvatar;
            /** @type {[typeof __VLS_components.VAvatar, typeof __VLS_components.vAvatar, typeof __VLS_components.VAvatar, typeof __VLS_components.vAvatar, ]} */ ;
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                color: "primary",
                variant: "tonal",
                size: "40",
            }));
            const __VLS_110 = __VLS_109({
                color: "primary",
                variant: "tonal",
                size: "40",
            }, ...__VLS_functionalComponentArgsRest(__VLS_109));
            __VLS_111.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "text-caption font-weight-bold" },
            });
            (__VLS_ctx.getDayOnly(h.holiday_date));
            var __VLS_111;
        }
        const __VLS_112 = {}.VListItemTitle;
        /** @type {[typeof __VLS_components.VListItemTitle, typeof __VLS_components.vListItemTitle, typeof __VLS_components.VListItemTitle, typeof __VLS_components.vListItemTitle, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            ...{ class: "font-weight-bold" },
        }));
        const __VLS_114 = __VLS_113({
            ...{ class: "font-weight-bold" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        __VLS_115.slots.default;
        (h.holiday_name);
        var __VLS_115;
        const __VLS_116 = {}.VListItemSubtitle;
        /** @type {[typeof __VLS_components.VListItemSubtitle, typeof __VLS_components.vListItemSubtitle, typeof __VLS_components.VListItemSubtitle, typeof __VLS_components.vListItemSubtitle, ]} */ ;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
        const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
        __VLS_119.slots.default;
        (__VLS_ctx.formatThaiDateShort(h.holiday_date));
        var __VLS_119;
        {
            const { append: __VLS_thisSlot } = __VLS_103.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "text-right" },
            });
            const __VLS_120 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                size: "x-small",
                variant: "outlined",
                color: "primary",
                ...{ class: "mb-1" },
            }));
            const __VLS_122 = __VLS_121({
                size: "x-small",
                variant: "outlined",
                color: "primary",
                ...{ class: "mb-1" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_121));
            __VLS_123.slots.default;
            (__VLS_ctx.getDaysUntil(h.holiday_date));
            var __VLS_123;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            const __VLS_124 = {}.VIcon;
            /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                size: "small",
                color: "grey-lighten-1",
            }));
            const __VLS_126 = __VLS_125({
                size: "small",
                color: "grey-lighten-1",
            }, ...__VLS_functionalComponentArgsRest(__VLS_125));
            __VLS_127.slots.default;
            var __VLS_127;
        }
        var __VLS_103;
    }
    var __VLS_99;
}
else {
    const __VLS_128 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        ...{ class: "text-center py-8 text-grey" },
    }));
    const __VLS_130 = __VLS_129({
        ...{ class: "text-center py-8 text-grey" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    const __VLS_132 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        size: "40",
        ...{ class: "mb-2" },
    }));
    const __VLS_134 = __VLS_133({
        size: "40",
        ...{ class: "mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    var __VLS_135;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    var __VLS_131;
}
var __VLS_95;
var __VLS_63;
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['holiday-check-page']} */ ;
/** @type {__VLS_StyleScopedClasses['check-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['d-none']} */ ;
/** @type {__VLS_StyleScopedClasses['d-sm-inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-top']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['calendar-header']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-0']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-grow-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-overline']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-80']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-subtitle-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-90']} */ ;
/** @type {__VLS_StyleScopedClasses['text-subtitle-1']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h6']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-grey']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatThaiDateShort: formatThaiDateShort,
            internalDate: internalDate,
            result: result,
            errorMessage: errorMessage,
            currentYearBE: currentYearBE,
            upcomingHolidays: upcomingHolidays,
            getDisplayType: getDisplayType,
            getTypeColor: getTypeColor,
            getDayOnly: getDayOnly,
            getDaysUntil: getDaysUntil,
            onDateChanged: onDateChanged,
            setToday: setToday,
            setTomorrow: setTomorrow,
            selectHoliday: selectHoliday,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
