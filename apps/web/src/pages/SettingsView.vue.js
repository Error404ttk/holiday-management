import { computed, onMounted, ref } from 'vue';
import DatabaseStatusCard from '../components/settings/DatabaseStatusCard.vue';
import SchemaStatusCard from '../components/settings/SchemaStatusCard.vue';
import SystemInfoCard from '../components/settings/SystemInfoCard.vue';
import UserManagementCard from '../components/settings/UserManagementCard.vue';
import '../components/settings/settings-card.css';
import { apiErrorMessage } from '../services/api';
import { getSettingsStatus } from '../services/settings.service';
import { getVersionDate } from '../utils/date';
const settings = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const versionDate = computed(() => getVersionDate());
async function loadSettings() {
    loading.value = true;
    errorMessage.value = '';
    try {
        settings.value = await getSettingsStatus();
    }
    catch (error) {
        console.error('Failed to load settings', error);
        errorMessage.value = apiErrorMessage(error);
    }
    finally {
        loading.value = false;
    }
}
onMounted(loadSettings);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "settings-page pb-10" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-header mb-8" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center gap-3 mb-1" },
});
const __VLS_0 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    icon: "mdi-cog-outline",
    color: "primary",
    size: "32",
}));
const __VLS_2 = __VLS_1({
    icon: "mdi-cog-outline",
    color: "primary",
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "text-h4 font-weight-bold text-slate-900 mb-0" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex flex-wrap align-center justify-space-between ga-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-body-1 text-slate-500 mb-0" },
});
const __VLS_4 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "tonal",
    prependIcon: "mdi-refresh",
    loading: (__VLS_ctx.loading),
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "tonal",
    prependIcon: "mdi-refresh",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.loadSettings)
};
__VLS_7.slots.default;
var __VLS_7;
if (__VLS_ctx.errorMessage) {
    const __VLS_12 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        type: "error",
        variant: "tonal",
        icon: "mdi-alert-circle-outline",
        ...{ class: "mb-5" },
    }));
    const __VLS_14 = __VLS_13({
        type: "error",
        variant: "tonal",
        icon: "mdi-alert-circle-outline",
        ...{ class: "mb-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_15;
}
const __VLS_16 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    cols: "12",
    md: "6",
}));
const __VLS_22 = __VLS_21({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
/** @type {[typeof DatabaseStatusCard, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(DatabaseStatusCard, new DatabaseStatusCard({
    settings: (__VLS_ctx.settings),
    loading: (__VLS_ctx.loading),
}));
const __VLS_25 = __VLS_24({
    settings: (__VLS_ctx.settings),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
var __VLS_23;
const __VLS_27 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    cols: "12",
    md: "6",
}));
const __VLS_29 = __VLS_28({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
__VLS_30.slots.default;
/** @type {[typeof SchemaStatusCard, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(SchemaStatusCard, new SchemaStatusCard({
    settings: (__VLS_ctx.settings),
}));
const __VLS_32 = __VLS_31({
    settings: (__VLS_ctx.settings),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
var __VLS_30;
const __VLS_34 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    cols: "12",
    md: "6",
}));
const __VLS_36 = __VLS_35({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
/** @type {[typeof UserManagementCard, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(UserManagementCard, new UserManagementCard({}));
const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
var __VLS_37;
const __VLS_41 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    cols: "12",
    md: "6",
}));
const __VLS_43 = __VLS_42({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
/** @type {[typeof SystemInfoCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(SystemInfoCard, new SystemInfoCard({
    settings: (__VLS_ctx.settings),
    versionDate: (__VLS_ctx.versionDate),
}));
const __VLS_46 = __VLS_45({
    settings: (__VLS_ctx.settings),
    versionDate: (__VLS_ctx.versionDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_44;
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['settings-page']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-10']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['ga-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DatabaseStatusCard: DatabaseStatusCard,
            SchemaStatusCard: SchemaStatusCard,
            SystemInfoCard: SystemInfoCard,
            UserManagementCard: UserManagementCard,
            settings: settings,
            loading: loading,
            errorMessage: errorMessage,
            versionDate: versionDate,
            loadSettings: loadSettings,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
