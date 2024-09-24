<script setup lang="ts">
import { ref } from 'vue';
import { Aqueduct, AqueductMessage } from '@shared/common.types';
import Delete from 'vue-material-design-icons/Delete.vue'
import PageLayout from 'src/layout/PageLayout.vue';

import { getIpcRenderer, removeVueRefs } from '@utils/helpers';
import { IpcMessageType } from '@shared/common.constants';
import PipelineSelector from '../common/PipelineSelector.vue';
import DirectoryPicker from '../common/DirectoryPicker.vue';

type Props = {
  aqueduct: Aqueduct;
  returnHome: () => void;
  onNewAdded: () => void;
}
const props = defineProps<Props>();
const localAqueduct = ref(props.aqueduct);

// TODO: Common directory display/editor card component
const handleDirPrompt = async (index: number) => {
  const folder = await getIpcRenderer()?.selectFolder();

  if (!folder) return;

  localAqueduct.value.directories[index] = folder;
}

const addDirectory = () => {
  localAqueduct.value.directories.push('');
}

const removeDirectory = (index: number) => {
  localAqueduct.value.directories.splice(index, 1);
}

const handleSave = async () => {
  await getIpcRenderer()?.invoke<AqueductMessage>(IpcMessageType.aqueducts, { type: 'save', data: removeVueRefs(localAqueduct.value) })

  props.onNewAdded();
  props.returnHome();
}

const onPipelineSelected = (id: string) => {
  localAqueduct.value.pipelineId = id;
}

const onDirSelected = (index: number) => (folder: string) => {
  localAqueduct.value.directories[index] = folder;
}
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>
        New aqueduct
      </span>
      <span />
    </template>
    <template #content>
      <q-input type="text" v-model="localAqueduct.name" label="Name" />
      <q-input type="textarea" v-model="localAqueduct.description" label="Description" />

      <PipelineSelector :value="localAqueduct.pipelineId" v-on:option-selected="onPipelineSelected" />

      <div class="directories card-border">
        <div v-for="(_, index) in localAqueduct.directories" :key="index" class="directory-row">
          <DirectoryPicker :onSelectedDirectory="onDirSelected(index)" :value="localAqueduct.directories[index]" />

          <Delete @click="removeDirectory(index)" class="remove-btn icon-button" :size="18" />
        </div>
        <button @click="addDirectory">Add directory</button>
      </div>
    </template>
    <template #footer>
      <button @click="returnHome">
        Cancel
      </button>
      <button @click="handleSave">
        Save aqueduct
      </button>
    </template>
  </PageLayout>
</template>

<style scoped>
.directories {
  padding: 10px;
  margin-top: 1em;
}

.directory-row {
  display: flex;
  gap: 5px;
  justify-content: center;
}
</style>
