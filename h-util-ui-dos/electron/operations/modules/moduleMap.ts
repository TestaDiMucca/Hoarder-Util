import { ProcessingModuleType } from '../../../common/common.types';
import { ModuleHandler } from '../../utils/types';

import datePrefixHandler from './datePrefix.handler';
import moveDirectoryHandler from './moveDirectory.handler';
import nameTagHandler from './nameTag.handler';
import iterateHandler from './iterate.handler';
import filterHandler from './filter.handler';
import jpgCompressHandler from './jpgCompress.handler';
import ocrHandler from './ocr.handler';
import movCompressHandler from './movCompress.handler';

export const MODULE_MAP: Record<ProcessingModuleType, ModuleHandler | null> = {
    [ProcessingModuleType.datePrefix]: datePrefixHandler,
    [ProcessingModuleType.subfolder]: moveDirectoryHandler,
    [ProcessingModuleType.metadata]: nameTagHandler,
    [ProcessingModuleType.compressImage]: jpgCompressHandler,
    [ProcessingModuleType.compressVideo]: movCompressHandler,
    [ProcessingModuleType.iterate]: iterateHandler,
    [ProcessingModuleType.filter]: filterHandler,
    [ProcessingModuleType.ocr]: ocrHandler,
};
