<script setup lang="ts">
import { computed, defineProps } from 'vue';
import MenuRight from 'vue-material-design-icons/MenuRight.vue';
import { ProcessingModule, ProcessingModuleType } from '@utils/types';
import { MODULE_MATERIAL_ICONS, OPTION_LABELS } from '@utils/constants';
import { cloneObject } from '@utils/helpers';
import { getModuleCanInvert } from '@utils/module.helpers';

interface Props {
  processingModule: ProcessingModule;
  index: number;
  handleModuleUpdated: (newData: ProcessingModule | null, index: number) => void;
}

const props = defineProps<Props>()

const handleModuleTypeSelect = (type: ProcessingModuleType) => {
  const newData: ProcessingModule = {
    ...props.processingModule,
    type
  }

  props.handleModuleUpdated(newData, props.index);
}

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  const newData: ProcessingModule = {
    ...props.processingModule,
    options: {
      value: newValue
    }
  }

  props.handleModuleUpdated(newData, props.index);
}

const handleToggleModuleOption = (option: keyof Omit<ProcessingModule['options'], 'value'>) => {
  const newData: ProcessingModule = cloneObject(props.processingModule);

  newData.options[option] = props.processingModule.options[option] ? false : true;

  props.handleModuleUpdated(newData, props.index);
}

const handleRemoveModule = () => props.handleModuleUpdated(null, props.index)

/** Filter types can be inverted */
const inversionAvailable = computed(() => getModuleCanInvert(props.processingModule.type))
const iconSignifier = computed(() => MODULE_MATERIAL_ICONS[props.processingModule.type])
</script>

<template>
  <q-card class="p-2 editor-card">
    <div class="module-header">
      <span class="module-name">{{ processingModule.type }}</span>
      <component :is="iconSignifier" />
    </div>

    <q-input type="text" v-model="processingModule.options.value" @input="handleModuleOptionUpdated"
      :label="OPTION_LABELS[processingModule.type] ?? ''" />

    <div>
      <q-checkbox v-model="processingModule.options.ignoreErrors" @change="handleToggleModuleOption('ignoreErrors')"
        label="Ignore errors" />
      <q-checkbox v-model="(processingModule.options.skipPreviouslyFailed)"
        @change="handleToggleModuleOption('skipPreviouslyFailed')" label="Skip previously failed" />
      <q-checkbox v-if="inversionAvailable" v-model="processingModule.options.inverse"
        @change="handleToggleModuleOption('inverse')" label="Invert logic" />
    </div>

    <q-btn color="primary" label="Change type">
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
          <q-separator />
          <q-item clickable>
            <q-item-section>Media compression</q-item-section>
            <q-item-section side>
              <MenuRight :size="20" />
            </q-item-section>
            <q-menu anchor="top end" self="top start">
              <q-list>
                <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressImage)" clickable
                  v-close-popup="true">
                  <q-item-section>Compress image</q-item-section>
                </q-item>
                <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressVideo)" clickable
                  v-close-popup="true">
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
    </q-btn>

    <button @click="handleRemoveModule">
      Remove module
    </button>
  </q-card>
</template>

<style scoped>
.editor-card {
  padding: 1em
}

.module-name {
  font-weight: 700;
}

.module-header {
  display: flex;
  justify-content: center;
  gap: 0.2em;
  align-items: start;
}
</style>