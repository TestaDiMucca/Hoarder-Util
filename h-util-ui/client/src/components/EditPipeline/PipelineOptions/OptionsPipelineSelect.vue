<script setup lang="ts">
import { PipelineOptionsProps } from './pipelineOptions.common';
import PipelineSelector from 'src/components/common/PipelineSelector.vue';

const props = defineProps<PipelineOptionsProps>();

const handleSelectOption = (opt) => {
  props.currentOptions.value = opt.value;
}
</script>

<template>
  <PipelineSelector :value="String(currentOptions.value)" @select="handleSelectOption" />
</template>
