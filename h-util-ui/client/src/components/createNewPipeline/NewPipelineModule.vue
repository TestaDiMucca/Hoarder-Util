<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { ProcessingModule, ProcessingModuleType } from '../../utils/types';
import { OPTION_LABELS } from '../../utils/constants';

interface Props {
  processingModule: ProcessingModule;
  index: number;
  handleModuleUpdated: (newData: ProcessingModule, index: number) => void;
}

const props = defineProps<Props>()

const handleModuleTypeSelect = (type: ProcessingModuleType) => {
  const newData: ProcessingModule = {
    ...props.processingModule,
    type
  }

  optionLabel.value = OPTION_LABELS[type];

  props.handleModuleUpdated(newData, props.index);
}

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  const newData: ProcessingModule = {
    ...props.processingModule,
    options: {
      value: newValue
    }
  }

  props.handleModuleUpdated(newData, props.index);
}

const optionLabel = ref<string | null>(OPTION_LABELS[props.processingModule.type]);

</script>

<template>
  <span>Selected : {{ processingModule.type }}</span>
  <div v-if="optionLabel">
    <label for="module-option">{{ OPTION_LABELS[processingModule.type] }}:</label>
    <input type="text" id="module-option" v-model="processingModule.options.value" @input="handleModuleOptionUpdated"
      placeholder="Insert value here" />
  </div>
  <q-btn color="primary" label="Change type">
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item @click="handleModuleTypeSelect(ProcessingModuleType.subfolder)" clickable v-close-popup>
          <q-item-section>Place in directory</q-item-section>
        </q-item>
        <q-separator />
        <q-item @click="handleModuleTypeSelect(ProcessingModuleType.metadata)" clickable v-close-popup>
          <q-item-section>Metadata tag</q-item-section>
        </q-item>
        <q-item @click="handleModuleTypeSelect(ProcessingModuleType.datePrefix)" clickable v-close-popup>
          <q-item-section>Date prefix</q-item-section>
        </q-item>
        <q-separator />
        <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressImage)" clickable v-close-popup>
          <q-item-section>Compress image</q-item-section>
        </q-item>
        <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressVideo)" clickable v-close-popup>
          <q-item-section>Compress video</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>

</template>
