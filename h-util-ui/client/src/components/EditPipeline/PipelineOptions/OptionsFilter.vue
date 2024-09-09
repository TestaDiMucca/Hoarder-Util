<script setup lang="ts">
import { computed } from 'vue';

import { PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';
import { ProcessingModuleType } from '@shared/common.types';
import FilterTester from './FilterTester.vue';

const props = defineProps<PipelineOptionsProps & { additionalHelp?}>();

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  props.handleOptionChange('value', newValue);
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);
</script>

<template>
  <section class="filter-options">
    <component v-if="!!additionalHelp" :is="additionalHelp" />
    <q-input v-if="optionLabel" type="text" v-model="currentOptions.value" @input="handleModuleOptionUpdated"
      :label="optionLabel ?? ''" />

    <FilterTester :type="ProcessingModuleType.filter" :options="currentOptions" />
  </section>
</template>
