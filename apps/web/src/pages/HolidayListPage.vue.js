import { computed, onMounted, ref, watch } from 'vue';
import { apiErrorMessage } from '../services/api';
import { hasPermission } from '../services/auth.service';
import { useHolidayStore } from '../stores/holiday';
import { filterHolidaysByKeyword, getHolidayYearRange, updateHolidayStatus, getHolidaySchemaConfig } from '../services/holiday.service';
import { formatThaiDate, currentBeYear } from '../utils/date';
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
    { title: '', key: 'actions', sortable: false, align: 'end', width: '130px' }
];
const selectedYear = ref(currentBeYear());
const yearMode = ref('calendar');
const selectedMonth = ref(0);
const search = ref('');
const errorMessage = ref('');
const loading = computed(() => holidayStore.loading);
const holidays = computed(() => holidayStore.holidays);
const schemaConfig = ref(null);
const previewDialog = ref(false);
const selectedHoliday = ref(null);
const disableDialog = ref(false);
const disableTarget = ref(null);
const disableReason = ref('');
const disableReasonError = ref('');
const statusSaving = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
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
    // วันหยุดราชการ / นักขัตฤกษ์
    if (t.includes('ราชการ') || t.includes('นักขัตฤกษ์'))
        return 'teal';
    // วันหยุดธนาคาร
    if (t.includes('ธนาคาร'))
        return 'indigo';
    // วันหยุดพิเศษ / ประเพณี / ท้องถิ่น
    if (t.includes('พิเศษ') || t.includes('ประเพณี') || t.includes('ท้องถิ่น'))
        return 'deep-orange';
    // วันหยุดชดเชย
    if (t.includes('ชดเชย'))
        return 'amber-darken-2';
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
    }
    catch (error) {
        errorMessage.value = apiErrorMessage(error);
        console.error('Failed to load initial data', error);
    }
}
async function loadHolidays() {
    errorMessage.value = '';
    try {
        await holidayStore.fetchHolidays(selectedYear.value, yearMode.value);
    }
    catch (error) {
        errorMessage.value = apiErrorMessage(error);
    }
}
function resetFilters() {
    selectedYear.value = currentBeYear();
    yearMode.value = 'calendar';
    selectedMonth.value = 0;
    search.value = '';
}
function openPreview(holiday) {
    selectedHoliday.value = holiday;
    previewDialog.value = true;
}
function showSnackbar(message, color = 'success') {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
}
function openDisableDialog(holiday) {
    disableTarget.value = holiday;
    disableReason.value = '';
    disableReasonError.value = '';
    disableDialog.value = true;
}
async function confirmDisableHoliday() {
    if (!disableTarget.value)
        return;
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
    }
    catch (error) {
        const message = apiErrorMessage(error);
        errorMessage.value = message;
        showSnackbar(message, 'error');
    }
    finally {
        statusSaving.value = false;
    }
}
onMounted(loadInitialData);
watch([selectedYear, yearMode], loadHolidays);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "holiday-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.selectedYear);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
(__VLS_ctx.yearMode === 'fiscal' ? 'ปีงบประมาณ' : 'ปีปฏิทิน');
(__VLS_ctx.selectedYear);
(__VLS_ctx.formatThaiDate(__VLS_ctx.range.startDate));
(__VLS_ctx.formatThaiDate(__VLS_ctx.range.endDate));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center gap-3" },
});
if (__VLS_ctx.canCreate) {
    const __VLS_0 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        color: "secondary",
        prependIcon: "mdi-plus",
        to: "/holidays/create",
        elevation: "1",
    }));
    const __VLS_2 = __VLS_1({
        color: "secondary",
        prependIcon: "mdi-plus",
        to: "/holidays/create",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    var __VLS_3;
}
const __VLS_4 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-database-check",
    ...{ class: "d-none d-sm-inline-flex" },
}));
const __VLS_6 = __VLS_5({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-database-check",
    ...{ class: "d-none d-sm-inline-flex" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
if (__VLS_ctx.errorMessage) {
    const __VLS_8 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_10 = __VLS_9({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_11;
}
const __VLS_12 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "filter-card" },
}));
const __VLS_14 = __VLS_13({
    ...{ class: "filter-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    dense: true,
}));
const __VLS_22 = __VLS_21({
    dense: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    cols: "12",
    sm: "6",
    md: "3",
}));
const __VLS_26 = __VLS_25({
    cols: "12",
    sm: "6",
    md: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.selectedYear),
    items: (__VLS_ctx.yearOptions),
    label: "ปี พ.ศ.",
    variant: "outlined",
    density: "compact",
    hideDetails: true,
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.selectedYear),
    items: (__VLS_ctx.yearOptions),
    label: "ปี พ.ศ.",
    variant: "outlined",
    density: "compact",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
const __VLS_32 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    cols: "12",
    sm: "6",
    md: "2",
}));
const __VLS_34 = __VLS_33({
    cols: "12",
    sm: "6",
    md: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.yearMode),
    items: (__VLS_ctx.yearModeOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "มุมมองวันที่",
    variant: "outlined",
    density: "compact",
    hideDetails: true,
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.yearMode),
    items: (__VLS_ctx.yearModeOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "มุมมองวันที่",
    variant: "outlined",
    density: "compact",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
const __VLS_40 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    cols: "12",
    sm: "6",
    md: "2",
}));
const __VLS_42 = __VLS_41({
    cols: "12",
    sm: "6",
    md: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.selectedMonth),
    items: (__VLS_ctx.monthOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "เดือน",
    variant: "outlined",
    density: "compact",
    hideDetails: true,
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.selectedMonth),
    items: (__VLS_ctx.monthOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "เดือน",
    variant: "outlined",
    density: "compact",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
const __VLS_48 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    cols: "12",
    sm: "6",
    md: "3",
}));
const __VLS_50 = __VLS_49({
    cols: "12",
    sm: "6",
    md: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.search),
    modelModifiers: { trim: true, },
    label: "ค้นหาชื่อวันหยุด",
    prependInnerIcon: "mdi-magnify",
    variant: "outlined",
    density: "compact",
    clearable: true,
    hideDetails: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.search),
    modelModifiers: { trim: true, },
    label: "ค้นหาชื่อวันหยุด",
    prependInnerIcon: "mdi-magnify",
    variant: "outlined",
    density: "compact",
    clearable: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    cols: "12",
    md: "2",
    ...{ class: "d-flex align-center" },
}));
const __VLS_58 = __VLS_57({
    cols: "12",
    md: "2",
    ...{ class: "d-flex align-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    block: true,
    variant: "tonal",
    color: "grey-darken-1",
    prependIcon: "mdi-filter-variant-remove",
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    block: true,
    variant: "tonal",
    color: "grey-darken-1",
    prependIcon: "mdi-filter-variant-remove",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.resetFilters)
};
__VLS_63.slots.default;
var __VLS_63;
var __VLS_59;
var __VLS_23;
var __VLS_19;
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-bar mt-4 mb-2 d-flex align-center" },
});
const __VLS_68 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    size: "small",
    color: "primary",
    ...{ class: "mr-2" },
}));
const __VLS_70 = __VLS_69({
    size: "small",
    color: "primary",
    ...{ class: "mr-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
var __VLS_71;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-caption text-grey-darken-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.filteredHolidays.length);
const __VLS_72 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.VDataTable;
/** @type {[typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    headers: (__VLS_ctx.visibleHeaders),
    items: (__VLS_ctx.filteredHolidays),
    loading: (__VLS_ctx.loading),
    itemsPerPage: (15),
    itemValue: "id",
    ...{ class: "holiday-table" },
    hover: true,
    sortBy: ([{ key: 'holiday_date', order: 'asc' }]),
}));
const __VLS_78 = __VLS_77({
    headers: (__VLS_ctx.visibleHeaders),
    items: (__VLS_ctx.filteredHolidays),
    loading: (__VLS_ctx.loading),
    itemsPerPage: (15),
    itemValue: "id",
    ...{ class: "holiday-table" },
    hover: true,
    sortBy: ([{ key: 'holiday_date', order: 'asc' }]),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
{
    const { 'item.holiday_date': __VLS_thisSlot } = __VLS_79.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "font-weight-medium" },
    });
    (__VLS_ctx.formatThaiDate(item.holiday_date));
}
{
    const { 'item.holiday_name': __VLS_thisSlot } = __VLS_79.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-body-2" },
    });
    (item.holiday_name);
    if (item.note) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-caption text-grey" },
        });
        (item.note);
    }
}
{
    const { 'item.holiday_type': __VLS_thisSlot } = __VLS_79.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_80 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        color: (__VLS_ctx.getTypeColor(__VLS_ctx.getDisplayType(item))),
        size: "x-small",
        variant: "flat",
        ...{ class: "font-weight-bold" },
    }));
    const __VLS_82 = __VLS_81({
        color: (__VLS_ctx.getTypeColor(__VLS_ctx.getDisplayType(item))),
        size: "x-small",
        variant: "flat",
        ...{ class: "font-weight-bold" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    (__VLS_ctx.getDisplayType(item));
    var __VLS_83;
}
{
    const { 'item.active': __VLS_thisSlot } = __VLS_79.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_84 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        color: (item.active === false ? 'grey-lighten-1' : 'success'),
        size: "x-small",
        variant: "tonal",
        ...{ class: "px-2" },
    }));
    const __VLS_86 = __VLS_85({
        color: (item.active === false ? 'grey-lighten-1' : 'success'),
        size: "x-small",
        variant: "tonal",
        ...{ class: "px-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        start: true,
        size: "10",
        icon: (item.active === false ? 'mdi-minus-circle' : 'mdi-check-circle'),
    }));
    const __VLS_90 = __VLS_89({
        start: true,
        size: "10",
        icon: (item.active === false ? 'mdi-minus-circle' : 'mdi-check-circle'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    (item.active === false ? 'ปิดใช้งาน' : 'ใช้งาน');
    var __VLS_87;
}
{
    const { 'item.actions': __VLS_thisSlot } = __VLS_79.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-buttons" },
    });
    const __VLS_92 = {}.VTooltip;
    /** @type {[typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        text: "ดูรายละเอียด",
        location: "top",
    }));
    const __VLS_94 = __VLS_93({
        text: "ดูรายละเอียด",
        location: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    {
        const { activator: __VLS_thisSlot } = __VLS_95.slots;
        const [{ props }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_96 = {}.VBtn;
        /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            ...{ 'onClick': {} },
            ...(props),
            icon: "mdi-eye-outline",
            variant: "text",
            size: "small",
        }));
        const __VLS_98 = __VLS_97({
            ...{ 'onClick': {} },
            ...(props),
            icon: "mdi-eye-outline",
            variant: "text",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        let __VLS_100;
        let __VLS_101;
        let __VLS_102;
        const __VLS_103 = {
            onClick: (...[$event]) => {
                __VLS_ctx.openPreview(item);
            }
        };
        var __VLS_99;
    }
    var __VLS_95;
    if (__VLS_ctx.canUpdate) {
        const __VLS_104 = {}.VTooltip;
        /** @type {[typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            text: "แก้ไข",
            location: "top",
        }));
        const __VLS_106 = __VLS_105({
            text: "แก้ไข",
            location: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        __VLS_107.slots.default;
        {
            const { activator: __VLS_thisSlot } = __VLS_107.slots;
            const [{ props }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_108 = {}.VBtn;
            /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                ...(props),
                icon: "mdi-pencil-outline",
                variant: "text",
                size: "small",
                color: "primary",
                to: (`/holidays/${item.id}/edit`),
            }));
            const __VLS_110 = __VLS_109({
                ...(props),
                icon: "mdi-pencil-outline",
                variant: "text",
                size: "small",
                color: "primary",
                to: (`/holidays/${item.id}/edit`),
            }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        }
        var __VLS_107;
    }
    if (__VLS_ctx.canDisable && item.active === true) {
        const __VLS_112 = {}.VTooltip;
        /** @type {[typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            text: "ปิดใช้งาน",
            location: "top",
        }));
        const __VLS_114 = __VLS_113({
            text: "ปิดใช้งาน",
            location: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        __VLS_115.slots.default;
        {
            const { activator: __VLS_thisSlot } = __VLS_115.slots;
            const [{ props }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_116 = {}.VBtn;
            /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
                ...{ 'onClick': {} },
                ...(props),
                icon: "mdi-power",
                color: "warning",
                variant: "text",
                size: "small",
                disabled: (__VLS_ctx.statusSaving),
            }));
            const __VLS_118 = __VLS_117({
                ...{ 'onClick': {} },
                ...(props),
                icon: "mdi-power",
                color: "warning",
                variant: "text",
                size: "small",
                disabled: (__VLS_ctx.statusSaving),
            }, ...__VLS_functionalComponentArgsRest(__VLS_117));
            let __VLS_120;
            let __VLS_121;
            let __VLS_122;
            const __VLS_123 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.canDisable && item.active === true))
                        return;
                    __VLS_ctx.openDisableDialog(item);
                }
            };
            var __VLS_119;
        }
        var __VLS_115;
    }
}
{
    const { 'no-data': __VLS_thisSlot } = __VLS_79.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state py-8" },
    });
    const __VLS_124 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        size: "48",
        color: "grey-lighten-2",
        ...{ class: "mb-2" },
    }));
    const __VLS_126 = __VLS_125({
        size: "48",
        color: "grey-lighten-2",
        ...{ class: "mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    var __VLS_127;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
}
var __VLS_79;
var __VLS_75;
const __VLS_128 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.previewDialog),
    maxWidth: "520",
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.previewDialog),
    maxWidth: "520",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
if (__VLS_ctx.selectedHoliday) {
    const __VLS_132 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    const __VLS_136 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        ...{ class: "d-flex align-center" },
    }));
    const __VLS_138 = __VLS_137({
        ...{ class: "d-flex align-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_140 = {}.VSpacer;
    /** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
    const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    const __VLS_144 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        ...{ 'onClick': {} },
        icon: "mdi-close",
        variant: "text",
        size: "small",
    }));
    const __VLS_146 = __VLS_145({
        ...{ 'onClick': {} },
        icon: "mdi-close",
        variant: "text",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    let __VLS_148;
    let __VLS_149;
    let __VLS_150;
    const __VLS_151 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.selectedHoliday))
                return;
            __VLS_ctx.previewDialog = false;
        }
    };
    var __VLS_147;
    var __VLS_139;
    const __VLS_152 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        ...{ class: "pt-2" },
    }));
    const __VLS_154 = __VLS_153({
        ...{ class: "pt-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    __VLS_155.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatThaiDate(__VLS_ctx.selectedHoliday.holiday_date));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedHoliday.holiday_name);
    if (__VLS_ctx.schemaConfig?.typeColumnSupported) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_156 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            color: (__VLS_ctx.getTypeColor(__VLS_ctx.selectedHoliday.holiday_type)),
            size: "x-small",
            variant: "flat",
        }));
        const __VLS_158 = __VLS_157({
            color: (__VLS_ctx.getTypeColor(__VLS_ctx.selectedHoliday.holiday_type)),
            size: "x-small",
            variant: "flat",
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        __VLS_159.slots.default;
        (__VLS_ctx.selectedHoliday.holiday_type || 'ทั่วไป');
        var __VLS_159;
    }
    if (__VLS_ctx.schemaConfig?.activeColumnSupported) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        if (typeof __VLS_ctx.selectedHoliday.active === 'boolean') {
            const __VLS_160 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
                color: (__VLS_ctx.selectedHoliday.active ? 'success' : 'grey-lighten-1'),
                size: "x-small",
                variant: "tonal",
            }));
            const __VLS_162 = __VLS_161({
                color: (__VLS_ctx.selectedHoliday.active ? 'success' : 'grey-lighten-1'),
                size: "x-small",
                variant: "tonal",
            }, ...__VLS_functionalComponentArgsRest(__VLS_161));
            __VLS_163.slots.default;
            (__VLS_ctx.selectedHoliday.active ? 'ใช้งาน' : 'ปิดใช้งาน');
            var __VLS_163;
        }
    }
    if (__VLS_ctx.selectedHoliday.note) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "preview-row flex-column align-start border-0" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "mb-1" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-body-2 text-grey-darken-3" },
        });
        (__VLS_ctx.selectedHoliday.note);
    }
    var __VLS_155;
    const __VLS_164 = {}.VCardActions;
    /** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
    const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    const __VLS_168 = {}.VSpacer;
    /** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
    const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
    const __VLS_172 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "text",
    }));
    const __VLS_174 = __VLS_173({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "text",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    let __VLS_176;
    let __VLS_177;
    let __VLS_178;
    const __VLS_179 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.selectedHoliday))
                return;
            __VLS_ctx.previewDialog = false;
        }
    };
    __VLS_175.slots.default;
    var __VLS_175;
    var __VLS_167;
    var __VLS_135;
}
var __VLS_131;
const __VLS_180 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.disableDialog),
    maxWidth: "520",
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.disableDialog),
    maxWidth: "520",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
if (__VLS_ctx.disableTarget) {
    const __VLS_184 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({}));
    const __VLS_186 = __VLS_185({}, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    const __VLS_188 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
    const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    var __VLS_191;
    const __VLS_192 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
    const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    const __VLS_196 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        type: "warning",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_198 = __VLS_197({
        type: "warning",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    __VLS_199.slots.default;
    var __VLS_199;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatThaiDate(__VLS_ctx.disableTarget.holiday_date));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.disableTarget.holiday_name);
    const __VLS_200 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        modelValue: (__VLS_ctx.disableReason),
        modelModifiers: { trim: true, },
        label: "เหตุผลในการปิดใช้งาน",
        rows: "3",
        autoGrow: true,
        ...{ class: "mt-4" },
        errorMessages: (__VLS_ctx.disableReasonError),
    }));
    const __VLS_202 = __VLS_201({
        modelValue: (__VLS_ctx.disableReason),
        modelModifiers: { trim: true, },
        label: "เหตุผลในการปิดใช้งาน",
        rows: "3",
        autoGrow: true,
        ...{ class: "mt-4" },
        errorMessages: (__VLS_ctx.disableReasonError),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    var __VLS_195;
    const __VLS_204 = {}.VCardActions;
    /** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({}));
    const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    const __VLS_208 = {}.VSpacer;
    /** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({}));
    const __VLS_210 = __VLS_209({}, ...__VLS_functionalComponentArgsRest(__VLS_209));
    const __VLS_212 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        ...{ 'onClick': {} },
        variant: "text",
        disabled: (__VLS_ctx.statusSaving),
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onClick': {} },
        variant: "text",
        disabled: (__VLS_ctx.statusSaving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_216;
    let __VLS_217;
    let __VLS_218;
    const __VLS_219 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.disableTarget))
                return;
            __VLS_ctx.disableDialog = false;
        }
    };
    __VLS_215.slots.default;
    var __VLS_215;
    const __VLS_220 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        ...{ 'onClick': {} },
        color: "warning",
        variant: "flat",
        loading: (__VLS_ctx.statusSaving),
    }));
    const __VLS_222 = __VLS_221({
        ...{ 'onClick': {} },
        color: "warning",
        variant: "flat",
        loading: (__VLS_ctx.statusSaving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    let __VLS_224;
    let __VLS_225;
    let __VLS_226;
    const __VLS_227 = {
        onClick: (__VLS_ctx.confirmDisableHoliday)
    };
    __VLS_223.slots.default;
    var __VLS_223;
    var __VLS_207;
    var __VLS_187;
}
var __VLS_183;
const __VLS_228 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    modelValue: (__VLS_ctx.snackbar),
    color: (__VLS_ctx.snackbarColor),
    timeout: "1800",
}));
const __VLS_230 = __VLS_229({
    modelValue: (__VLS_ctx.snackbar),
    color: (__VLS_ctx.snackbarColor),
    timeout: "1800",
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
(__VLS_ctx.snackbarMessage);
var __VLS_231;
/** @type {__VLS_StyleScopedClasses['holiday-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['d-none']} */ ;
/** @type {__VLS_StyleScopedClasses['d-sm-inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['text-grey-darken-1']} */ ;
/** @type {__VLS_StyleScopedClasses['holiday-table']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['text-grey']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-column']} */ ;
/** @type {__VLS_StyleScopedClasses['align-start']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-grey-darken-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatThaiDate: formatThaiDate,
            yearOptions: yearOptions,
            yearModeOptions: yearModeOptions,
            monthOptions: monthOptions,
            selectedYear: selectedYear,
            yearMode: yearMode,
            selectedMonth: selectedMonth,
            search: search,
            errorMessage: errorMessage,
            loading: loading,
            schemaConfig: schemaConfig,
            previewDialog: previewDialog,
            selectedHoliday: selectedHoliday,
            disableDialog: disableDialog,
            disableTarget: disableTarget,
            disableReason: disableReason,
            disableReasonError: disableReasonError,
            statusSaving: statusSaving,
            snackbar: snackbar,
            snackbarMessage: snackbarMessage,
            snackbarColor: snackbarColor,
            canCreate: canCreate,
            canUpdate: canUpdate,
            canDisable: canDisable,
            range: range,
            visibleHeaders: visibleHeaders,
            filteredHolidays: filteredHolidays,
            getDisplayType: getDisplayType,
            getTypeColor: getTypeColor,
            resetFilters: resetFilters,
            openPreview: openPreview,
            openDisableDialog: openDisableDialog,
            confirmDisableHoliday: confirmDisableHoliday,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
