<script setup lang="ts">
import { computed, CSSProperties, ref } from 'vue';
import { PipelineCardProps } from './itemCards.common';
import PipelineCardDropzone from './PipelineCardDropzone.vue';

const props = defineProps<PipelineCardProps>();
const isDragActive = ref(false);
const onDragActiveChange = (active: boolean) => {
  isDragActive.value = active;
}

/** For custom color rendering */
const cardStyle = computed(() => props.pipelineItem.color ? {
  backgroundColor: props.pipelineItem.color
} satisfies CSSProperties : undefined)
</script>

<template>
  <q-card :class="{ 'pipeline-drop': isDragActive, 'pipeline-card': true }">
    <PipelineCardDropzone :onDrop="onDrop" :onDragActiveChange="onDragActiveChange">
      <div class="swatch-box" :style="cardStyle" />
      <div class="pipeline-name">
        {{ pipelineItem.name }}
      </div>
    </PipelineCardDropzone>
  </q-card>
</template>

<style scoped>
.pipeline-name {
  height: 3em;
  text-overflow: ellipsis;
}

.pipeline-drop {
  color: var(--q-lightColor);
  transform: scale(1.05);
  transform-origin: center;
}

.pipeline-card {
  width: var(--card-size-compact);
  padding: 0.5rem;
  transition: transform 0.5s;
}

.swatch-box {
  width: 100%;
  height: 5px;
}
</style>