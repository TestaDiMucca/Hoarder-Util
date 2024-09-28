<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { PipelineOptionsProps } from './pipelineOptions.common';
import { getIpcRenderer } from '@utils/helpers';
import { FilterTestRequest, ProcessingModuleType } from '@shared/common.types';
import { IpcMessageType } from '@shared/common.constants';
import MiniFileDrop from 'src/components/common/MiniFileDrop.vue';
import FileListModal from './FileListModal.vue';

interface Props {
  type: ProcessingModuleType;
  options: PipelineOptionsProps['currentOptions'];
}

const props = defineProps<Props>();

const showList = ref(false);
const fileList = ref<string[] | null>(null);

const handleDroppedFiles = async (filePaths: string[]) => {
  showList.value = true;

  const res = await getIpcRenderer().invoke<FilterTestRequest, string[]>(IpcMessageType.runTest,
    {
      filePaths,
      invert: !!props.options.inverse,
      ...(props.type === ProcessingModuleType.ruleFilter ? {
        type: ProcessingModuleType.ruleFilter, rules: toRaw(props.options.rules!)
      } : {
        type: ProcessingModuleType.filter,
        filter: String(props.options.value!)
      })
    }
  )

  fileList.value = res;
}

const clearFiles = () => {
  fileList.value = null;
}
</script>

<template>
  <MiniFileDrop v-if="options.value || options.rules" @select="handleDroppedFiles" />
  <FileListModal v-model="showList" :fileList="fileList" :onHide="clearFiles" action="filtered" />
</template>
