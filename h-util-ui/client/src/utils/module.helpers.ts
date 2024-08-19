import { ModuleOptionType, ProcessingModuleType } from '@shared/common.types';

/**
 * Filtering type modules can be inverted
 */
export const getModuleCanInvert = (type: ProcessingModuleType) => {
    switch (type) {
        case ProcessingModuleType.filter:
        case ProcessingModuleType.ocr:
            return true;
        default:
            return false;
    }
};

/**
 * Determines what editor to show for configuring the option value
 */
export const getModuleOptionType = (type: ProcessingModuleType): ModuleOptionType => {
    switch (type) {
        case ProcessingModuleType.report:
            return ModuleOptionType.dir;
        default:
            return ModuleOptionType.string;
    }
};
