<script setup lang="ts">
import { ref, computed } from 'vue'
import HomePage from './components/HomePage.vue'
import NewPipeline from './components/createNewPipeline/NewPipeline.vue'
import { VueComponent } from './utils/util.types'

const routes: Record<string, VueComponent> = {
  '/': HomePage,
  '/new': NewPipeline
}
const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
});

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] ?? HomePage
})
</script>

<template>
  <component :is="currentView" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
