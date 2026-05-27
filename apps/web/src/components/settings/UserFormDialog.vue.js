import { reactive, watch } from 'vue';
import { ref } from 'vue';
const props = defineProps();
const emit = defineEmits();
const formRef = ref(null);
const form = reactive({
    username: '',
    full_name: '',
    role: 'viewer',
    active: true,
    password: ''
});
const roleOptions = [
    { title: 'ผู้ดูแลระบบสูงสุด', value: 'super_admin' },
    { title: 'ผู้ดูแลระบบ', value: 'admin' },
    { title: 'ผู้ใช้งานอ่านข้อมูล', value: 'viewer' }
];
const requiredRule = (value) => Boolean(value) || 'กรุณากรอกข้อมูล';
const usernameRule = (value) => /^[a-zA-Z0-9._-]{3,80}$/.test(value) || 'ใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง และขีดล่าง อย่างน้อย 3 ตัวอักษร';
const passwordRule = (value) => value.length >= 8 || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
const optionalPasswordRule = (value) => !value || value.length >= 8 || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
watch(() => [props.modelValue, props.editingUser], () => {
    if (!props.modelValue)
        return;
    form.username = props.editingUser?.username ?? '';
    form.full_name = props.editingUser?.full_name ?? '';
    form.role = props.editingUser?.role ?? 'viewer';
    form.active = props.editingUser?.active ?? true;
    form.password = '';
}, { immediate: true });
async function submit() {
    const validation = await formRef.value?.validate();
    if (!validation?.valid)
        return;
    if (props.editingUser) {
        emit('save', {
            full_name: form.full_name,
            role: form.role,
            active: form.active,
            password: form.password || undefined
        });
        return;
    }
    emit('save', {
        username: form.username,
        full_name: form.full_name,
        role: form.role,
        active: form.active,
        password: form.password
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    maxWidth: "560",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    maxWidth: "560",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.emit('update:modelValue', $event);
    }
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "d-flex align-center" },
}));
const __VLS_15 = __VLS_14({
    ...{ class: "d-flex align-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    icon: (__VLS_ctx.editingUser ? 'mdi-account-edit' : 'mdi-account-plus'),
    color: "primary",
    ...{ class: "me-2" },
}));
const __VLS_19 = __VLS_18({
    icon: (__VLS_ctx.editingUser ? 'mdi-account-edit' : 'mdi-account-plus'),
    color: "primary",
    ...{ class: "me-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
(__VLS_ctx.editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน');
const __VLS_21 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const __VLS_25 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onClick': {} },
    icon: "mdi-close",
    variant: "text",
    size: "small",
}));
const __VLS_27 = __VLS_26({
    ...{ 'onClick': {} },
    icon: "mdi-close",
    variant: "text",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emit('update:modelValue', false);
    }
};
var __VLS_28;
var __VLS_16;
const __VLS_33 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
if (__VLS_ctx.errorMessage) {
    const __VLS_37 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }));
    const __VLS_39 = __VLS_38({
        type: "error",
        variant: "tonal",
        ...{ class: "mb-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_40;
}
const __VLS_41 = {}.VForm;
/** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    ...{ 'onSubmit': {} },
    ref: "formRef",
}));
const __VLS_43 = __VLS_42({
    ...{ 'onSubmit': {} },
    ref: "formRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_45;
let __VLS_46;
let __VLS_47;
const __VLS_48 = {
    onSubmit: (__VLS_ctx.submit)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_49 = {};
__VLS_44.slots.default;
const __VLS_51 = {}.VRow;
/** @type {[typeof __VLS_components.VRow, typeof __VLS_components.vRow, typeof __VLS_components.VRow, typeof __VLS_components.vRow, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
__VLS_54.slots.default;
const __VLS_55 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    cols: "12",
    md: "6",
}));
const __VLS_57 = __VLS_56({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
__VLS_58.slots.default;
const __VLS_59 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    modelValue: (__VLS_ctx.form.username),
    modelModifiers: { trim: true, },
    label: "ชื่อผู้ใช้งาน",
    prependInnerIcon: "mdi-account",
    disabled: (Boolean(__VLS_ctx.editingUser)),
    rules: ([__VLS_ctx.requiredRule, __VLS_ctx.usernameRule]),
}));
const __VLS_61 = __VLS_60({
    modelValue: (__VLS_ctx.form.username),
    modelModifiers: { trim: true, },
    label: "ชื่อผู้ใช้งาน",
    prependInnerIcon: "mdi-account",
    disabled: (Boolean(__VLS_ctx.editingUser)),
    rules: ([__VLS_ctx.requiredRule, __VLS_ctx.usernameRule]),
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
var __VLS_58;
const __VLS_63 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    cols: "12",
    md: "6",
}));
const __VLS_65 = __VLS_64({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
__VLS_66.slots.default;
const __VLS_67 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    modelValue: (__VLS_ctx.form.full_name),
    modelModifiers: { trim: true, },
    label: "ชื่อ-สกุล",
    prependInnerIcon: "mdi-card-account-details-outline",
    rules: ([__VLS_ctx.requiredRule]),
}));
const __VLS_69 = __VLS_68({
    modelValue: (__VLS_ctx.form.full_name),
    modelModifiers: { trim: true, },
    label: "ชื่อ-สกุล",
    prependInnerIcon: "mdi-card-account-details-outline",
    rules: ([__VLS_ctx.requiredRule]),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
var __VLS_66;
const __VLS_71 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    cols: "12",
    md: "6",
}));
const __VLS_73 = __VLS_72({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
__VLS_74.slots.default;
const __VLS_75 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    modelValue: (__VLS_ctx.form.role),
    items: (__VLS_ctx.roleOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "สิทธิ์การใช้งาน",
    prependInnerIcon: "mdi-shield-account",
    rules: ([__VLS_ctx.requiredRule]),
}));
const __VLS_77 = __VLS_76({
    modelValue: (__VLS_ctx.form.role),
    items: (__VLS_ctx.roleOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "สิทธิ์การใช้งาน",
    prependInnerIcon: "mdi-shield-account",
    rules: ([__VLS_ctx.requiredRule]),
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
var __VLS_74;
const __VLS_79 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    cols: "12",
    md: "6",
}));
const __VLS_81 = __VLS_80({
    cols: "12",
    md: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
__VLS_82.slots.default;
const __VLS_83 = {}.VSwitch;
/** @type {[typeof __VLS_components.VSwitch, typeof __VLS_components.vSwitch, ]} */ ;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
    modelValue: (__VLS_ctx.form.active),
    color: "success",
    inset: true,
    hideDetails: true,
    label: (__VLS_ctx.form.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'),
}));
const __VLS_85 = __VLS_84({
    modelValue: (__VLS_ctx.form.active),
    color: "success",
    inset: true,
    hideDetails: true,
    label: (__VLS_ctx.form.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'),
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
var __VLS_82;
const __VLS_87 = {}.VCol;
/** @type {[typeof __VLS_components.VCol, typeof __VLS_components.vCol, typeof __VLS_components.VCol, typeof __VLS_components.vCol, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    cols: "12",
}));
const __VLS_89 = __VLS_88({
    cols: "12",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
__VLS_90.slots.default;
const __VLS_91 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    modelValue: (__VLS_ctx.form.password),
    label: (__VLS_ctx.editingUser ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน'),
    prependInnerIcon: "mdi-lock",
    type: "password",
    autocomplete: "new-password",
    rules: (__VLS_ctx.editingUser ? [__VLS_ctx.optionalPasswordRule] : [__VLS_ctx.requiredRule, __VLS_ctx.passwordRule]),
}));
const __VLS_93 = __VLS_92({
    modelValue: (__VLS_ctx.form.password),
    label: (__VLS_ctx.editingUser ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน'),
    prependInnerIcon: "mdi-lock",
    type: "password",
    autocomplete: "new-password",
    rules: (__VLS_ctx.editingUser ? [__VLS_ctx.optionalPasswordRule] : [__VLS_ctx.requiredRule, __VLS_ctx.passwordRule]),
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
var __VLS_90;
var __VLS_54;
var __VLS_44;
var __VLS_36;
const __VLS_95 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
    ...{ class: "pa-4" },
}));
const __VLS_97 = __VLS_96({
    ...{ class: "pa-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
__VLS_98.slots.default;
const __VLS_99 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({}));
const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const __VLS_103 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.saving),
}));
const __VLS_105 = __VLS_104({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
let __VLS_107;
let __VLS_108;
let __VLS_109;
const __VLS_110 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emit('update:modelValue', false);
    }
};
__VLS_106.slots.default;
var __VLS_106;
const __VLS_111 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "flat",
    loading: (__VLS_ctx.saving),
}));
const __VLS_113 = __VLS_112({
    ...{ 'onClick': {} },
    color: "primary",
    variant: "flat",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
let __VLS_115;
let __VLS_116;
let __VLS_117;
const __VLS_118 = {
    onClick: (__VLS_ctx.submit)
};
__VLS_114.slots.default;
var __VLS_114;
var __VLS_98;
var __VLS_12;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-4']} */ ;
// @ts-ignore
var __VLS_50 = __VLS_49;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            formRef: formRef,
            form: form,
            roleOptions: roleOptions,
            requiredRule: requiredRule,
            usernameRule: usernameRule,
            passwordRule: passwordRule,
            optionalPasswordRule: optionalPasswordRule,
            submit: submit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
