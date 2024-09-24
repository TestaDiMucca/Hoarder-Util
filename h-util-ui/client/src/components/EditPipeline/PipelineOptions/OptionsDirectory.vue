<script setup lang="ts">
import { PipelineOptionsProps } from './pipelineOptions.common';
import DirectoryPicker from 'src/components/common/DirectoryPicker.vue';

const props = defineProps<PipelineOptionsProps>();

const onDirSelected = (dir: string) => {
  props.handleOptionChange('value', dir)
}
</script>

<template>
  <DirectoryPicker :value="String(currentOptions.value)" :onSelectedDirectory="onDirSelected" />
</template>
