<script setup lang="ts">
import { computed, ref } from 'vue';

import { extractStringTemplate, PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';
import { getIpcRenderer } from '@utils/helpers';
import { IpcMessageType, RenameTemplates } from '@shared/common.constants';
import { RenameTestRequest } from '@shared/common.types';
import FileListModal from './FileListModal.vue';
import MiniFileDrop from 'src/components/common/MiniFileDrop.vue';

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

  const res = await ipcRenderer.invoke<RenameTestRequest, string[]>(IpcMessageType.testRename, {
    filePaths, templateString: String(props.currentOptions.value)
  });

  fileList.value = res;
}

const clearFiles = () => {
  fileList.value = null;
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);
</script>

<template>
  <section class="filter-options">
    <div class="autocomplete">
      <q-input v-if="optionLabel" type="text" v-model="currentOptions.value" @input="handleModuleOptionUpdated"
        @update:model-value="onInput" :label="optionLabel ?? '%original%'" placeholder="example: %original%_tagged" />
      <q-card v-if="filteredTemplateOptions.length > 0" class="suggestion-list">
        <q-card-section>
          <div v-for="suggestion in filteredTemplateOptions" :key="suggestion" @click="selectSuggestion(suggestion)">
            {{ suggestion }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <MiniFileDrop v-if="currentOptions.value" :handleDroppedFiles="handleDroppedFiles" />
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