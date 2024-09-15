<script setup lang="ts">
import { loadUserData } from '@utils/helpers';

interface Props {
  handleExportPipelines: () => void
  handleImportPipelines: () => void
}

defineProps<Props>();

const refetchData = async () => {
  const reFetched = await loadUserData();

  // todo: update store? with helper?
  console.log(reFetched)
}

</script>

<template>
  Logs
  <button @click="handleExportPipelines">
    Export pipelines
  </button>
  <button @click="handleImportPipelines">
    Import pipelines
  </button>
  <button @click="refetchData">
    Trigger Refetch
  </button>
</template>