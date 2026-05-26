import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { apiErrorMessage } from '../services/api';
import { filterAuditLogs, formatAuditValue, getAuditLogs, getAuditActionColor, listAuditActions } from '../services/audit-log.service';
import { formatThaiDateTime } from '../utils/date';
const headers = [
    { title: 'วันเวลา', key: 'created_at', sortable: true },
    { title: 'ผู้ใช้งาน', key: 'username', sortable: true },
    { title: 'Action', key: 'action', sortable: true },
    { title: 'ตาราง', key: 'target_table', sortable: true },
    { title: 'IP Address', key: 'ip_address', sortable: true },
    { title: 'เหตุผล', key: 'reason', sortable: false },
    { title: 'จัดการ', key: 'actions', sortable: false, align: 'end' }
];
const auditLogs = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const actionOptions = computed(() => listAuditActions(auditLogs.value || []));
const usernameSearch = ref('');
const selectedAction = ref(null);
const startDate = ref('');
const endDate = ref('');
const detailDialog = ref(false);
const selectedLog = ref(null);
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
function formatJson(value) {
    return formatAuditValue(value);
}
function actionColor(action) {
    return getAuditActionColor(action);
}
function openDetail(log) {
    selectedLog.value = log;
    detailDialog.value = true;
}
async function loadAuditLogs() {
    loading.value = true;
    errorMessage.value = '';
    console.log('Fetching audit logs with filters:', {
        username: usernameSearch.value,
        action: selectedAction.value,
        startDate: startDate.value,
        endDate: endDate.value
    });
    try {
        const data = await getAuditLogs({
            username: usernameSearch.value,
            action: selectedAction.value,
            startDate: startDate.value,
            endDate: endDate.value
        });
        console.log('Received audit logs:', data);
        auditLogs.value = data;
    }
    catch (error) {
        console.error('Audit log fetch error:', error);
        errorMessage.value = apiErrorMessage(error);
    }
    finally {
        loading.value = false;
    }
}
let searchTimeout = null;
watch(usernameSearch, () => {
    if (searchTimeout)
        window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(loadAuditLogs, 500);
});
onUnmounted(() => {
    if (searchTimeout)
        window.clearTimeout(searchTimeout);
});
watch([selectedAction, startDate, endDate], loadAuditLogs);
onMounted(loadAuditLogs);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['reason-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['reason-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['json-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['reason-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "audit-heading" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center gap-2" },
});
const __VLS_0 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "tonal",
    prependIcon: "mdi-refresh",
    loading: (__VLS_ctx.loading),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "tonal",
    prependIcon: "mdi-refresh",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.loadAuditLogs)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-shield-search",
}));
const __VLS_10 = __VLS_9({
    color: "secondary",
    variant: "tonal",
    prependIcon: "mdi-shield-search",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
if (__VLS_ctx.loading) {
    const __VLS_12 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        type: "info",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_14 = __VLS_13({
        type: "info",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    var __VLS_15;
}
if (!__VLS_ctx.loading && __VLS_ctx.auditLogs.length > 0) {
    const __VLS_16 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        color: "teal-lighten-5",
        ...{ class: "mb-4 border" },
    }));
    const __VLS_18 = __VLS_17({
        color: "teal-lighten-5",
        ...{ class: "mb-4 border" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "d-flex justify-space-between align-center" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-teal-darken-3" },
    });
    const __VLS_20 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        icon: "mdi-database-check",
        ...{ class: "me-2" },
    }));
    const __VLS_22 = __VLS_21({
        icon: "mdi-database-check",
        ...{ class: "me-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.auditLogs.length);
    if (__VLS_ctx.filteredLogs.length < __VLS_ctx.auditLogs.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "text-caption ms-2" },
        });
        (__VLS_ctx.filteredLogs.length);
    }
    const __VLS_24 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        size: "small",
        color: "teal",
        variant: "flat",
        prependIcon: "mdi-refresh",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        size: "small",
        color: "teal",
        variant: "flat",
        prependIcon: "mdi-refresh",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.loadAuditLogs)
    };
    __VLS_27.slots.default;
    var __VLS_27;
    var __VLS_19;
}
if (__VLS_ctx.errorMessage) {
    const __VLS_32 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_34 = __VLS_33({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_35;
}
if (!__VLS_ctx.loading && __VLS_ctx.auditLogs.length === 0) {
    const __VLS_36 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        type: "info",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_38 = __VLS_37({
        type: "info",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (__VLS_ctx.auditLogs.length);
    var __VLS_39;
}
if (!__VLS_ctx.loading && __VLS_ctx.auditLogs.length > 0 && __VLS_ctx.filteredLogs.length === 0) {
    const __VLS_40 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        type: "warning",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_42 = __VLS_41({
        type: "warning",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (__VLS_ctx.auditLogs.length);
    var __VLS_43;
}
const __VLS_44 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ class: "filter-card" },
}));
const __VLS_46 = __VLS_45({
    ...{ class: "filter-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    cols: "12",
    md: "3",
}));
const __VLS_58 = __VLS_57({
    cols: "12",
    md: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.usernameSearch),
    modelModifiers: { trim: true, },
    label: "ค้นหาผู้ใช้งาน",
    prependInnerIcon: "mdi-account-search",
    clearable: true,
    hideDetails: true,
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.usernameSearch),
    modelModifiers: { trim: true, },
    label: "ค้นหาผู้ใช้งาน",
    prependInnerIcon: "mdi-account-search",
    clearable: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
const __VLS_64 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    cols: "12",
    md: "3",
}));
const __VLS_66 = __VLS_65({
    cols: "12",
    md: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.selectedAction),
    items: (__VLS_ctx.actionOptions),
    label: "Action",
    clearable: true,
    hideDetails: true,
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.selectedAction),
    items: (__VLS_ctx.actionOptions),
    label: "Action",
    clearable: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
const __VLS_72 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    cols: "12",
    md: "3",
}));
const __VLS_74 = __VLS_73({
    cols: "12",
    md: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.startDate),
    label: "จากวันที่",
    type: "date",
    hideDetails: true,
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.startDate),
    label: "จากวันที่",
    type: "date",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
var __VLS_75;
const __VLS_80 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    cols: "12",
    md: "3",
}));
const __VLS_82 = __VLS_81({
    cols: "12",
    md: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.endDate),
    label: "ถึงวันที่",
    type: "date",
    hideDetails: true,
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.endDate),
    label: "ถึงวันที่",
    type: "date",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_83;
var __VLS_55;
var __VLS_51;
var __VLS_47;
const __VLS_88 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    ...{ class: "mt-4" },
}));
const __VLS_90 = __VLS_89({
    ...{ class: "mt-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.VDataTable;
/** @type {[typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.filteredLogs),
    loading: (__VLS_ctx.loading),
    itemsPerPage: (10),
    itemValue: "id",
    ...{ class: "elevation-0" },
}));
const __VLS_94 = __VLS_93({
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.filteredLogs),
    loading: (__VLS_ctx.loading),
    itemsPerPage: (10),
    itemValue: "id",
    ...{ class: "elevation-0" },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
{
    const { 'item.created_at': __VLS_thisSlot } = __VLS_95.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatThaiDateTime(item.created_at));
}
{
    const { 'item.action': __VLS_thisSlot } = __VLS_95.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_96 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        color: (__VLS_ctx.actionColor(item.action)),
        size: "small",
        variant: "tonal",
    }));
    const __VLS_98 = __VLS_97({
        color: (__VLS_ctx.actionColor(item.action)),
        size: "small",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    (item.action);
    var __VLS_99;
}
{
    const { 'item.reason': __VLS_thisSlot } = __VLS_95.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "reason-text" },
    });
    (item.reason || '-');
}
{
    const { 'item.actions': __VLS_thisSlot } = __VLS_95.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_100 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        ...{ 'onClick': {} },
        icon: "mdi-eye",
        variant: "text",
        color: "primary",
    }));
    const __VLS_102 = __VLS_101({
        ...{ 'onClick': {} },
        icon: "mdi-eye",
        variant: "text",
        color: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    let __VLS_104;
    let __VLS_105;
    let __VLS_106;
    const __VLS_107 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openDetail(item);
        }
    };
    var __VLS_103;
}
{
    const { 'no-data': __VLS_thisSlot } = __VLS_95.slots;
    const __VLS_108 = {}.VSheet;
    /** @type {[typeof __VLS_components.VSheet, typeof __VLS_components.vSheet, typeof __VLS_components.VSheet, typeof __VLS_components.vSheet, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        ...{ class: "pa-12 text-center" },
    }));
    const __VLS_110 = __VLS_109({
        ...{ class: "pa-12 text-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    const __VLS_112 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        icon: "mdi-database-off",
        size: "48",
        color: "grey-lighten-1",
        ...{ class: "mb-2" },
    }));
    const __VLS_114 = __VLS_113({
        icon: "mdi-database-off",
        size: "48",
        color: "grey-lighten-1",
        ...{ class: "mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-grey" },
    });
    const __VLS_116 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "text",
        ...{ class: "mt-2" },
    }));
    const __VLS_118 = __VLS_117({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "text",
        ...{ class: "mt-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    let __VLS_120;
    let __VLS_121;
    let __VLS_122;
    const __VLS_123 = {
        onClick: (__VLS_ctx.loadAuditLogs)
    };
    __VLS_119.slots.default;
    var __VLS_119;
    var __VLS_111;
}
var __VLS_95;
var __VLS_91;
if (!__VLS_ctx.loading && __VLS_ctx.filteredLogs.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-h6 mb-2" },
    });
    for (const [log] of __VLS_getVForSourceType((__VLS_ctx.filteredLogs.slice(0, 5)))) {
        const __VLS_124 = {}.VCard;
        /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
            key: (log.id),
            ...{ class: "mb-2 pa-3 border-dashed" },
        }));
        const __VLS_126 = __VLS_125({
            key: (log.id),
            ...{ class: "mb-2 pa-3 border-dashed" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        __VLS_127.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "d-flex justify-space-between align-center" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (log.username);
        const __VLS_128 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
            color: (__VLS_ctx.actionColor(log.action)),
            size: "x-small",
        }));
        const __VLS_130 = __VLS_129({
            color: (__VLS_ctx.actionColor(log.action)),
            size: "x-small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_129));
        __VLS_131.slots.default;
        (log.action);
        var __VLS_131;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-caption mt-1" },
        });
        (__VLS_ctx.formatThaiDateTime(log.created_at));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-body-2 mt-1" },
        });
        (log.reason);
        const __VLS_132 = {}.VBtn;
        /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            ...{ 'onClick': {} },
            block: true,
            size: "small",
            variant: "tonal",
            ...{ class: "mt-2" },
        }));
        const __VLS_134 = __VLS_133({
            ...{ 'onClick': {} },
            block: true,
            size: "small",
            variant: "tonal",
            ...{ class: "mt-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        let __VLS_136;
        let __VLS_137;
        let __VLS_138;
        const __VLS_139 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.loading && __VLS_ctx.filteredLogs.length > 0))
                    return;
                __VLS_ctx.openDetail(log);
            }
        };
        __VLS_135.slots.default;
        var __VLS_135;
        var __VLS_127;
    }
}
const __VLS_140 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.detailDialog),
    maxWidth: "760",
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.detailDialog),
    maxWidth: "760",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
if (__VLS_ctx.selectedLog) {
    const __VLS_144 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    const __VLS_148 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
    const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_151.slots.default;
    var __VLS_151;
    const __VLS_152 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
    const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
    __VLS_155.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedLog.full_name ? `${__VLS_ctx.selectedLog.username} (${__VLS_ctx.selectedLog.full_name})` : __VLS_ctx.selectedLog.username);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatThaiDateTime(__VLS_ctx.selectedLog.created_at));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedLog.ip_address);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedLog.user_agent || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_156 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        color: (__VLS_ctx.actionColor(__VLS_ctx.selectedLog.action)),
        size: "small",
        variant: "tonal",
    }));
    const __VLS_158 = __VLS_157({
        color: (__VLS_ctx.actionColor(__VLS_ctx.selectedLog.action)),
        size: "small",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    (__VLS_ctx.selectedLog.action);
    var __VLS_159;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedLog.target_table);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedLog.target_id);
    const __VLS_160 = {}.VRow;
    /** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ class: "mt-4" },
    }));
    const __VLS_162 = __VLS_161({
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    const __VLS_164 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        cols: "12",
        md: "6",
    }));
    const __VLS_166 = __VLS_165({
        cols: "12",
        md: "6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "json-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "json-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (__VLS_ctx.formatJson(__VLS_ctx.selectedLog.old_value));
    var __VLS_167;
    const __VLS_168 = {}.VCol;
    /** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        cols: "12",
        md: "6",
    }));
    const __VLS_170 = __VLS_169({
        cols: "12",
        md: "6",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "json-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "json-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (__VLS_ctx.formatJson(__VLS_ctx.selectedLog.new_value));
    var __VLS_171;
    var __VLS_163;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "reason-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.selectedLog.reason || '-');
    var __VLS_155;
    const __VLS_172 = {}.VCardActions;
    /** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
    const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    const __VLS_176 = {}.VSpacer;
    /** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
    const __VLS_180 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "flat",
    }));
    const __VLS_182 = __VLS_181({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "flat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    let __VLS_184;
    let __VLS_185;
    let __VLS_186;
    const __VLS_187 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.selectedLog))
                return;
            __VLS_ctx.detailDialog = false;
        }
    };
    __VLS_183.slots.default;
    var __VLS_183;
    var __VLS_175;
    var __VLS_147;
}
var __VLS_143;
/** @type {__VLS_StyleScopedClasses['audit-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-darken-3']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['ms-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['elevation-0']} */ ;
/** @type {__VLS_StyleScopedClasses['reason-text']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-12']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-grey']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['json-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['json-title']} */ ;
/** @type {__VLS_StyleScopedClasses['json-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['json-title']} */ ;
/** @type {__VLS_StyleScopedClasses['reason-panel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatThaiDateTime: formatThaiDateTime,
            headers: headers,
            auditLogs: auditLogs,
            loading: loading,
            errorMessage: errorMessage,
            actionOptions: actionOptions,
            usernameSearch: usernameSearch,
            selectedAction: selectedAction,
            startDate: startDate,
            endDate: endDate,
            detailDialog: detailDialog,
            selectedLog: selectedLog,
            filteredLogs: filteredLogs,
            formatJson: formatJson,
            actionColor: actionColor,
            openDetail: openDetail,
            loadAuditLogs: loadAuditLogs,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
