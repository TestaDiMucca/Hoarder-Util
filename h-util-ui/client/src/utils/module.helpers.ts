import { ProcessingModuleType } from '@shared/common.types';

/**
 * Filtering type modules can be inverted
 */
export const getModuleCanInvert = (type: ProcessingModuleType) => {
    switch (type) {
        case ProcessingModuleType.filter:
        case ProcessingModuleType.ocr:
            return true;
        case ProcessingModuleType.datePrefix:
        case ProcessingModuleType.metadata:
        case ProcessingModuleType.compressImage:
        case ProcessingModuleType.compressVideo:
        case ProcessingModuleType.subfolder:
        case ProcessingModuleType.iterate:
            return false;
    }
};
