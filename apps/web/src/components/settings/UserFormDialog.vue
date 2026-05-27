<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :icon="editingUser ? 'mdi-account-edit' : 'mdi-account-plus'" color="primary" class="me-2" />
        {{ editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน' }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="submit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="form.username"
                label="ชื่อผู้ใช้งาน"
                prepend-inner-icon="mdi-account"
                :disabled="Boolean(editingUser)"
                :rules="[requiredRule, usernameRule]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="form.full_name"
                label="ชื่อ-สกุล"
                prepend-inner-icon="mdi-card-account-details-outline"
                :rules="[requiredRule]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.role"
                :items="roleOptions"
                item-title="title"
                item-value="value"
                label="สิทธิ์การใช้งาน"
                prepend-inner-icon="mdi-shield-account"
                :rules="[requiredRule]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="form.active"
                color="success"
                inset
                hide-details
                :label="form.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                :label="editingUser ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน'"
                prepend-inner-icon="mdi-lock"
                type="password"
                autocomplete="new-password"
                :rules="editingUser ? [optionalPasswordRule] : [requiredRule, passwordRule]"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="emit('update:modelValue', false)">ยกเลิก</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" @click="submit">
          บันทึก
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Role } from '../../types/auth';
import type { CreateUserInput, ManagedUser, UpdateUserInput } from '../../services/user.service';
import { ref } from 'vue';

type FormExpose = {
  validate: () => Promise<{ valid: boolean }>;
};

const props = defineProps<{
  modelValue: boolean;
  editingUser: ManagedUser | null;
  saving: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [value: CreateUserInput | UpdateUserInput];
}>();

const formRef = ref<FormExpose | null>(null);
const form = reactive({
  username: '',
  full_name: '',
  role: 'viewer' as Role,
  active: true,
  password: ''
});

const roleOptions = [
  { title: 'ผู้ดูแลระบบสูงสุด', value: 'super_admin' },
  { title: 'ผู้ดูแลระบบ', value: 'admin' },
  { title: 'ผู้ใช้งานอ่านข้อมูล', value: 'viewer' }
];

const requiredRule = (value: unknown) => Boolean(value) || 'กรุณากรอกข้อมูล';
const usernameRule = (value: string) => /^[a-zA-Z0-9._-]{3,80}$/.test(value) || 'ใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง และขีดล่าง อย่างน้อย 3 ตัวอักษร';
const passwordRule = (value: string) => value.length >= 8 || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
const optionalPasswordRule = (value: string) => !value || value.length >= 8 || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';

watch(
  () => [props.modelValue, props.editingUser] as const,
  () => {
    if (!props.modelValue) return;
    form.username = props.editingUser?.username ?? '';
    form.full_name = props.editingUser?.full_name ?? '';
    form.role = props.editingUser?.role ?? 'viewer';
    form.active = props.editingUser?.active ?? true;
    form.password = '';
  },
  { immediate: true }
);

async function submit() {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) return;

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
</script>
