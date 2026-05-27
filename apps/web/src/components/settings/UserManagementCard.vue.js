import { onMounted, onUnmounted, ref } from 'vue';
import { apiErrorMessage } from '../../services/api';
import { createUser, getUsers, updateUser } from '../../services/user.service';
import { formatThaiDateTime } from '../../utils/date';
import UserFormDialog from './UserFormDialog.vue';
const userHeaders = [
    { title: 'ชื่อผู้ใช้งาน', key: 'username', sortable: false },
    { title: 'ชื่อ-สกุล', key: 'full_name', sortable: false },
    { title: 'สิทธิ์', key: 'role', sortable: false },
    { title: 'สถานะ', key: 'active', sortable: false },
    { title: 'Login ล่าสุด', key: 'last_login_at', sortable: false },
    { title: 'จัดการ', key: 'actions', sortable: false, align: 'end' }
];
const roleOptions = [
    { title: 'ผู้ดูแลระบบสูงสุด', value: 'super_admin' },
    { title: 'ผู้ดูแลระบบ', value: 'admin' },
    { title: 'ผู้ใช้งานอ่านข้อมูล', value: 'viewer' }
];
const users = ref([]);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(5);
const keyword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const dialog = ref(false);
const editingUser = ref(null);
const saving = ref(false);
const formError = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
let searchTimeout = null;
function roleLabel(role) {
    return roleOptions.find((item) => item.value === role)?.title ?? role;
}
function roleColor(role) {
    if (role === 'super_admin')
        return 'deep-purple';
    if (role === 'admin')
        return 'primary';
    return 'grey';
}
function openCreateUser() {
    editingUser.value = null;
    formError.value = '';
    dialog.value = true;
}
function openEditUser(user) {
    editingUser.value = user;
    formError.value = '';
    dialog.value = true;
}
function loadFromOptions(options) {
    page.value = options.page;
    itemsPerPage.value = options.itemsPerPage > 0 ? options.itemsPerPage : 50;
    loadUsers();
}
function scheduleLoad() {
    if (searchTimeout)
        window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
        page.value = 1;
        loadUsers();
    }, 350);
}
async function loadUsers() {
    loading.value = true;
    errorMessage.value = '';
    try {
        const limit = itemsPerPage.value;
        const offset = (page.value - 1) * limit;
        const result = await getUsers({ keyword: keyword.value, limit, offset });
        users.value = result.items;
        total.value = result.total;
    }
    catch (error) {
        console.error('Failed to load users', error);
        errorMessage.value = apiErrorMessage(error);
    }
    finally {
        loading.value = false;
    }
}
async function saveUser(input) {
    saving.value = true;
    formError.value = '';
    try {
        if (editingUser.value) {
            await updateUser(editingUser.value.id, input);
            showSnackbar('แก้ไขผู้ใช้งานสำเร็จ', 'success');
        }
        else {
            await createUser(input);
            showSnackbar('เพิ่มผู้ใช้งานสำเร็จ', 'success');
        }
        dialog.value = false;
        await loadUsers();
    }
    catch (error) {
        formError.value = apiErrorMessage(error);
    }
    finally {
        saving.value = false;
    }
}
function showSnackbar(message, color) {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
}
onMounted(loadUsers);
onUnmounted(() => {
    if (searchTimeout)
        window.clearTimeout(searchTimeout);
});
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
__VLS_3.slots.default;
const __VLS_4 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "pa-5 font-weight-bold border-b d-flex align-center" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "pa-5 font-weight-bold border-b d-flex align-center" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    icon: "mdi-account-group-outline",
    ...{ class: "me-2" },
    color: "primary",
}));
const __VLS_10 = __VLS_9({
    icon: "mdi-account-group-outline",
    ...{ class: "me-2" },
    color: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    color: "primary",
    size: "small",
    variant: "tonal",
    prependIcon: "mdi-account-plus",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    color: "primary",
    size: "small",
    variant: "tonal",
    prependIcon: "mdi-account-plus",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.openCreateUser)
};
__VLS_19.slots.default;
var __VLS_19;
var __VLS_7;
const __VLS_24 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "pa-0" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "pa-0" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pa-5 pb-0" },
});
const __VLS_28 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.keyword),
    modelModifiers: { trim: true, },
    label: "ค้นหาผู้ใช้งาน",
    prependInnerIcon: "mdi-account-search",
    clearable: true,
    hideDetails: true,
    density: "compact",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.keyword),
    modelModifiers: { trim: true, },
    label: "ค้นหาผู้ใช้งาน",
    prependInnerIcon: "mdi-account-search",
    clearable: true,
    hideDetails: true,
    density: "compact",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    'onUpdate:modelValue': (__VLS_ctx.scheduleLoad)
};
var __VLS_31;
if (__VLS_ctx.errorMessage) {
    const __VLS_36 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        type: "error",
        variant: "tonal",
        ...{ class: "ma-5 mb-0" },
    }));
    const __VLS_38 = __VLS_37({
        type: "error",
        variant: "tonal",
        ...{ class: "ma-5 mb-0" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_39;
}
const __VLS_40 = {}.VDataTableServer;
/** @type {[typeof __VLS_components.VDataTableServer, typeof __VLS_components.vDataTableServer, typeof __VLS_components.VDataTableServer, typeof __VLS_components.vDataTableServer, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onUpdate:options': {} },
    headers: (__VLS_ctx.userHeaders),
    items: (__VLS_ctx.users),
    loading: (__VLS_ctx.loading),
    itemsLength: (__VLS_ctx.total),
    itemsPerPage: (__VLS_ctx.itemsPerPage),
    page: (__VLS_ctx.page),
    itemValue: "id",
    density: "comfortable",
}));
const __VLS_42 = __VLS_41({
    ...{ 'onUpdate:options': {} },
    headers: (__VLS_ctx.userHeaders),
    items: (__VLS_ctx.users),
    loading: (__VLS_ctx.loading),
    itemsLength: (__VLS_ctx.total),
    itemsPerPage: (__VLS_ctx.itemsPerPage),
    page: (__VLS_ctx.page),
    itemValue: "id",
    density: "comfortable",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    'onUpdate:options': (__VLS_ctx.loadFromOptions)
};
__VLS_43.slots.default;
{
    const { 'item.role': __VLS_thisSlot } = __VLS_43.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_48 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        size: "small",
        color: (__VLS_ctx.roleColor(item.role)),
        variant: "tonal",
    }));
    const __VLS_50 = __VLS_49({
        size: "small",
        color: (__VLS_ctx.roleColor(item.role)),
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    (__VLS_ctx.roleLabel(item.role));
    var __VLS_51;
}
{
    const { 'item.active': __VLS_thisSlot } = __VLS_43.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_52 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        size: "small",
        color: (item.active ? 'success' : 'grey'),
        variant: "flat",
    }));
    const __VLS_54 = __VLS_53({
        size: "small",
        color: (item.active ? 'success' : 'grey'),
        variant: "flat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    (item.active ? 'ใช้งาน' : 'ปิดใช้งาน');
    var __VLS_55;
}
{
    const { 'item.last_login_at': __VLS_thisSlot } = __VLS_43.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-caption" },
    });
    (item.last_login_at ? __VLS_ctx.formatThaiDateTime(item.last_login_at) : '-');
}
{
    const { 'item.actions': __VLS_thisSlot } = __VLS_43.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_56 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        icon: "mdi-pencil",
        variant: "text",
        color: "primary",
        size: "small",
        'aria-label': "แก้ไขผู้ใช้งาน",
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        icon: "mdi-pencil",
        variant: "text",
        color: "primary",
        size: "small",
        'aria-label': "แก้ไขผู้ใช้งาน",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_60;
    let __VLS_61;
    let __VLS_62;
    const __VLS_63 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openEditUser(item);
        }
    };
    var __VLS_59;
}
{
    const { 'no-data': __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_64 = {}.VSheet;
    /** @type {[typeof __VLS_components.VSheet, typeof __VLS_components.vSheet, typeof __VLS_components.VSheet, typeof __VLS_components.vSheet, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ class: "pa-8 text-center" },
    }));
    const __VLS_66 = __VLS_65({
        ...{ class: "pa-8 text-center" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        icon: "mdi-account-off",
        size: "40",
        color: "grey-lighten-1",
        ...{ class: "mb-2" },
    }));
    const __VLS_70 = __VLS_69({
        icon: "mdi-account-off",
        size: "40",
        color: "grey-lighten-1",
        ...{ class: "mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-grey" },
    });
    const __VLS_72 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "text",
        ...{ class: "mt-2" },
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "text",
        ...{ class: "mt-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (__VLS_ctx.loadUsers)
    };
    __VLS_75.slots.default;
    var __VLS_75;
    var __VLS_67;
}
var __VLS_43;
var __VLS_27;
var __VLS_3;
/** @type {[typeof UserFormDialog, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(UserFormDialog, new UserFormDialog({
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.dialog),
    editingUser: (__VLS_ctx.editingUser),
    saving: (__VLS_ctx.saving),
    errorMessage: (__VLS_ctx.formError),
}));
const __VLS_81 = __VLS_80({
    ...{ 'onSave': {} },
    modelValue: (__VLS_ctx.dialog),
    editingUser: (__VLS_ctx.editingUser),
    saving: (__VLS_ctx.saving),
    errorMessage: (__VLS_ctx.formError),
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_83;
let __VLS_84;
let __VLS_85;
const __VLS_86 = {
    onSave: (__VLS_ctx.saveUser)
};
var __VLS_82;
const __VLS_87 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    modelValue: (__VLS_ctx.snackbar),
    color: (__VLS_ctx.snackbarColor),
    timeout: "1800",
}));
const __VLS_89 = __VLS_88({
    modelValue: (__VLS_ctx.snackbar),
    color: (__VLS_ctx.snackbarColor),
    timeout: "1800",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
__VLS_90.slots.default;
(__VLS_ctx.snackbarMessage);
var __VLS_90;
/** @type {__VLS_StyleScopedClasses['h-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-weight-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['ma-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-grey']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatThaiDateTime: formatThaiDateTime,
            UserFormDialog: UserFormDialog,
            userHeaders: userHeaders,
            users: users,
            total: total,
            page: page,
            itemsPerPage: itemsPerPage,
            keyword: keyword,
            loading: loading,
            errorMessage: errorMessage,
            dialog: dialog,
            editingUser: editingUser,
            saving: saving,
            formError: formError,
            snackbar: snackbar,
            snackbarMessage: snackbarMessage,
            snackbarColor: snackbarColor,
            roleLabel: roleLabel,
            roleColor: roleColor,
            openCreateUser: openCreateUser,
            openEditUser: openEditUser,
            loadFromOptions: loadFromOptions,
            scheduleLoad: scheduleLoad,
            loadUsers: loadUsers,
            saveUser: saveUser,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
