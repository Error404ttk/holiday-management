<template>
  <v-app>
    <router-view v-if="route.meta.public" />
    <DefaultLayout v-else />
  </v-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import DefaultLayout from './layouts/DefaultLayout.vue';

const route = useRoute();
</script>
