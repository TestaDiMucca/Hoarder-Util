import { v4 as uuidV4 } from 'uuid';
import { Aqueduct, ProcessingModuleType } from '@shared/common.types';

/**
 * Filtering type modules can be inverted
 */
export const getModuleCanInvert = (type: ProcessingModuleType) => {
    switch (type) {
        case ProcessingModuleType.filter:
        case ProcessingModuleType.ruleFilter:
        case ProcessingModuleType.ocr:
            return true;
        default:
            return false;
    }
};

export const getDefaultAqueduct = (id = uuidV4()): Aqueduct => ({
    id,
    name: `Novus acquaeductus ${new Date().toISOString()}`,
    pipelineId: '',
    directories: [],
});
