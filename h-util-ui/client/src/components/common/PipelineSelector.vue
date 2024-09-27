<script setup lang="ts">
import store from '@utils/store';
import { computed } from 'vue';

type Props = {
  value: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', opt: string): void;
}>();

const pipelineOptions = computed(() => Object.values(store.state.pipelines).filter(p => p.id !== store.state.selectedPipeline?.id).map(pipeline => ({
  label: pipeline.name,
  value: pipeline.id ?? '-'
})))

const selectedOption = computed(() => pipelineOptions.value.find(o => o.value === props.value));

const handleSelectOption = (opt) => {
  emit('select', opt.value);
}
</script>

<template>
  <q-select class="dropdown" :model-value="selectedOption" @update:model-value="handleSelectOption"
    :options="pipelineOptions" label="Target pipeline" :hide-dropdown-icon="true" />
</template>
