<script setup lang="ts">
import MenuRight from 'vue-material-design-icons/MenuRight.vue';
import { ProcessingModuleType } from '@shared/common.types';

interface Props {
  handleModuleTypeSelect: (moduleType: ProcessingModuleType) => void;
}

defineProps<Props>();
</script>

<template>
  <q-menu>
    <q-list style="min-width: 100px">
      <q-item @click="handleModuleTypeSelect(ProcessingModuleType.subfolder)" clickable v-close-popup="true">
        <q-item-section>Place in directory</q-item-section>
      </q-item>

      <q-separator />
      <q-item @click="handleModuleTypeSelect(ProcessingModuleType.metadata)" clickable v-close-popup="true">
        <q-item-section>Metadata tag</q-item-section>
      </q-item>
      <q-item @click="handleModuleTypeSelect(ProcessingModuleType.datePrefix)" clickable v-close-popup="true">
        <q-item-section>Date prefix</q-item-section>
      </q-item>
      <q-separator />

      <q-item @click="handleModuleTypeSelect(ProcessingModuleType.iterate)" clickable v-close-popup="true">
        <q-item-section>Iterate</q-item-section>
      </q-item>
      <q-item @click="handleModuleTypeSelect(ProcessingModuleType.report)" clickable v-close-popup="true">
        <q-item-section>Log results</q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable>
        <q-item-section>Media compression</q-item-section>
        <q-item-section side>
          <MenuRight :size="20" />
        </q-item-section>
        <q-menu anchor="top end" self="top start">
          <q-list>
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressImage)" clickable v-close-popup="true">
              <q-item-section>Compress image</q-item-section>
            </q-item>
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressVideo)" clickable v-close-popup="true">
              <q-item-section>Compress video</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <q-item clickable>
        <q-item-section>Filtering</q-item-section>
        <q-item-section side>
          <MenuRight :size="20" />
        </q-item-section>

        <q-menu anchor="top end" self="top start">
          <q-list>
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.filter)" clickable v-close-popup="true">
              <q-item-section>Filter file</q-item-section>
            </q-item>
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.ocr)" clickable v-close-popup="true">
              <q-item-section>Search image for text</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-menu>
</template>