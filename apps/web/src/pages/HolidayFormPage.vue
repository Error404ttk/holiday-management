<template>
  <section>
    <div class="form-heading">
      <div>
        <h1 class="page-title">{{ isEditMode ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุด' }}</h1>
        <p class="page-subtitle">
          {{ isEditMode ? 'แก้ไขข้อมูลวันหยุดและระบุเหตุผลทุกครั้ง' : 'เพิ่มรายการวันหยุดผ่าน Backend API' }}
        </p>
      </div>
      <v-chip color="secondary" variant="tonal" prepend-icon="mdi-shield-check">
        API
      </v-chip>
    </div>

    <v-alert v-if="isEditMode && !originalHoliday" type="error" variant="tonal" class="mb-4">
      ไม่พบรายการวันหยุดที่ต้องการแก้ไข
    </v-alert>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert
      color="orange-darken-4"
      variant="tonal"
      border="start"
      class="mb-6 warning-banner"
    >
      <div class="d-flex align-center">
        <span class="text-h6 me-2">⚠️</span>
        <div>
          <strong>หมายเหตุ:</strong> หากต้องการลบข้อมูลวันหยุดหลังจากเพิ่มเข้าระบบแล้ว กรุณาดำเนินการลบโดยตรงผ่านฐานข้อมูลโดยใช้สิทธิ์ระดับ Admin
        </div>
      </div>
    </v-alert>

    <v-card>
      <v-card-text>
        <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.holiday_date"
                label="วันที่วันหยุด"
                type="date"
                :min="minSelectableDate"
                :max="maxSelectableDate"
                :rules="[requiredRule, dateRangeRule]"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model.trim="form.holiday_name"
                label="ชื่อวันหยุด"
                :rules="[requiredRule]"
              />
            </v-col>

            <v-col v-if="schemaConfig?.typeColumnSupported" cols="12" md="6">
              <v-select
                v-model="form.holiday_type"
                :items="holidayTypes"
                label="ประเภทวันหยุด"
                :rules="[requiredRule]"
              />
            </v-col>

            <v-col v-if="schemaConfig?.activeColumnSupported" cols="12" md="6">
              <v-radio-group v-model="form.active" label="สถานะ" inline>
                <v-radio label="ใช้งาน" :value="true" />
                <v-radio label="ปิดใช้งาน" :value="false" />
              </v-radio-group>
            </v-col>

            <v-col v-if="schemaConfig?.noteColumnSupported" cols="12">
              <v-textarea
                v-model.trim="form.note"
                label="หมายเหตุ"
                rows="3"
                auto-grow
              />
            </v-col>

            <v-col v-if="isEditMode" cols="12">
              <v-textarea
                v-model.trim="editReason"
                label="เหตุผลในการแก้ไข"
                rows="3"
                auto-grow
                :rules="[requiredRule]"
              />
            </v-col>
          </v-row>

          <v-alert type="info" variant="tonal" class="mb-4">
            ระบบจะตรวจสอบข้อมูลซ้ำและบันทึก audit log ทุกครั้งก่อนเขียนข้อมูล
          </v-alert>

          <div class="form-actions">
            <v-btn variant="text" to="/holidays" :disabled="loading">กลับ</v-btn>
            <v-btn color="primary" prepend-icon="mdi-content-save" type="submit" :loading="loading" :disabled="loading">
              บันทึก
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="duplicateDialog" max-width="520">
      <v-card>
        <v-card-title>พบวันที่ซ้ำ</v-card-title>
        <v-card-text>
          พบรายการวันหยุดวันที่ {{ duplicateHoliday ? formatThaiDate(duplicateHoliday.holiday_date) : '' }}
          อยู่แล้ว: {{ duplicateHoliday?.holiday_name }}
          <br>
          ต้องการบันทึกข้อมูลต่อหรือไม่?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="duplicateDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmDuplicateSave">ดำเนินการต่อ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmSaveDialog" max-width="520">
      <v-card>
        <v-card-title>ยืนยันการบันทึก</v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            กรุณาตรวจสอบข้อมูลก่อนบันทึก ระบบจะเขียนข้อมูลจริงและบันทึก audit log
          </v-alert>
          <div class="preview-row">
            <span>วันที่</span>
            <strong>{{ formatThaiDate(form.holiday_date) }}</strong>
          </div>
          <div class="preview-row">
            <span>ชื่อวันหยุด</span>
            <strong>{{ form.holiday_name }}</strong>
          </div>
          <div class="preview-row">
            <span>ประเภท</span>
            <strong>{{ form.holiday_type }}</strong>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="loading" @click="confirmSaveDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" variant="flat" :loading="loading" @click="saveHoliday">ยืนยันบันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="1800">
      {{ snackbarMessage }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatThaiDate } from '../utils/date';
import { apiErrorMessage } from '../services/api';
import {
  createHoliday,
  getHolidayById,
  getHolidays,
  updateHoliday,
  getHolidaySchemaConfig,
  type HolidaySchemaConfig
} from '../services/holiday.service';
import type { Holiday, HolidayInput } from '../types/holiday';
import { guessHolidayType } from '../utils/holidayCategorizer';

import { useHolidayStore } from '../stores/holiday';

type FormExpose = {
  validate: () => Promise<{ valid: boolean }>;
};

const route = useRoute();
const router = useRouter();
const holidayStore = useHolidayStore();

const holidayTypes = ['วันหยุดราชการ', 'วันหยุดชดเชย', 'วันหยุดพิเศษ', 'วันหยุดท้องถิ่น', 'วันหยุดภายในหน่วยงาน'];
const requiredRule = (value: unknown) => Boolean(value) || 'กรุณากรอกข้อมูล';

const currentYear = new Date().getFullYear();
const minSelectableDate = `${currentYear - 1}-01-01`;
const maxSelectableDate = `${currentYear + 3}-12-31`;

const dateRangeRule = (value: string) => {
  if (!value) return true;
  const year = Number(value.split('-')[0]);
  if (year < currentYear - 1 || year > currentYear + 3) {
    return `กรุณาระบุปี ค.ศ. ระหว่าง ${currentYear - 1} ถึง ${currentYear + 3}`;
  }
  return true;
};

const formRef = ref<FormExpose | null>(null);
const formValid = ref(false);
const editReason = ref('');
const loading = ref(false);
const errorMessage = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error'>('success');
const duplicateDialog = ref(false);
const confirmSaveDialog = ref(false);
const duplicateHoliday = ref<Holiday | null>(null);
const pendingSave = ref(false);

const holidayId = computed(() => String(route.params.id));
const isEditMode = computed(() => route.name === 'holiday-edit');
const originalHoliday = ref<Holiday | null>(null);
const schemaConfig = ref<HolidaySchemaConfig | null>(null);

const form = reactive<HolidayInput>({
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
  } catch (error) {
    console.error('Failed to load schema config:', error);
  }
}

async function loadHoliday() {
  if (!isEditMode.value) return;

  loading.value = true;
  errorMessage.value = '';
  try {
    originalHoliday.value = await getHolidayById(holidayId.value);

    form.holiday_date = originalHoliday.value.holiday_date;
    form.holiday_name = originalHoliday.value.holiday_name;
    form.holiday_type = originalHoliday.value.holiday_type;
    form.active = originalHoliday.value.active ?? true;
    form.note = originalHoliday.value.note ?? '';
  } catch (error) {
    originalHoliday.value = null;
    errorMessage.value = apiErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) return;

  confirmSaveDialog.value = true;
}

function confirmDuplicateSave() {
  duplicateDialog.value = false;
  pendingSave.value = true;
  confirmSaveDialog.value = true;
}

async function findDuplicateHoliday(): Promise<Holiday | undefined> {
  const beYear = Number(form.holiday_date.slice(0, 4)) + 543;
  const holidays = await getHolidays({ year: beYear, mode: 'calendar' });
  return holidays.find((holiday) => holiday.holiday_date === form.holiday_date && String(holiday.id) !== holidayId.value);
}

function showSuccess(message: string) {
  snackbarMessage.value = message;
  snackbarColor.value = 'success';
  snackbar.value = true;
}

function showError(error: unknown) {
  const message = apiErrorMessage(error);
  // Specifically handle 409 Conflict for duplicate dates or general duplicate messages
  if (message.includes('ซ้ำ') || (error as any)?.response?.status === 409) {
    errorMessage.value = 'พบข้อมูลซ้ำ: ' + message;
  } else {
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
    } else {
      await createHoliday({ ...form });
    }

    confirmSaveDialog.value = false;
    holidayStore.clearCache();
    showSuccess('บันทึกข้อมูลสำเร็จ');
    window.setTimeout(() => {
      router.push('/holidays');
    }, 500);
  } catch (error) {
    showError(error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.preview-row span {
  color: #64748b;
}

.preview-row strong {
  color: #0f172a;
  text-align: right;
}

@media (max-width: 600px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .preview-row {
    display: block;
  }

  .preview-row strong {
    display: block;
    text-align: left;
    margin-top: 4px;
  }
}
</style>
