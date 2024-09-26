<script setup lang="ts">
import { computed, defineProps, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import Delete from 'vue-material-design-icons/Delete.vue'
import Help from 'vue-material-design-icons/HelpCircle.vue'

import { ActionModule, ProcessingModuleType } from '@utils/types';
import { getDefaultModule, getOptionsComponent, MODULE_MATERIAL_ICONS, OPTION_TOOLTIP } from '@utils/constants';
import { cloneObject } from '@utils/helpers';
import { getModuleCanInvert } from '@utils/models.helpers';
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue';
import ModuleTypeDropdown from './ModuleTypeDropdown.vue';
import { ProcessingModule, ProcessingModuleBooleanOptions } from '@shared/common.types';
import EditBranchingModule from './PipelineOptions/EditBranchingModule.vue';

interface Props {
  processingModule: ProcessingModule;
  handleModuleUpdated: (newData: ProcessingModule | null, id: string) => void;
  onClose: () => void;
}

const props = defineProps<Props>()
const localModule = ref(props.processingModule);
const confirmDelete = ref(false);

const commitModuleChanges = () => {
  props.handleModuleUpdated(localModule.value, props.processingModule.id);
  props.onClose();
}

const handleModuleTypeSelect = (type: ProcessingModuleType) => {
  // TODO: cleanup
  if (type === ProcessingModuleType.branch) {
    localModule.value = getDefaultModule(props.processingModule.id, true);
    return;
  }

  const newData: ActionModule = {
    ...getDefaultModule(props.processingModule.id) as ActionModule,
    type
  }

  localModule.value = newData;
}

const handleUpdateModule = (newData: Partial<ProcessingModule>) => {
  const existing: ProcessingModule = localModule.value;
  localModule.value = { ...existing, ...newData } as ProcessingModule;
}

const updateOptionValue = <T = string>(newValue: T, flag: keyof ActionModule['options'] = 'value') => {
  if (localModule.value.type === ProcessingModuleType.branch) return;

  const newData: ActionModule = {
    ...localModule.value,
    options: {
      ...localModule.value.options,
      [flag]: newValue
    }
  }

  localModule.value = newData;
}

const handleModuleOptionUpdated = <T = string>(flag: keyof ActionModule['options'], newValue: T) => {
  updateOptionValue(newValue, flag);
}

const handleToggleModuleOption = (option: keyof ProcessingModuleBooleanOptions) => {
  if (localModule.value.type === ProcessingModuleType.branch) return;

  const newData: ActionModule = cloneObject(localModule.value);

  newData.options[option] = localModule.value.options[option] ? false : true;

  localModule.value = newData;
}

const handleRemoveModule = () => props.handleModuleUpdated(null, props.processingModule.id)

/** Filter types can be inverted */
const inversionAvailable = computed(() => getModuleCanInvert(localModule.value.type))
const iconSignifier = computed(() => MODULE_MATERIAL_ICONS[localModule.value.type])

const optionsComponent = computed(() => getOptionsComponent(localModule.value.type));
const optionTooltip = computed(() => OPTION_TOOLTIP[localModule.value.type]);
</script>

<template>
  <q-card class="p-2 editor-card">
    <q-card-section>
      <div class="module-header">
        <button class="module-title expand-opts-btn button-with-icon-child">
          <component :is="iconSignifier" />
          <span class="module-name">{{ localModule.type }} <span class="helper-text">(Click to
              change)</span></span>
          <ModuleTypeDropdown :handleModuleTypeSelect="handleModuleTypeSelect" />
        </button>

        <span class="module-tools">
          <Delete @click="confirmDelete = true" class="icon-button" :size="18" />
        </span>
      </div>

      <section v-if="localModule.type !== ProcessingModuleType.branch">
        <div v-if="!!optionsComponent"><span class="options-header">Options</span>
          <Help v-if="!!optionTooltip" :size="12" />
          <q-tooltip :delay="500" :offset="[0, 10]">{{ optionTooltip }}</q-tooltip>
        </div>

        <component v-if="!!optionsComponent" :is="optionsComponent" :currentOptions="localModule.options"
          :moduleType="localModule.type" :handleOptionChange="handleModuleOptionUpdated" />

        <div>
          <q-checkbox v-model="localModule.options.ignoreErrors" @change="handleToggleModuleOption('ignoreErrors')"
            label="Ignore errors"><q-tooltip :delay="500" :offset="[0, 10]">Continue processing if a particular file
              errors.</q-tooltip></q-checkbox>
          <q-checkbox v-model="(localModule.options.skipPreviouslyFailed)"
            @change="handleToggleModuleOption('skipPreviouslyFailed')" label="Skip previously failed"><q-tooltip
              :delay="500" :offset="[0, 10]">Next module will ignore files that weren't processed in the
              last.</q-tooltip></q-checkbox>
          <q-checkbox v-if="inversionAvailable" v-model="localModule.options.inverse"
            @change="handleToggleModuleOption('inverse')" label="Invert logic"><q-tooltip :delay="500"
              :offset="[0, 10]">Invert any logical decisions in this module as a whole.</q-tooltip></q-checkbox>
        </div>
      </section>

      <section v-if="localModule.type === ProcessingModuleType.branch">
        <EditBranchingModule :processing-module="localModule" @update="handleUpdateModule" />
      </section>

      <DeleteConfirmModal v-model="confirmDelete" :onConfirm="handleRemoveModule"
        :deleteTargetName="localModule.type" />
    </q-card-section>

    <q-card-actions class="actions-bar" align="right">
      <q-btn flat label="Close" @click="onClose" />
      <q-btn flat label="Save" color="primary" @click="commitModuleChanges" />
    </q-card-actions>
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
  justify-content: space-between;
}

.module-title {
  display: flex;
  justify-content: center;
  gap: 0.2em;
  align-items: start;
  padding-left: 0;
}

.options-header {
  font-weight: 600;
  margin-right: 5px;
}
</style>