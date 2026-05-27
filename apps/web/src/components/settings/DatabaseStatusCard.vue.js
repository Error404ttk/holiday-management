import { computed } from 'vue';
const props = defineProps();
const allDatabasesOk = computed(() => {
    return Boolean(props.settings?.hosxpDatabase.status.ok && props.settings?.appDatabase.status.ok);
});
function statusColor(ok) {
    return ok ? 'success' : 'error';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "h-100 rounded-lg" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "h-100 rounded-lg" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "pa-5 font-weight-bold border-b d-flex align-center" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "pa-5 font-weight-bold border-b d-flex align-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    icon: "mdi-database-settings",
    ...{ class: "me-2" },
    color: "primary",
}));
const __VLS_11 = __VLS_10({
    icon: "mdi-database-settings",
    ...{ class: "me-2" },
    color: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
var __VLS_8;
const __VLS_13 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "pa-5" },
}));
const __VLS_15 = __VLS_14({
    ...{ class: "pa-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
if (__VLS_ctx.loading && !__VLS_ctx.settings) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-center py-8" },
    });
    const __VLS_17 = {}.VProgressCircular;
    /** @type {[typeof __VLS_components.VProgressCircular, typeof __VLS_components.vProgressCircular, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        indeterminate: true,
        color: "primary",
        size: "28",
    }));
    const __VLS_19 = __VLS_18({
        indeterminate: true,
        color: "primary",
        size: "28",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
}
else if (__VLS_ctx.settings) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-group mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-overline text-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2 font-weight-bold" },
    });
    (__VLS_ctx.settings.hosxpDatabase.host);
    (__VLS_ctx.settings.hosxpDatabase.port);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2 font-weight-bold" },
    });
    (__VLS_ctx.settings.hosxpDatabase.database);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2" },
    });
    const __VLS_21 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        size: "small",
        color: (__VLS_ctx.statusColor(__VLS_ctx.settings.hosxpDatabase.status.ok)),
        variant: "flat",
    }));
    const __VLS_23 = __VLS_22({
        size: "small",
        color: (__VLS_ctx.statusColor(__VLS_ctx.settings.hosxpDatabase.status.ok)),
        variant: "flat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    (__VLS_ctx.settings.hosxpDatabase.status.message);
    var __VLS_24;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-overline text-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2 font-weight-bold" },
    });
    (__VLS_ctx.settings.appDatabase.host);
    (__VLS_ctx.settings.appDatabase.port);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2 font-weight-bold" },
    });
    (__VLS_ctx.settings.appDatabase.database);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-body-2" },
    });
    const __VLS_25 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        size: "small",
        color: (__VLS_ctx.statusColor(__VLS_ctx.settings.appDatabase.status.ok)),
        variant: "flat",
    }));
    const __VLS_27 = __VLS_26({
        size: "small",
        color: (__VLS_ctx.statusColor(__VLS_ctx.settings.appDatabase.status.ok)),
        variant: "flat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    (__VLS_ctx.settings.appDatabase.status.message);
    var __VLS_28;
    const __VLS_29 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        type: (__VLS_ctx.allDatabasesOk ? 'success' : 'warning'),
        variant: "tonal",
        density: "compact",
        icon: (__VLS_ctx.allDatabasesOk ? 'mdi-check-circle-outline' : 'mdi-alert-outline'),
        ...{ class: "mt-6 text-caption" },
    }));
    const __VLS_31 = __VLS_30({
        type: (__VLS_ctx.allDatabasesOk ? 'success' : 'warning'),
        variant: "tonal",
        density: "compact",
        icon: (__VLS_ctx.allDatabasesOk ? 'mdi-check-circle-outline' : 'mdi-alert-outline'),
        ...{ class: "mt-6 text-caption" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    (__VLS_ctx.allDatabasesOk ? 'ฐานข้อมูลพร้อมใช้งาน' : 'พบการเชื่อมต่อที่ต้องตรวจสอบ');
    var __VLS_32;
}
var __VLS_16;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['h-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['info-group']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-overline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['info-group']} */ ;
/** @type {__VLS_StyleScopedClasses['text-overline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-body-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            allDatabasesOk: allDatabasesOk,
            statusColor: statusColor,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
