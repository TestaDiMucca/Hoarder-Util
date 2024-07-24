import Folder from 'vue-material-design-icons/FolderUpload.vue';
import FileImageMinus from 'vue-material-design-icons/FileImageMinus.vue';
import VideoMinus from 'vue-material-design-icons/VideoMinus.vue'
import CalendarExport from 'vue-material-design-icons/CalendarExport.vue'
import DatabaseExport from 'vue-material-design-icons/DatabaseExport.vue'

import { ProcessingModuleType } from './types';
import { VueComponent } from './util.types';

export const MODULE_ICONS: Record<ProcessingModuleType, string> = {
    [ProcessingModuleType.subfolder]: '📂',
    [ProcessingModuleType.compressImage]: '📷',
    [ProcessingModuleType.compressVideo]: '🎥',
    [ProcessingModuleType.datePrefix]: '🗓',
    [ProcessingModuleType.metadata]: '📝',
};

export const MODULE_MATERIAL_ICONS: Record<ProcessingModuleType, VueComponent> = {
    [ProcessingModuleType.subfolder]: Folder,
    [ProcessingModuleType.compressImage]: FileImageMinus,
    [ProcessingModuleType.compressVideo]: VideoMinus,
    [ProcessingModuleType.datePrefix]: CalendarExport,
    [ProcessingModuleType.metadata]: DatabaseExport
};
