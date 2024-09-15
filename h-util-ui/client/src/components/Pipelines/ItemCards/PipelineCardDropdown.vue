<script setup lang="ts">
import { computed, ref } from 'vue';
import MenuVert from 'vue-material-design-icons/DotsVertical.vue'
import MenuBars from 'vue-material-design-icons/Menu.vue'
import { v4 as uuidv4 } from 'uuid';

import DeleteConfirmModal from '../../common/DeleteConfirmModal.vue';
import store from '@utils/store';
import { Pipeline } from '@shared/common.types';
import { navigateTo, PageViews } from '@utils/helpers';

interface Props {
  pipelineItem: Pipeline;
  icon?: 'vert' | 'hor' | 'bars';
};

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

  const created = store.upsertPipeline({ ...pipelineData, name: `${pipelineData.name} - copy`, id: uuidv4() });

  if (!created) return;

  setTimeout(() => {
    store.setSelectedPipeline(created);
    navigateTo(PageViews.Edit);
  }, 1000);
}

const MenuIcon = computed(() => props.icon === 'bars' ? MenuBars : MenuVert)

</script>

<template>
  <button class="button-with-icon-child">
    <component :is="MenuIcon" class="icon-button" :size="18" />
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