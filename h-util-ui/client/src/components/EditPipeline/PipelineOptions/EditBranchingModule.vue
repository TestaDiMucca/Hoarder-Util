<script setup lang="ts">
import { BranchingModule, ProcessingBranch } from '@shared/common.types';
import OptionsBranch from './OptionsBranch.vue';
import { getDefaultRule } from '@shared/rules.utils';

type Props = {
  processingModule: BranchingModule;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', data: Partial<BranchingModule>): void;
}>();

const addBranch = () => {
  emit('update', { branches: [...props.processingModule.branches, { rules: getDefaultRule() }] })
}

const editBranch = (branchData: Partial<ProcessingBranch> | null, index: number) => {
  const targetedBranch = props.processingModule.branches[index];

  if (!targetedBranch) return;

  const newBranches = [...props.processingModule.branches];

  if (!branchData) {
    newBranches.splice(index, 1);
    return;
  }

  newBranches[index] = {
    ...targetedBranch,
    ...branchData,
  };

  emit('update', { branches: newBranches });
}
</script>

<template>
  <section class="branching-options">
    <div v-for="(branch, i) of processingModule.branches" class="branch-options">
      <OptionsBranch :module-id="processingModule.id" :branch="branch" :index="i" @update="editBranch($event, i)" />
    </div>
    <button @click="addBranch">Add branch</button>
  </section>
</template>

<style scoped>
.branching-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacer-gap);
  max-height: 60vh;
  overflow-y: auto;
}
</style>