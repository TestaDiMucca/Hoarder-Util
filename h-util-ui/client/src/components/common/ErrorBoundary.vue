<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

const errorMessage = ref<string | null>(null);

onErrorCaptured((error) => {
  errorMessage.value = error.message;

  console.error(error);

  return false;
})
</script>

<template>
  <slot></slot>
  <q-banner v-if="!!errorMessage" class="bg-negative text-white error-banner">
    An error occurred: {{ errorMessage }}
    <template v-slot:action>
      <q-btn flat color="white" label="Dismiss" @click="errorMessage = null" />
    </template>
  </q-banner>
</template>

<style scoped>
.error-banner {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0;
}
</style>