<script setup lang="ts">
import { computed, ref } from 'vue';
import WaterCircle from 'vue-material-design-icons/WaterCircle.vue';
import Delete from 'vue-material-design-icons/Delete.vue';
import Pencil from 'vue-material-design-icons/Pencil.vue';
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue';
import WavesArrow from 'vue-material-design-icons/WavesArrowRight.vue';
import { Aqueduct } from '@shared/common.types';
import store from '@utils/store';

type Props = {
  aqueduct: Aqueduct;
}

const props = defineProps<Props>()

type Emits = {
  (e: 'edit'): void;
  (e: 'run'): void;
  (e: 'delete'): void;
}

const emit = defineEmits<Emits>()

const confirmDelete = ref(false);

const handleDelete = () => emit('delete');

const pipelineName = computed(() => {
  const pipeline = store.state.pipelines[props.aqueduct.pipelineId];
  return pipeline.name ?? 'Unknown pipeline';
})
</script>

<template>
  <q-card class="gallery-item">
    <q-card-section class="section">
      <div @click="$emit('run')" class="run-button card-border">
        <q-tooltip :delay="500" :offset="[0, 10]">Run files through this aqueduct</q-tooltip>
        <WaterCircle class="icon-button" :size="36" />
      </div>

      <div class="text-content">
        <div class="card-title">{{ aqueduct.name }}</div>
        <div class="summary truncate-chip-labels">
          <q-chip v-for="directory in aqueduct.directories" style="max-width: 150px" :label="directory" outline
            size="sm" />
          <WavesArrow :size="12" />
          <q-chip style="max-width: 150px" :label="pipelineName" outline size="sm" />
        </div>
        <div class="card-description">{{ aqueduct.description }}</div>
      </div>

      <div class="actions">
        <Pencil @click="$emit('edit')" class="icon-button" :size="18" />
        <Delete @click="$emit('delete')" class="icon-button" :size="18" />
      </div>
    </q-card-section>
  </q-card>

  <DeleteConfirmModal v-model="confirmDelete" :onConfirm="handleDelete" :delete-target-name="aqueduct.name" />
</template>

<style scoped>
.gallery-item .section {
  padding: 1em;
  display: flex;
  gap: 1em;
}

.run-button {
  padding: 1em;
  transition: color 0.5s;
  cursor: pointer;
}

.run-button:hover {
  color: var(--q-lightColor)
}

.card-title {
  font-weight: 600;
  border-bottom: 1px solid #ccc;
}

.card-description {
  text-overflow: ellipsis;
  min-height: 1em;
  font-size: small;
}

.text-content {
  flex-grow: 1;
  text-align: left;
}

.summary {
  user-select: none;
  display: flex;
  align-items: center;
  overflow-x: auto;

  border-bottom: 1px solid #ccc;
}

.actions {
  display: flex;
  gap: 0.5em;
  align-items: center;
}
</style>