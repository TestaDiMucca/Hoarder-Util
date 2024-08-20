import { ProcessingModuleType } from '@shared/common.types';

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
