<script setup lang="ts">
import { BranchingModule, ProcessingBranch } from '@shared/common.types';
import OptionsBranch from './OptionsBranch.vue';
import { getDefaultRule } from '@shared/rules.utils';

type Props = {
  processingModule: BranchingModule;
  // TODO: maybe more granular way than sending up the whole list
  handleModuleUpdated: (newData: BranchingModule, id: string) => void;
};

const props = defineProps<Props>();

const addBranch = () => {
  props.handleModuleUpdated({
    ...props.processingModule,
    branches: [...props.processingModule.branches, { rules: getDefaultRule() }]
  }, props.processingModule.id);
}
const editBranch = (branchData: ProcessingBranch | null, index: number) => {
  const targetedBranch = props.processingModule.branches[index];

  if (!targetedBranch) return;

  const newBranches = [...props.processingModule.branches];

  if (!branchData) {
    newBranches.splice(index, 1);
    return;
  }

  newBranches[index] = branchData;
  props.handleModuleUpdated({
    ...props.processingModule,
    branches: newBranches
  }, props.processingModule.id);
}

</script>

<template>
  <section class="branching-options">
    <div v-for="(branch, i) of processingModule.branches" class="branch-options">
      <OptionsBranch :branch="branch" :index="i" :handle-branch-change="editBranch" />
    </div>
    <button @click="addBranch">Add branch</button>
  </section>
</template>
