<script setup lang="ts">
import { ProcessingBranch, ProcessingModule } from '@shared/common.types';
import { Rule } from '@shared/rules.types';
import RuleEditor from 'src/components/common/RuleEditor.vue';
import { computed, inject, Ref } from 'vue';

type Props = {
  moduleId: string;
  branch: ProcessingBranch;
  index: number;
  handleBranchChange: (branch: ProcessingBranch | null, index: number) => void;
};

const props = defineProps<Props>();

const pipelineModules = inject<Ref<ProcessingModule[]>>('pipelineModules');

const handleLabelChange = (label: string | number | null) => {
  const newBranch = {
    ...props.branch,
    label: label ? String(label) : undefined
  }

  props.handleBranchChange(newBranch, props.index);
}

const handleRuleUpdates = (rules: Rule) => {
  const newBranch = {
    ...props.branch,
    rules
  }

  props.handleBranchChange(newBranch, props.index);
}

const handleModuleUpdate = (opt) => {
  const newBranch = {
    ...props.branch,
    targetModule: opt.value
  }

  props.handleBranchChange(newBranch, props.index);
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
      <RuleEditor :rule="branch.rules" :onUpdatedRule="handleRuleUpdates" />
    </q-expansion-item>
  </section>
</template>

<style scoped>
.main-options {
  display: flex;
  gap: var(--spacer-gap);
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
