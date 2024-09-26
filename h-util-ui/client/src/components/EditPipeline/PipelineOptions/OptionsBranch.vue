<script setup lang="ts">
import { ProcessingBranch, ProcessingModule } from '@shared/common.types';
import { Rule } from '@shared/rules.types';
import RuleEditor from 'src/components/common/RuleEditor.vue';
import { computed, inject, Ref } from 'vue';

type Props = {
  moduleId: string;
  branch: ProcessingBranch;
  index: number;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', data: Partial<ProcessingBranch> | null): void;
}>();

const pipelineModules = inject<Ref<ProcessingModule[]>>('pipelineModules');

const handleLabelChange = (label: string | number | null) => {
  emit('update', { label: label ? String(label) : undefined })
}

const handleRuleUpdates = (rules: Rule) => {
  emit('update', { rules });
}

const handleModuleUpdate = (opt) => {
  emit('update', { targetModule: opt.value })
}

// todo: "new module", and "none", and optimize
const moduleOptions = computed(() => (pipelineModules?.value ?? []).filter(m => m.id !== props.moduleId).map(m => ({
  label: m.type,
  value: m.id
})))

const currentSelectedModule = computed(() => moduleOptions.value.find(o => o.value === props.branch.targetModule))

</script>

<template>
  <section class="branch-container card-border">
    <div class="main-options">
      <q-input class="option" type="text" :model-value="branch.label" @update:modelValue="handleLabelChange"
        label="Branch label" :placeholder="`Branch ${index}`" />
      <q-select v-if="moduleOptions.length > 0" class="option" :model-value="currentSelectedModule"
        :options="moduleOptions" @update:model-value="handleModuleUpdate" :hide-dropdown-icon="true"
        label="To existing module" />
    </div>
    <q-expansion-item expand-separator label="Rules" :hide-expand-icon="true">
      <template v-slot:header="{ expanded }">
        <q-item-section>
          {{ expanded ? 'Collapse' : 'Expand' }} rules
        </q-item-section>
      </template>
      <RuleEditor :rule="branch.rules" @update-rule="handleRuleUpdates" />
    </q-expansion-item>
  </section>
</template>

<style scoped>
.main-options {
  display: flex;
  gap: 5px;
  min-width: 400px;
  ;
}

.main-options .option {
  width: 50%;
}

.branch-container {
  padding: 0.5em;
}
</style>
