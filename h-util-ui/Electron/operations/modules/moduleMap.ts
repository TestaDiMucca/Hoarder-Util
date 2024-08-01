import { ProcessingModuleType } from '@shared/common.types';
import { ModuleHandler } from '@util/types';

import datePrefixHandler from './datePrefix.handler';
import moveDirectoryHandler from './moveDirectory.handler';
import nameTagHandler from './nameTag.handler';
import iterateHandler from './iterate.handler';
import filterHandler from './filter.handler';

export const MODULE_MAP: Record<ProcessingModuleType, ModuleHandler | null> = {
    [ProcessingModuleType.datePrefix]: datePrefixHandler,
    [ProcessingModuleType.subfolder]: moveDirectoryHandler,
    [ProcessingModuleType.metadata]: nameTagHandler,
    [ProcessingModuleType.compressImage]: null,
    [ProcessingModuleType.compressVideo]: null,
    [ProcessingModuleType.iterate]: iterateHandler,
    [ProcessingModuleType.filter]: filterHandler,
};
