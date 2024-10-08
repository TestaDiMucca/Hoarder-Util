<script setup lang="ts">
import PlusBox from 'vue-material-design-icons/PlusBox.vue'

import { Aqueduct, AqueductMessage } from '@shared/common.types';
import PageLayout from 'src/layout/PageLayout.vue';
import { getIpcRenderer } from '@utils/helpers';
import { IpcMessageType } from '@shared/common.constants';
import AqueductItem from './AqueductItem.vue';

type Props = {
  aqueducts: Aqueduct[] | null;
  handleNew: () => void;
  handleEdit: (a: Aqueduct) => void;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const handleRun = (id: string) => {
  getIpcRenderer().invoke<AqueductMessage>(IpcMessageType.aqueducts, {
    type: 'run',
    aqueductId: id
  })
}

const handleDelete = async (aqueDuctId: string) => {
  await getIpcRenderer().invoke<AqueductMessage>(IpcMessageType.aqueducts, {
    type: 'delete',
    aqueDuctId
  })

  emit('update');
}
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>Directory pipelines</span>
      <PlusBox class="icon-button create-button" @click="handleNew" title="Create a new pipeline" />
    </template>
    <template #content>
      <section class="gallery-container">
        <AqueductItem v-for="aqueduct in aqueducts" :aqueduct="aqueduct" @edit="handleEdit(aqueduct)"
          @run="handleRun(aqueduct.id)" @delete="handleDelete(aqueduct.id)" />
        <div v-if="!aqueducts || aqueducts.length === 0">
          No aqueducts. Aqueducts enable connecting directories to pipelines.
        </div>
      </section>
    </template>
  </PageLayout>
</template>

<style scoped>
.gallery-container {
  display: grid;
  width: 100%;

  justify-content: center;
  gap: 10px;
  overflow-y: auto;
  padding: 0.5em;

  grid-template-columns: repeat(auto-fit, minmax(50%, 1fr));
}

.card-title {
  font-size: 1.3em;
  font-weight: 600;
}
</style>
