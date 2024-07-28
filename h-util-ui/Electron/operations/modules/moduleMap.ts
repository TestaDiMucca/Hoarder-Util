import { ProcessingModuleType } from '../../../common/common.types';
import { ModuleHandler } from '../../util/types';

import datePrefixHandler from './datePrefix.handler';

export const MODULE_MAP: Record<ProcessingModuleType, ModuleHandler | null> = {
    [ProcessingModuleType.datePrefix]: datePrefixHandler,
    [ProcessingModuleType.subfolder]: null,
    [ProcessingModuleType.metadata]: null,
    [ProcessingModuleType.compressImage]: null,
    [ProcessingModuleType.compressVideo]: null,
};
