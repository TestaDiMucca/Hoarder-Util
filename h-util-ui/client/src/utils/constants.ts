import Folder from 'vue-material-design-icons/FolderUpload.vue';
import FileImageMinus from 'vue-material-design-icons/FileImageMinus.vue';
import VideoMinus from 'vue-material-design-icons/VideoMinus.vue';
import CalendarExport from 'vue-material-design-icons/CalendarExport.vue';
import DatabaseExport from 'vue-material-design-icons/DatabaseExport.vue';
import Printer from 'vue-material-design-icons/Printer.vue';
import Filter from 'vue-material-design-icons/FileCog.vue';
import TextSearch from 'vue-material-design-icons/TextSearch.vue';

import { ProcessingModule, ProcessingModuleType } from './types';
import { VueComponent } from './util.types';

/** If an emoji representation of the modules are needed */
export const MODULE_ICONS: Record<ProcessingModuleType, string> = {
    [ProcessingModuleType.subfolder]: '📂',
    [ProcessingModuleType.compressImage]: '📷',
    [ProcessingModuleType.compressVideo]: '🎥',
    [ProcessingModuleType.datePrefix]: '🗓',
    [ProcessingModuleType.metadata]: '📝',
    [ProcessingModuleType.iterate]: '🖨',
    [ProcessingModuleType.filter]: '🗑',
    [ProcessingModuleType.ocr]: '📖',
};

/** Icon representation of the module operations */
export const MODULE_MATERIAL_ICONS: Record<ProcessingModuleType, VueComponent> = {
    [ProcessingModuleType.subfolder]: Folder,
    [ProcessingModuleType.compressImage]: FileImageMinus,
    [ProcessingModuleType.compressVideo]: VideoMinus,
    [ProcessingModuleType.datePrefix]: CalendarExport,
    [ProcessingModuleType.metadata]: DatabaseExport,
    [ProcessingModuleType.iterate]: Printer,
    [ProcessingModuleType.filter]: Filter,
    [ProcessingModuleType.ocr]: TextSearch,
};

export const OPTION_LABELS: Record<ProcessingModuleType, string | null> = {
    [ProcessingModuleType.subfolder]: 'Directory name',
    [ProcessingModuleType.compressImage]: 'Quality (%)',
    [ProcessingModuleType.compressVideo]: 'Quality (%)',
    /** Temp: accept format strings in future. */
    [ProcessingModuleType.datePrefix]: null,
    [ProcessingModuleType.metadata]: null,
    [ProcessingModuleType.iterate]: 'Output file name',
    [ProcessingModuleType.filter]: 'Filename match',
    [ProcessingModuleType.ocr]: 'Search string (CSV supported)',
};

/** Get a default starter module */
export const getDefaultModule = (): ProcessingModule => ({
    type: ProcessingModuleType.datePrefix,
    options: {
        value: '',
    },
});

export const MAX_TASKS = 5;
