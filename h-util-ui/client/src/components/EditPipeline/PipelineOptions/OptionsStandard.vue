<script setup lang="ts">
import { computed } from 'vue';
import { PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';

const props = defineProps<PipelineOptionsProps>();

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  props.handleOptionChange('value', newValue);
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);
</script>

<template>
  <q-input v-if="optionLabel" type="text" v-model="currentOptions.value" @input="handleModuleOptionUpdated"
    :label="optionLabel ?? ''" />
</template>
