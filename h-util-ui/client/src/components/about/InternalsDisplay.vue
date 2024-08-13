<script setup lang="ts">
interface Props {
  handleExportPipelines: () => void
  handleImportPipelines: () => void
}

defineProps<Props>();
</script>

<template>
  Logs
  <button @click="handleExportPipelines">
    Export pipelines
  </button>
  <button @click="handleImportPipelines">
    Import pipelines
  </button>
</template>