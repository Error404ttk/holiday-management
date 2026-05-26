<template>
  <div class="login-wrap">
    <v-card class="login-card">
      <v-card-title class="text-h5 font-weight-bold">ระบบจัดการวันหยุด HOSxP</v-card-title>
      <v-card-subtitle>ระบบนี้ใช้สำหรับเจ้าหน้าที่ผู้ได้รับอนุญาตเท่านั้น</v-card-subtitle>
      <v-card-text>
        <v-form>
          <v-text-field label="ชื่อผู้ใช้งาน" prepend-inner-icon="mdi-account" />
          <v-text-field label="รหัสผ่าน" prepend-inner-icon="mdi-lock" type="password" />
          <v-btn block color="primary" size="large">เข้าสู่ระบบ</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
}

.login-card {
  width: min(440px, 100%);
}
</style>

