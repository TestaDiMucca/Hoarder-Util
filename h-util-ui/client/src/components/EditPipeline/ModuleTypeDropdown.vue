<script setup lang="ts">
import { ProcessingModuleType } from '@shared/common.types';
import DropdownMenu, { MenuItem } from '../common/DropdownMenu.vue';

interface Props {
  handleModuleTypeSelect: (moduleType: ProcessingModuleType) => void;
}

const props = defineProps<Props>();

const handleModuleTypeSelect = (type: ProcessingModuleType) => () => props.handleModuleTypeSelect(type);

const menuItems: MenuItem[] = [
  {
    type: 'item',
    label: 'Place in directory',
    onClick: handleModuleTypeSelect(ProcessingModuleType.subfolder)
  },
  {
    type: 'separator'
  },
  {
    type: 'item',
    label: 'Metadata tag',
    onClick: handleModuleTypeSelect(ProcessingModuleType.metadata)
  },
  {
    type: 'item',
    label: 'Date prefix',
    onClick: handleModuleTypeSelect(ProcessingModuleType.datePrefix)
  },
  {
    type: 'item',
    label: 'Dynamic renaming',
    onClick: handleModuleTypeSelect(ProcessingModuleType.dynamicRename)
  },
  { type: 'separator' },
  {
    type: 'item',
    label: 'Iterate',
    onClick: handleModuleTypeSelect(ProcessingModuleType.iterate)
  },
  {
    type: 'item',
    label: 'Log results',
    onClick: handleModuleTypeSelect(ProcessingModuleType.report)
  },
  {
    type: 'group',
    label: 'Media compression',
    items: [
      {
        type: 'item',
        label: 'Compress image',
        onClick: handleModuleTypeSelect(ProcessingModuleType.compressImage)
      },
      {
        type: 'item',
        label: 'Compress video',
        onClick: handleModuleTypeSelect(ProcessingModuleType.compressVideo)
      },
    ]
  },
  {
    type: 'group',
    label: 'Filtering',
    items: [
      {
        type: 'item',
        label: 'Filter by Rules',
        onClick: handleModuleTypeSelect(ProcessingModuleType.ruleFilter)
      },
      {
        type: 'item',
        label: 'Filter file',
        onClick: handleModuleTypeSelect(ProcessingModuleType.filter)
      },
      {
        type: 'item',
        label: 'Search image for text',
        onClick: handleModuleTypeSelect(ProcessingModuleType.ocr)
      },
    ]
  }
]
</script>

<template>
  <DropdownMenu :menuItems="menuItems" />
</template>