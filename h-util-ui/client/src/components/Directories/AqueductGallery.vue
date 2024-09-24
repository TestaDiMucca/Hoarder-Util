<script setup lang="ts">
import PlusBox from 'vue-material-design-icons/PlusBox.vue'

import { Aqueduct, AqueductMessage } from '@shared/common.types';
import PageLayout from 'src/layout/PageLayout.vue';
import { getIpcRenderer } from '@utils/helpers';
import { IpcMessageType } from '@shared/common.constants';

type Props = {
  aqueducts: Aqueduct[] | null;
  handleNew: () => void;
  handleEdit: (a: Aqueduct) => void;
}

const handleRun = (id: string) => {
  getIpcRenderer()?.invoke<AqueductMessage>(IpcMessageType.aqueducts, {
    type: 'run',
    aqueductId: id
  })
}

defineProps<Props>();
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>Directory pipelines</span>
      <PlusBox class="icon-button create-button" @click="handleNew" title="Create a new pipeline" />
    </template>
    <template #content>
      <section class="gallery-container">
        <q-card v-for="aqueduct in aqueducts" class="gallery-item">
          <div class="card-title">{{ aqueduct.name }}</div>
          <div>
            <span class="text-button" @click="handleEdit(aqueduct)">Edit</span> - <span class="text-button"
              @click="handleRun(aqueduct.id)">Run</span>
          </div>
        </q-card>
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

.gallery-item {
  padding: 1em;
}

.card-title {
  font-size: 1.3em;
  font-weight: 600;
}
</style>
