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
      <section class="aqueduct-gallery">
        <div v-for="aqueduct in aqueducts">
          {{ aqueduct.name }} - <span class="edit-button" @click="handleEdit(aqueduct)">Edit</span> - <span
            class="edit-button" @click="handleRun(aqueduct.id)">Run</span>
        </div>
        <div v-if="!aqueducts || aqueducts.length === 0">
          No aqueducts. Aqueducts enable connecting directories to pipelines.
        </div>
      </section>
    </template>
  </PageLayout>
</template>

<style scoped>
.edit-button {
  cursor: pointer;
}
</style>
