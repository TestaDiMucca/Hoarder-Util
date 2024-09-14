<script setup lang="ts">
import PlusBox from 'vue-material-design-icons/PlusBox.vue'

defineProps<{
  handleNewModules: () => void;
  fromId?: string;
}>();
</script>

<template>
  <div @click="handleNewModules" class="add-new-module cursor-pointer">
    <PlusBox class="icon-button" />
    <span>Add module</span>
  </div>

</template>

<style scoped>
.add-new-module {
  filter: drop-shadow(2px 2px 3px black);
}
</style>
