<script setup lang="ts">
import store from '@utils/store';
import { computed } from 'vue';

type Props = {
  // todo: vue events
  value: string;
  onOptionSelected: (optionId: string) => void;
}

const props = defineProps<Props>();

const pipelineOptions = computed(() => Object.values(store.state.pipelines).filter(p => p.id !== store.state.selectedPipeline?.id).map(pipeline => ({
  label: pipeline.name,
  value: pipeline.id ?? '-'
})))

const selectedOption = computed(() => pipelineOptions.value.find(o => o.value === props.value));

const handleSelectOption = (opt) => {
  props.onOptionSelected(opt.value);

}
</script>

<template>
  <q-select class="dropdown" :model-value="selectedOption" @update:model-value="handleSelectOption"
    :options="pipelineOptions" label="Target pipeline" :hide-dropdown-icon="true" />
</template>
