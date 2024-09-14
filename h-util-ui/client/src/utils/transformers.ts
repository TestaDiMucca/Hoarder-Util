import { v4 as uuidv4 } from 'uuid';
import { ActionModule, Pipeline, ProcessingModule, ProcessingModuleType } from '../../../common/common.types';

type LegacyPipelineModule = Omit<ActionModule, 'nextModule' | 'id'>;

export const transformLegacyPipelineMap = (pipelines: Record<string, Pipeline>) => {
    Object.keys(pipelines).forEach((pipelineKey) => {
        pipelines[pipelineKey] = {
            ...pipelines[pipelineKey],
            processingModules: transformLegacyModules(pipelines[pipelineKey].processingModules),
        };
    });

    return pipelines;
};

export const transformLegacyModules = (importModules: Array<LegacyPipelineModule | ProcessingModule>) => {
    importModules.forEach((importModule, i) => {
        if ((importModule as ProcessingModule).id) return;

        /** Fill in uuids and nextModules */
        const castModule = importModule as ProcessingModule;
        castModule.id = uuidv4();

        if (i === 0) return;

        const lastModule = importModules[i - 1] as ProcessingModule;
        if (lastModule.type !== ProcessingModuleType.branch && !lastModule.nextModule)
            lastModule.nextModule = castModule.id;
    });

    return importModules as ProcessingModule[];
};
