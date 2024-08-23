<script setup lang="ts">
import { computed } from 'vue';
import UmuLoader from 'src/components/common/UmuLoader.vue';

interface Props {
  modelValue?: boolean;
  onHide: () => void;
  fileList: string[] | null;
  action: string;
}

const props = defineProps<Props>();

// Define custom emit function
const emit = defineEmits(['update:modelValue']);

// Setup the computed property to handle the v-model behavior
const model = computed({
  get: () => props.modelValue ?? false,
  set: (newValue) => emit('update:modelValue', newValue)
});
</script>

<template>
  <q-dialog v-model="model" backdrop-filter="blur(5px)" @hide="onHide">
    <q-card class="file-list-card">
      <q-card-section class="file-list-content">
        <div v-if="fileList === null" class="loader-container no-files">
          <UmuLoader />
        </div>
        <div v-else class="file-list-content">
          <div v-if="fileList.length === 0">No files were {{ action }}</div>
          <div v-if="fileList.length > 0">These files were {{ action }}:</div>
          <div v-for="fileName in fileList" class="file-list-item">
            › {{ fileName }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="actions-bar" align="right">
        <q-btn flat label="Close" color="primary" v-close-popup="true" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.file-list-content {
  flex-grow: 1;
}

.file-list-content {
  height: 100%;
  padding: 1em;
  overflow-y: auto;
}

.file-list-card {
  width: 80vw;
  min-width: 500px;
  min-height: 200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
</style>