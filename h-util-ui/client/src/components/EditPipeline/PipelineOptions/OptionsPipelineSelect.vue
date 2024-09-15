<script setup lang="ts">
import { computed } from 'vue';
import { PipelineOptionsProps } from './pipelineOptions.common';
import store from '@utils/store';

const props = defineProps<PipelineOptionsProps>();

const pipelineOptions = computed(() => Object.values(store.state.pipelines).map(pipeline => ({
  label: pipeline.name,
  value: pipeline.id ?? '-'
})))

const selectedOption = computed(() => pipelineOptions.value.find(o => o.value === props.currentOptions.value));

const handleSelectOption = (opt) => {
  props.currentOptions.value = opt.value;
}
</script>

<template>
  <q-select class="dropdown" :model-value="selectedOption" @update:model-value="handleSelectOption"
    :options="pipelineOptions" label="Target pipeline" :hide-dropdown-icon="true" />
</template>
