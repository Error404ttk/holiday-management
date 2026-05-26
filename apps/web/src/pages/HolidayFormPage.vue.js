import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatThaiDate } from '../utils/date';
import { apiErrorMessage } from '../services/api';
import { createHoliday, getHolidayById, getHolidays, updateHoliday, getHolidaySchemaConfig } from '../services/holiday.service';
import { guessHolidayType } from '../utils/holidayCategorizer';
import { useHolidayStore } from '../stores/holiday';
const route = useRoute();
const router = useRouter();
const holidayStore = useHolidayStore();
const holidayTypes = ['วันหยุดราชการ', 'วันหยุดชดเชย', 'วันหยุดพิเศษ', 'วันหยุดท้องถิ่น', 'วันหยุดภายในหน่วยงาน'];
const requiredRule = (value) => Boolean(value) || 'กรุณากรอกข้อมูล';
const currentYear = new Date().getFullYear();
const minSelectableDate = `${currentYear - 1}-01-01`;
const maxSelectableDate = `${currentYear + 3}-12-31`;
const dateRangeRule = (value) => {
    if (!value)
        return true;
    const year = Number(value.split('-')[0]);
    if (year < currentYear - 1 || year > currentYear + 3) {
        return `กรุณาระบุปี ค.ศ. ระหว่าง ${currentYear - 1} ถึง ${currentYear + 3}`;
    }
    return true;
};
const formRef = ref(null);
const formValid = ref(false);
const editReason = ref('');
const loading = ref(false);
const errorMessage = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const duplicateDialog = ref(false);
const confirmSaveDialog = ref(false);
const duplicateHoliday = ref(null);
const pendingSave = ref(false);
const holidayId = computed(() => String(route.params.id));
const isEditMode = computed(() => route.name === 'holiday-edit');
const originalHoliday = ref(null);
const schemaConfig = ref(null);
const form = reactive({
    holiday_date: '',
    holiday_name: '',
    holiday_type: '',
    active: true,
    note: ''
});
// Watch for holiday name changes to suggest a type
watch(() => form.holiday_name, (newName) => {
    if (!isEditMode.value && !form.holiday_type && newName) {
        const suggested = guessHolidayType(newName);
        if (suggested) {
            form.holiday_type = suggested;
        }
    }
});
onMounted(async () => {
    await loadSchemaConfig();
    await loadHoliday();
});
async function loadSchemaConfig() {
    try {
        schemaConfig.value = await getHolidaySchemaConfig();
    }
    catch (error) {
        console.error('Failed to load schema config:', error);
    }
}
async function loadHoliday() {
    if (!isEditMode.value)
        return;
    loading.value = true;
    errorMessage.value = '';
    try {
        originalHoliday.value = await getHolidayById(holidayId.value);
        form.holiday_date = originalHoliday.value.holiday_date;
        form.holiday_name = originalHoliday.value.holiday_name;
        form.holiday_type = originalHoliday.value.holiday_type;
        form.active = originalHoliday.value.active ?? true;
        form.note = originalHoliday.value.note ?? '';
    }
    catch (error) {
        originalHoliday.value = null;
        errorMessage.value = apiErrorMessage(error);
    }
    finally {
        loading.value = false;
    }
}
async function submitForm() {
    const validation = await formRef.value?.validate();
    if (!validation?.valid)
        return;
    confirmSaveDialog.value = true;
}
function confirmDuplicateSave() {
    duplicateDialog.value = false;
    pendingSave.value = true;
    confirmSaveDialog.value = true;
}
async function findDuplicateHoliday() {
    const beYear = Number(form.holiday_date.slice(0, 4)) + 543;
    const holidays = await getHolidays({ year: beYear, mode: 'calendar' });
    return holidays.find((holiday) => holiday.holiday_date === form.holiday_date && String(holiday.id) !== holidayId.value);
}
function showSuccess(message) {
    snackbarMessage.value = message;
    snackbarColor.value = 'success';
    snackbar.value = true;
}
function showError(error) {
    const message = apiErrorMessage(error);
    // Specifically handle 409 Conflict for duplicate dates or general duplicate messages
    if (message.includes('ซ้ำ') || error?.response?.status === 409) {
        errorMessage.value = 'พบข้อมูลซ้ำ: ' + message;
    }
    else {
        errorMessage.value = message;
    }
    snackbarMessage.value = errorMessage.value;
    snackbarColor.value = 'error';
    snackbar.value = true;
}
async function saveHoliday() {
    loading.value = true;
    errorMessage.value = '';
    try {
        if (isEditMode.value) {
            await updateHoliday(holidayId.value, { ...form }, editReason.value);
        }
        else {
            await createHoliday({ ...form });
        }
        confirmSaveDialog.value = false;
        holidayStore.clearCache();
        showSuccess('บันทึกข้อมูลสำเร็จ');
        window.setTimeout(() => {
            router.push('/holidays');
        }, 500);
    }
    catch (error) {
        showError(error);
    }
    finally {
        loading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
(__VLS_ctx.isEditMode ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุด');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
(__VLS_ctx.isEditMode ? 'แก้ไขข้อมูลวันหยุดและระบุเหตุผลทุกครั้ง' : 'เพิ่มรายการวันหยุดผ่าน Backend API');
const __VLS_0 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-shield-check",
}));
const __VLS_2 = __VLS_1({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-shield-check",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
if (__VLS_ctx.isEditMode && !__VLS_ctx.originalHoliday) {
    const __VLS_4 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_6 = __VLS_5({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    var __VLS_7;
}
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
const __VLS_12 = {}.VAlert;
/** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    color: "orange-darken-4",
    variant: "tonal",
    border: "start",
    ...{ class: "mb-6 warning-banner" },
}));
const __VLS_14 = __VLS_13({
    color: "orange-darken-4",
    variant: "tonal",
    border: "start",
    ...{ class: "mb-6 warning-banner" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-h6 me-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
var __VLS_15;
const __VLS_16 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.VForm;
/** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    modelValue: (__VLS_ctx.formValid),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    modelValue: (__VLS_ctx.formValid),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onSubmit: (__VLS_ctx.submitForm)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_32 = {};
__VLS_27.slots.default;
const __VLS_34 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({}));
const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    cols: "12",
    md: "4",
}));
const __VLS_40 = __VLS_39({
    cols: "12",
    md: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.form.holiday_date),
    label: "วันที่วันหยุด",
    type: "date",
    min: (__VLS_ctx.minSelectableDate),
    max: (__VLS_ctx.maxSelectableDate),
    rules: ([__VLS_ctx.requiredRule, __VLS_ctx.dateRangeRule]),
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.form.holiday_date),
    label: "วันที่วันหยุด",
    type: "date",
    min: (__VLS_ctx.minSelectableDate),
    max: (__VLS_ctx.maxSelectableDate),
    rules: ([__VLS_ctx.requiredRule, __VLS_ctx.dateRangeRule]),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
var __VLS_41;
const __VLS_46 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    cols: "12",
    md: "8",
}));
const __VLS_48 = __VLS_47({
    cols: "12",
    md: "8",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.form.holiday_name),
    modelModifiers: { trim: true, },
    label: "ชื่อวันหยุด",
    rules: ([__VLS_ctx.requiredRule]),
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.form.holiday_name),
    modelModifiers: { trim: true, },
    label: "ชื่อวันหยุด",
    rules: ([__VLS_ctx.requiredRule]),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
var __VLS_49;
if (__VLS_ctx.schemaConfig?.typeColumnSupported) {
    const __VLS_54 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        cols: "12",
        md: "6",
    }));
    const __VLS_56 = __VLS_55({
        cols: "12",
        md: "6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    const __VLS_58 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        modelValue: (__VLS_ctx.form.holiday_type),
        items: (__VLS_ctx.holidayTypes),
        label: "ประเภทวันหยุด",
        rules: ([__VLS_ctx.requiredRule]),
    }));
    const __VLS_60 = __VLS_59({
        modelValue: (__VLS_ctx.form.holiday_type),
        items: (__VLS_ctx.holidayTypes),
        label: "ประเภทวันหยุด",
        rules: ([__VLS_ctx.requiredRule]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    var __VLS_57;
}
if (__VLS_ctx.schemaConfig?.activeColumnSupported) {
    const __VLS_62 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        cols: "12",
        md: "6",
    }));
    const __VLS_64 = __VLS_63({
        cols: "12",
        md: "6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_65.slots.default;
    const __VLS_66 = {}.VRadioGroup;
    /** @type {[typeof __VLS_components.VRadioGroup, typeof __VLS_components.vRadioGroup, typeof __VLS_components.VRadioGroup, typeof __VLS_components.vRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        modelValue: (__VLS_ctx.form.active),
        label: "สถานะ",
        inline: true,
    }));
    const __VLS_68 = __VLS_67({
        modelValue: (__VLS_ctx.form.active),
        label: "สถานะ",
        inline: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_69.slots.default;
    const __VLS_70 = {}.VRadio;
    /** @type {[typeof __VLS_components.VRadio, typeof __VLS_components.vRadio, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        label: "ใช้งาน",
        value: (true),
    }));
    const __VLS_72 = __VLS_71({
        label: "ใช้งาน",
        value: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const __VLS_74 = {}.VRadio;
    /** @type {[typeof __VLS_components.VRadio, typeof __VLS_components.vRadio, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        label: "ปิดใช้งาน",
        value: (false),
    }));
    const __VLS_76 = __VLS_75({
        label: "ปิดใช้งาน",
        value: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    var __VLS_69;
    var __VLS_65;
}
if (__VLS_ctx.schemaConfig?.noteColumnSupported) {
    const __VLS_78 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        cols: "12",
    }));
    const __VLS_80 = __VLS_79({
        cols: "12",
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    __VLS_81.slots.default;
    const __VLS_82 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        modelValue: (__VLS_ctx.form.note),
        modelModifiers: { trim: true, },
        label: "หมายเหตุ",
        rows: "3",
        autoGrow: true,
    }));
    const __VLS_84 = __VLS_83({
        modelValue: (__VLS_ctx.form.note),
        modelModifiers: { trim: true, },
        label: "หมายเหตุ",
        rows: "3",
        autoGrow: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    var __VLS_81;
}
if (__VLS_ctx.isEditMode) {
    const __VLS_86 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        cols: "12",
    }));
    const __VLS_88 = __VLS_87({
        cols: "12",
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_89.slots.default;
    const __VLS_90 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        modelValue: (__VLS_ctx.editReason),
        modelModifiers: { trim: true, },
        label: "เหตุผลในการแก้ไข",
        rows: "3",
        autoGrow: true,
        rules: ([__VLS_ctx.requiredRule]),
    }));
    const __VLS_92 = __VLS_91({
        modelValue: (__VLS_ctx.editReason),
        modelModifiers: { trim: true, },
        label: "เหตุผลในการแก้ไข",
        rows: "3",
        autoGrow: true,
        rules: ([__VLS_ctx.requiredRule]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    var __VLS_89;
}
var __VLS_37;
const __VLS_94 = {}.VAlert;
/** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    type: "info",
    variant: "tonal",
    ...{ class: "mb-4" },
}));
const __VLS_96 = __VLS_95({
    type: "info",
    variant: "tonal",
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
var __VLS_97;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
const __VLS_98 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    variant: "text",
    to: "/holidays",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_100 = __VLS_99({
    variant: "text",
    to: "/holidays",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
__VLS_101.slots.default;
var __VLS_101;
const __VLS_102 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    color: "primary",
    prependIcon: "mdi-content-save",
    type: "submit",
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
}));
const __VLS_104 = __VLS_103({
    color: "primary",
    prependIcon: "mdi-content-save",
    type: "submit",
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
__VLS_105.slots.default;
var __VLS_105;
var __VLS_27;
var __VLS_23;
var __VLS_19;
const __VLS_106 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    modelValue: (__VLS_ctx.duplicateDialog),
    maxWidth: "520",
}));
const __VLS_108 = __VLS_107({
    modelValue: (__VLS_ctx.duplicateDialog),
    maxWidth: "520",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
const __VLS_110 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({}));
const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
__VLS_113.slots.default;
const __VLS_114 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({}));
const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
var __VLS_117;
const __VLS_118 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({}));
const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
(__VLS_ctx.duplicateHoliday ? __VLS_ctx.formatThaiDate(__VLS_ctx.duplicateHoliday.holiday_date) : '');
(__VLS_ctx.duplicateHoliday?.holiday_name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
var __VLS_121;
const __VLS_122 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({}));
const __VLS_124 = __VLS_123({}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
const __VLS_126 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
const __VLS_130 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    ...{ 'onClick': {} },
    variant: "text",
}));
const __VLS_132 = __VLS_131({
    ...{ 'onClick': {} },
    variant: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
let __VLS_134;
let __VLS_135;
let __VLS_136;
const __VLS_137 = {
    onClick: (...[$event]) => {
        __VLS_ctx.duplicateDialog = false;
    }
};
__VLS_133.slots.default;
var __VLS_133;
const __VLS_138 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "flat",
}));
const __VLS_140 = __VLS_139({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "flat",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
let __VLS_142;
let __VLS_143;
let __VLS_144;
const __VLS_145 = {
    onClick: (__VLS_ctx.confirmDuplicateSave)
};
__VLS_141.slots.default;
var __VLS_141;
var __VLS_125;
var __VLS_113;
var __VLS_109;
const __VLS_146 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    modelValue: (__VLS_ctx.confirmSaveDialog),
    maxWidth: "520",
}));
const __VLS_148 = __VLS_147({
    modelValue: (__VLS_ctx.confirmSaveDialog),
    maxWidth: "520",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
const __VLS_150 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({}));
const __VLS_152 = __VLS_151({}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({}));
const __VLS_156 = __VLS_155({}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
var __VLS_157;
const __VLS_158 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({}));
const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.VAlert;
/** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    type: "warning",
    variant: "tonal",
    ...{ class: "mb-4" },
}));
const __VLS_164 = __VLS_163({
    type: "warning",
    variant: "tonal",
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
var __VLS_165;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.formatThaiDate(__VLS_ctx.form.holiday_date));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.form.holiday_name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preview-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.form.holiday_type);
var __VLS_161;
const __VLS_166 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({}));
const __VLS_168 = __VLS_167({}, ...__VLS_functionalComponentArgsRest(__VLS_167));
__VLS_169.slots.default;
const __VLS_170 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
const __VLS_174 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_176 = __VLS_175({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
let __VLS_178;
let __VLS_179;
let __VLS_180;
const __VLS_181 = {
    onClick: (...[$event]) => {
        __VLS_ctx.confirmSaveDialog = false;
    }
};
__VLS_177.slots.default;
var __VLS_177;
const __VLS_182 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "flat",
    loading: (__VLS_ctx.loading),
}));
const __VLS_184 = __VLS_183({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "flat",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
let __VLS_186;
let __VLS_187;
let __VLS_188;
const __VLS_189 = {
    onClick: (__VLS_ctx.saveHoliday)
};
__VLS_185.slots.default;
var __VLS_185;
var __VLS_169;
var __VLS_153;
var __VLS_149;
const __VLS_190 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
    modelValue: (__VLS_ctx.snackbar),
    color: (__VLS_ctx.snackbarColor),
    timeout: "1800",
}));
const __VLS_192 = __VLS_191({
    modelValue: (__VLS_ctx.snackbar),
    color: (__VLS_ctx.snackbarColor),
    timeout: "1800",
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
__VLS_193.slots.default;
(__VLS_ctx.snackbarMessage);
var __VLS_193;
/** @type {__VLS_StyleScopedClasses['form-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h6']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-row']} */ ;
// @ts-ignore
var __VLS_33 = __VLS_32;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatThaiDate: formatThaiDate,
            holidayTypes: holidayTypes,
            requiredRule: requiredRule,
            minSelectableDate: minSelectableDate,
            maxSelectableDate: maxSelectableDate,
            dateRangeRule: dateRangeRule,
            formRef: formRef,
            formValid: formValid,
            editReason: editReason,
            loading: loading,
            errorMessage: errorMessage,
            snackbar: snackbar,
            snackbarMessage: snackbarMessage,
            snackbarColor: snackbarColor,
            duplicateDialog: duplicateDialog,
            confirmSaveDialog: confirmSaveDialog,
            duplicateHoliday: duplicateHoliday,
            isEditMode: isEditMode,
            originalHoliday: originalHoliday,
            schemaConfig: schemaConfig,
            form: form,
            submitForm: submitForm,
            confirmDuplicateSave: confirmDuplicateSave,
            saveHoliday: saveHoliday,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
