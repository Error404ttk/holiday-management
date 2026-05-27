<template>
  <v-card class="h-100 rounded-lg">
    <v-card-title class="pa-5 font-weight-bold border-b d-flex align-center">
      <v-icon icon="mdi-account-group-outline" class="me-2" color="primary" />
      การจัดการผู้ใช้งาน
      <v-spacer />
      <v-btn color="primary" size="small" variant="tonal" prepend-icon="mdi-account-plus" @click="openCreateUser">
        เพิ่มผู้ใช้งาน
      </v-btn>
    </v-card-title>
    <v-card-text class="pa-0">
      <div class="pa-5 pb-0">
        <v-text-field
          v-model.trim="keyword"
          label="ค้นหาผู้ใช้งาน"
          prepend-inner-icon="mdi-account-search"
          clearable
          hide-details
          density="compact"
          @update:model-value="scheduleLoad"
        />
      </div>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="ma-5 mb-0">
        {{ errorMessage }}
      </v-alert>

      <v-data-table-server
        :headers="userHeaders"
        :items="users"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        item-value="id"
        density="comfortable"
        @update:options="loadFromOptions"
      >
        <template #item.role="{ item }">
          <v-chip size="small" :color="roleColor(item.role)" variant="tonal">
            {{ roleLabel(item.role) }}
          </v-chip>
        </template>

        <template #item.active="{ item }">
          <v-chip size="small" :color="item.active ? 'success' : 'grey'" variant="flat">
            {{ item.active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
          </v-chip>
        </template>

        <template #item.last_login_at="{ item }">
          <span class="text-caption">{{ item.last_login_at ? formatThaiDateTime(item.last_login_at) : '-' }}</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            color="primary"
            size="small"
            aria-label="แก้ไขผู้ใช้งาน"
            @click="openEditUser(item)"
          />
        </template>

        <template #no-data>
          <v-sheet class="pa-8 text-center">
            <v-icon icon="mdi-account-off" size="40" color="grey-lighten-1" class="mb-2" />
            <div class="text-grey">ไม่พบผู้ใช้งาน</div>
            <v-btn color="primary" variant="text" class="mt-2" @click="loadUsers">โหลดใหม่</v-btn>
          </v-sheet>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>

  <UserFormDialog
    v-model="dialog"
    :editing-user="editingUser"
    :saving="saving"
    :error-message="formError"
    @save="saveUser"
  />

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="1800">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { apiErrorMessage } from '../../services/api';
import {
  createUser,
  getUsers,
  updateUser,
  type CreateUserInput,
  type ManagedUser,
  type UpdateUserInput
} from '../../services/user.service';
import type { Role } from '../../types/auth';
import { formatThaiDateTime } from '../../utils/date';
import UserFormDialog from './UserFormDialog.vue';

const userHeaders = [
  { title: 'ชื่อผู้ใช้งาน', key: 'username', sortable: false },
  { title: 'ชื่อ-สกุล', key: 'full_name', sortable: false },
  { title: 'สิทธิ์', key: 'role', sortable: false },
  { title: 'สถานะ', key: 'active', sortable: false },
  { title: 'Login ล่าสุด', key: 'last_login_at', sortable: false },
  { title: 'จัดการ', key: 'actions', sortable: false, align: 'end' as const }
];

const roleOptions = [
  { title: 'ผู้ดูแลระบบสูงสุด', value: 'super_admin' },
  { title: 'ผู้ดูแลระบบ', value: 'admin' },
  { title: 'ผู้ใช้งานอ่านข้อมูล', value: 'viewer' }
];

const users = ref<ManagedUser[]>([]);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(5);
const keyword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const dialog = ref(false);
const editingUser = ref<ManagedUser | null>(null);
const saving = ref(false);
const formError = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error'>('success');
let searchTimeout: number | null = null;

function roleLabel(role: Role) {
  return roleOptions.find((item) => item.value === role)?.title ?? role;
}

function roleColor(role: Role) {
  if (role === 'super_admin') return 'deep-purple';
  if (role === 'admin') return 'primary';
  return 'grey';
}

function openCreateUser() {
  editingUser.value = null;
  formError.value = '';
  dialog.value = true;
}

function openEditUser(user: ManagedUser) {
  editingUser.value = user;
  formError.value = '';
  dialog.value = true;
}

function loadFromOptions(options: { page: number; itemsPerPage: number }) {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage > 0 ? options.itemsPerPage : 50;
  loadUsers();
}

function scheduleLoad() {
  if (searchTimeout) window.clearTimeout(searchTimeout);
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
  } catch (error) {
    console.error('Failed to load users', error);
    errorMessage.value = apiErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

async function saveUser(input: CreateUserInput | UpdateUserInput) {
  saving.value = true;
  formError.value = '';
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, input as UpdateUserInput);
      showSnackbar('แก้ไขผู้ใช้งานสำเร็จ', 'success');
    } else {
      await createUser(input as CreateUserInput);
      showSnackbar('เพิ่มผู้ใช้งานสำเร็จ', 'success');
    }

    dialog.value = false;
    await loadUsers();
  } catch (error) {
    formError.value = apiErrorMessage(error);
  } finally {
    saving.value = false;
  }
}

function showSnackbar(message: string, color: 'success' | 'error') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

onMounted(loadUsers);
onUnmounted(() => {
  if (searchTimeout) window.clearTimeout(searchTimeout);
});
</script>
