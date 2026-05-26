import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiErrorMessage } from '../services/api';
import { login } from '../services/auth.service';
import { getVersionDate } from '../utils/date';
const router = useRouter();
const route = useRoute();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
async function submitLogin() {
    loading.value = true;
    errorMessage.value = '';
    try {
        await login(username.value, password.value);
        router.push(String(route.query.redirect || '/'));
    }
    catch (error) {
        errorMessage.value = apiErrorMessage(error);
    }
    finally {
        loading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VMain;
/** @type {[typeof __VLS_components.VMain, typeof __VLS_components.vMain, typeof __VLS_components.VMain, typeof __VLS_components.vMain, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-wrap" },
});
const __VLS_5 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "login-card" },
    elevation: "4",
}));
const __VLS_7 = __VLS_6({
    ...{ class: "login-card" },
    elevation: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ class: "text-h5 font-weight-bold text-center pt-6" },
}));
const __VLS_11 = __VLS_10({
    ...{ class: "text-h5 font-weight-bold text-center pt-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
var __VLS_12;
const __VLS_13 = {}.VCardSubtitle;
/** @type {[typeof __VLS_components.VCardSubtitle, typeof __VLS_components.vCardSubtitle, typeof __VLS_components.VCardSubtitle, typeof __VLS_components.vCardSubtitle, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "text-center" },
}));
const __VLS_15 = __VLS_14({
    ...{ class: "text-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
var __VLS_16;
const __VLS_17 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "pa-6" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "pa-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
if (__VLS_ctx.errorMessage) {
    const __VLS_21 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_23 = __VLS_22({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_24;
}
const __VLS_25 = {}.VForm;
/** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onSubmit': {} },
}));
const __VLS_27 = __VLS_26({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onSubmit: (__VLS_ctx.submitLogin)
};
__VLS_28.slots.default;
const __VLS_33 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    modelValue: (__VLS_ctx.username),
    modelModifiers: { trim: true, },
    label: "ชื่อผู้ใช้งาน",
    prependInnerIcon: "mdi-account",
    variant: "outlined",
}));
const __VLS_35 = __VLS_34({
    modelValue: (__VLS_ctx.username),
    modelModifiers: { trim: true, },
    label: "ชื่อผู้ใช้งาน",
    prependInnerIcon: "mdi-account",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    modelValue: (__VLS_ctx.password),
    label: "รหัสผ่าน",
    prependInnerIcon: "mdi-lock",
    type: "password",
    variant: "outlined",
}));
const __VLS_39 = __VLS_38({
    modelValue: (__VLS_ctx.password),
    label: "รหัสผ่าน",
    prependInnerIcon: "mdi-lock",
    type: "password",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const __VLS_41 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    block: true,
    color: "primary",
    size: "large",
    type: "submit",
    loading: (__VLS_ctx.loading),
    elevation: "1",
    ...{ class: "mt-2" },
}));
const __VLS_43 = __VLS_42({
    block: true,
    color: "primary",
    size: "large",
    type: "submit",
    loading: (__VLS_ctx.loading),
    elevation: "1",
    ...{ class: "mt-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
__VLS_44.slots.default;
var __VLS_44;
var __VLS_28;
var __VLS_20;
var __VLS_8;
const __VLS_45 = {}.VFooter;
/** @type {[typeof __VLS_components.VFooter, typeof __VLS_components.vFooter, typeof __VLS_components.VFooter, typeof __VLS_components.vFooter, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    app: true,
    border: true,
    ...{ class: "login-footer text-slate-500 text-caption bg-transparent" },
}));
const __VLS_47 = __VLS_46({
    app: true,
    border: true,
    ...{ class: "login-footer text-slate-500 text-caption bg-transparent" },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex w-100 align-center px-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(new Date().getFullYear());
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
const __VLS_49 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({}));
const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-center gap-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "d-none d-sm-inline" },
});
const __VLS_53 = {}.VDivider;
/** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    vertical: true,
    ...{ class: "mx-2 my-2 d-none d-sm-inline" },
}));
const __VLS_55 = __VLS_54({
    vertical: true,
    ...{ class: "mx-2 my-2 d-none d-sm-inline" },
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.getVersionDate());
var __VLS_48;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['login-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
/** @type {__VLS_StyleScopedClasses['text-h5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['login-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-100']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['d-none']} */ ;
/** @type {__VLS_StyleScopedClasses['d-sm-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
/** @type {__VLS_StyleScopedClasses['my-2']} */ ;
/** @type {__VLS_StyleScopedClasses['d-none']} */ ;
/** @type {__VLS_StyleScopedClasses['d-sm-inline']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getVersionDate: getVersionDate,
            username: username,
            password: password,
            loading: loading,
            errorMessage: errorMessage,
            submitLogin: submitLogin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
