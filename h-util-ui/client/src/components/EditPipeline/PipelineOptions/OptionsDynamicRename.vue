<script setup lang="ts">
import { computed, ref } from 'vue';

import { extractStringTemplate, PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';
import { getIpcRenderer } from '@utils/helpers';
import { defaultTimeMask, IpcMessageType, RenameTemplates } from '@shared/common.constants';
import { ProcessingModuleType, RenameTestRequest } from '@shared/common.types';
import FileListModal from './FileListModal.vue';
import MiniFileDrop from 'src/components/common/MiniFileDrop.vue';
import { hasDateTag, previewRenamedFile } from './pipelineOptions.util';

const props = defineProps<PipelineOptionsProps>();
const showList = ref(false);
const fileList = ref<string[] | null>(null);
const templateOptions = ref(Object.values(RenameTemplates))
const filteredTemplateOptions = ref<RenameTemplates[]>([]);

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  props.handleOptionChange('value', newValue);

  onInput();
}

const handleFormatTaskUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;
  props.handleOptionChange('dateMask', newValue);
}

const onInput = () => {
  const lastToken = extractStringTemplate(String(props.currentOptions.value));
  if (lastToken && lastToken.length > 1) {
    const query = lastToken.toLowerCase();
    filteredTemplateOptions.value = templateOptions.value.filter(s =>
      s.toLowerCase().startsWith(query.toLowerCase())
    );
  } else {
    filteredTemplateOptions.value = [];
  }
}

const selectSuggestion = (suggestion) => {
  const base = String(props.currentOptions.value).substring(0, String(props.currentOptions.value).lastIndexOf('%') + 1);
  props.handleOptionChange('value', base + suggestion + '%')
  filteredTemplateOptions.value = [];
}

const handleDroppedFiles = async (filePaths: string[]) => {
  const ipcRenderer = getIpcRenderer();
  if (!ipcRenderer) return;

  showList.value = true;

  const res = await ipcRenderer.invoke<RenameTestRequest, string[]>(IpcMessageType.runTest, {
    type: ProcessingModuleType.dynamicRename,
    filePaths, templateString: String(props.currentOptions.value)
  });

  fileList.value = res;
}

const clearFiles = () => {
  fileList.value = null;
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);

const exampleName = computed(() => previewRenamedFile(String(props.currentOptions.value), props.currentOptions.dateMask));
const templateUsesDateTags = computed(() => hasDateTag(String(props.currentOptions.value)))
</script>

<template>
  <section class="filter-options">
    <div class="autocomplete">
      <q-input v-if="optionLabel" type="text" v-model="currentOptions.value" @input="handleModuleOptionUpdated"
        @update:model-value="onInput" :label="optionLabel ?? '%original%'" placeholder="example: %original%_tagged" />
      <q-input v-if="templateUsesDateTags" type="text" v-model="currentOptions.dateMask"
        @input="handleFormatTaskUpdated" label="Date formatting mask" :placeholder="defaultTimeMask" />
      <div class="example">{{ exampleName }}</div>
      <q-card v-if="filteredTemplateOptions.length > 0" class="suggestion-list">
        <q-card-section>
          <div v-for="suggestion in filteredTemplateOptions" :key="suggestion" @click="selectSuggestion(suggestion)">
            {{ suggestion }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <MiniFileDrop v-if="currentOptions.value" @select="handleDroppedFiles" />
  </section>

  <FileListModal :fileList="fileList" :onHide="clearFiles" v-model="showList" action="renamed" />
</template>

<style scoped>
.autocomplete {
  position: relative;
}

.suggestion-list {
  position: absolute;
}
</style>