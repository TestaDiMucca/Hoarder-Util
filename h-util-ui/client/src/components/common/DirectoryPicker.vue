<script setup lang="ts">
import { getIpcRenderer } from '@utils/helpers';

type Props = {
  value: string | null;
  onSelectedDirectory: (dir: string) => void;
}

const props = defineProps<Props>();

const handleDirPrompt = async () => {
  const folder = await getIpcRenderer()?.selectFolder();

  if (!folder) return;

  props.onSelectedDirectory(folder);
}
</script>

<template>
  <div class="select-directory" @click="handleDirPrompt">
    <span v-if="!value || value.length === 0" class="no-dir">
      Click to select directory
    </span>
    <span>{{ value }}</span>
  </div>
</template>

<style scoped>
.select-directory {
  cursor: pointer;
}

.no-dir {
  opacity: 0.5;
}
</style>