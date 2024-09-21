<script setup lang="ts">
import { computed, ref } from 'vue';
import { Aqueduct, AqueductMessage } from '@shared/common.types';
import PageLayout from 'src/layout/PageLayout.vue';

import store from '@utils/store';
import { getIpcRenderer, removeVueRefs } from '@utils/helpers';
import { IpcMessageType } from '@shared/common.constants';

type Props = {
  aqueduct: Aqueduct;
  returnHome: () => void;
  onNewAdded: () => void;
}
const props = defineProps<Props>();
const localAqueduct = ref(props.aqueduct);

// TODO: common pipeline selector component
const pipelineOptions = computed(() => Object.values(store.state.pipelines).filter(p => p.id !== store.state.selectedPipeline?.id).map(pipeline => ({
  label: pipeline.name,
  value: pipeline.id ?? '-'
})))

const selectedOption = computed(() => pipelineOptions.value.find(o => o.value === localAqueduct.value.pipelineId));

const handleDirPrompt = async (index: number) => {
  const folder = await getIpcRenderer()?.selectFolder();

  if (!folder) return;

  localAqueduct.value.directories[index] = folder;
}

const handleSelectOption = (opt) => {
  localAqueduct.value.pipelineId = opt.value;
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

      <q-select class="dropdown" :model-value="selectedOption" @update:model-value="handleSelectOption"
        :options="pipelineOptions" label="Target pipeline" :hide-dropdown-icon="true" />

      <div class="directories">
        <div v-for="(_, index) in localAqueduct.directories" :key="index">
          <!-- <q-input v-model="localAqueduct.directories[index]" type="text" /> -->
          <div class="select-directory" @click="handleDirPrompt(index)">Dir: {{ localAqueduct.directories[index]
            }}</div>
          <button @click="removeDirectory(index)">Remove</button>
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

<style scoped></style>
