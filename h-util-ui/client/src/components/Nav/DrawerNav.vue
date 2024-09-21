<script setup lang="ts">
import { ref } from 'vue';
import FileCompare from 'vue-material-design-icons/FileCompare.vue'
import Apps from 'vue-material-design-icons/Apps.vue'
import ListStatus from 'vue-material-design-icons/ListStatus.vue';
import WrenchCog from 'vue-material-design-icons/WrenchCog.vue'

const drawer = ref(false);
const miniState = ref(true);
</script>

<template>
  <q-drawer v-model="drawer" show-if-above :mini="miniState" @mouseenter="miniState = false"
    @mouseleave="miniState = true" mini-to-overlay :width="200" :breakpoint="500" bordered>
    <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
      <q-list padding>
        <q-item>
          <FileCompare />
        </q-item>

        <q-separator />

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <Apps />
          </q-item-section>

          <q-item-section>
            Pipelines
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <ListStatus />
          </q-item-section>

          <q-item-section>
            Directories
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <WrenchCog />
          </q-item-section>

          <q-item-section>
            Internals
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<style scoped></style>