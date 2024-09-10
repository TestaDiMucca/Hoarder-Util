<script setup lang="ts">
import { ref } from 'vue';
import Menu from 'vue-material-design-icons/DotsVertical.vue'

import DeleteConfirmModal from '../../common/DeleteConfirmModal.vue';
import store from '@utils/store';
import { Pipeline } from '@shared/common.types';
import { navigateTo, PageViews } from '@utils/helpers';

interface Props { pipelineItem: Pipeline; };

const props = defineProps<Props>();
const confirmDelete = ref(false);

const deletePipeline = () =>
  store.removePipeline(props.pipelineItem.id!)

const selectPipeline = () => {
  store.setSelectedPipeline(props.pipelineItem)

  navigateTo(PageViews.Edit);
}

const duplicatePipeline = () => {
  const { id, ...pipelineData } = props.pipelineItem;

  const created = store.upsertPipeline({ ...pipelineData, name: `${pipelineData.name} - copy` });

  if (!created) return;

  setTimeout(() => {
    store.setSelectedPipeline(created);
    navigateTo(PageViews.Edit);
  }, 1000);
}
</script>

<template>
  <button class="button-with-icon-child">
    <Menu class="icon-button" :size="18" />
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item clickable v-close-popup="true" @click="selectPipeline">
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item clickable v-close-popup="true" @click="duplicatePipeline">
          <q-item-section>Duplicate</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup="true" @click="confirmDelete = true">
          <q-item-section style="color: red;">Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <DeleteConfirmModal v-model="confirmDelete" :onConfirm="deletePipeline" :deleteTargetName="pipelineItem.name" />
  </button>
</template>

<style scoped></style>