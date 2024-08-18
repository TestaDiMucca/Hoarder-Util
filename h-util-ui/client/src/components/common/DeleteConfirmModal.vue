<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: boolean;
  deleteTargetName?: string;
  onConfirm: () => void;
}

const props = defineProps<Props>();

// Define custom emit function
const emit = defineEmits(['update:modelValue']);

// Setup the computed property to handle the v-model behavior
const model = computed({
  get: () => props.modelValue ?? false,
  set: (newValue) => emit('update:modelValue', newValue)
});

const confirmText = computed(() => props.deleteTargetName ? `Are you sure you want to remove "${props.deleteTargetName}"?` : 'Are you sure you want to run delete?')
</script>

<template>
  <q-dialog v-model="model">
    <q-card>
      <q-card-section>
        {{ confirmText }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup="true" />
        <q-btn flat label="Confirm" color="primary" v-close-popup="true" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>