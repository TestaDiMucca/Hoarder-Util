import Folder from 'vue-material-design-icons/FolderUpload.vue';
import FileImageMinus from 'vue-material-design-icons/FileImageMinus.vue';
import VideoMinus from 'vue-material-design-icons/VideoMinus.vue';
import CalendarExport from 'vue-material-design-icons/CalendarExport.vue';
import DatabaseExport from 'vue-material-design-icons/DatabaseExport.vue';
import Printer from 'vue-material-design-icons/Printer.vue';
import Filter from 'vue-material-design-icons/FileCog.vue';
import TextSearch from 'vue-material-design-icons/TextSearch.vue';
import FileDocument from 'vue-material-design-icons/FileDocumentArrowRight.vue';

import { ProcessingModule, ProcessingModuleType } from './types';
import { VueComponent } from './util.types';
import OptionsStandard from 'src/components/EditPipeline/PipelineOptions/OptionsStandard.vue';
import OptionsDirectory from 'src/components/EditPipeline/PipelineOptions/OptionsDirectory.vue';

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
    [ProcessingModuleType.report]: '📉',
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
    [ProcessingModuleType.report]: FileDocument,
};

/**
 * Providing no label means this module has no option
 */
export const OPTION_LABELS: Record<ProcessingModuleType, string | null> = {
    [ProcessingModuleType.subfolder]: 'Directory name',
    [ProcessingModuleType.compressImage]: 'Quality (0-100%)',
    /** Where 0 CRF is lossless and 23 is "standard" */
    [ProcessingModuleType.compressVideo]: 'Quality (0-51 CRF)',
    /** Temp: accept format strings in future. */
    [ProcessingModuleType.datePrefix]: null,
    [ProcessingModuleType.metadata]: null,
    [ProcessingModuleType.iterate]: 'Output file name',
    [ProcessingModuleType.filter]: 'Filename match',
    [ProcessingModuleType.ocr]: 'Search string (CSV supported)',
    [ProcessingModuleType.report]: 'Save directory',
};

export const getOptionsComponent = (moduleType: ProcessingModuleType) => {
    switch (moduleType) {
        case ProcessingModuleType.datePrefix:
        case ProcessingModuleType.metadata:
            return null;
        case ProcessingModuleType.report:
            return OptionsDirectory;
        default:
            return OptionsStandard;
    }
};

/** Get a default starter module */
export const getDefaultModule = (): ProcessingModule => ({
    type: ProcessingModuleType.datePrefix,
    options: {
        value: '',
        inverse: false,
        ignoreErrors: true,
        skipPreviouslyFailed: false,
    },
});

export const MAX_TASKS = 5;

export const DEFAULT_RANKING = 100;
