<template>
  <v-main>
    <div class="login-wrap">
      <v-card class="login-card" elevation="4">
        <v-card-title class="text-h5 font-weight-bold text-center pt-6">
          ระบบจัดการวันหยุด HOSxP
        </v-card-title>
        <v-card-subtitle class="text-center">
          โรงพยาบาลสารภี งานยุทธศาสตร์ และสารสนเทศทางการแพทย์
        </v-card-subtitle>
        <v-card-text class="pa-6">
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="submitLogin">
            <v-text-field
              v-model.trim="username"
              label="ชื่อผู้ใช้งาน"
              prepend-inner-icon="mdi-account"
              variant="outlined"
            />
            <v-text-field
              v-model="password"
              label="รหัสผ่าน"
              prepend-inner-icon="mdi-lock"
              type="password"
              variant="outlined"
            />
            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
              elevation="1"
              class="mt-2"
            >
              เข้าสู่ระบบ
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>

      <v-footer app border class="login-footer text-slate-500 text-caption bg-transparent">
        <div class="d-flex w-100 align-center px-4">
          <span>&copy; {{ new Date().getFullYear() }} — <strong>HOSxP Holiday Management</strong></span>
          <v-spacer />
          <div class="d-flex align-center gap-4">
            <span class="d-none d-sm-inline">โรงพยาบาลสารภี งานยุทธศาสตร์ และสารสนเทศทางการแพทย์</span>
            <v-divider vertical class="mx-2 my-2 d-none d-sm-inline" />
            <span>V1.{{ getVersionDate() }}--stable</span>
          </div>
        </div>
      </v-footer>
    </div>
  </v-main>
</template>

<script setup lang="ts">
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
  } catch (error) {
    errorMessage.value = apiErrorMessage(error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.login-card {
  width: min(440px, 90%);
  margin-bottom: auto;
  margin-top: auto;
  border-radius: 20px;
}

.login-footer {
  width: 100%;
}
</style>
