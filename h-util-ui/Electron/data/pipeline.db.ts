import { Pipeline, ProcessingModule } from '@shared/common.types';
import { db } from './database';

export const upsertPipeline = async (pipeline: Pipeline) => {
    // upsert the modules
    // upsert pipeline
    // create joins
};

/**
 * These are not bulk so we can use the upsert. Not high traffic throughput application
 * so for now will only bulk when necessary.
 */
export const upsertModule = async (processingModules: ProcessingModule[]) => {
    //
};

export const joinModuleWithPipeline = async (moduleId: number, pipelineId: number) =>
    db.pipelineModule.upsert({
        where: {
            pipelineModuleId: {
                module_id: moduleId,
                pipeline_id: pipelineId,
            },
        },
        update: {},
        create: {
            pipeline: { connect: { id: pipelineId } },
            module: { connect: { id: moduleId } },
        },
    });

export const removePipeline = (pipelineUuid: string) =>
    db.pipeline.delete({
        where: {
            uuid: pipelineUuid,
        },
    });

export const getAllPipelines = async (): Promise<Pipeline[]> => {
    const fetched = await db.pipeline.findMany({
        include: {
            pipeline_modules: {
                include: {
                    module: true,
                },
            },
        },
    });

    return fetched.map((pipelineRow) => {
        return {
            id: pipelineRow.uuid,
            name: pipelineRow.name,
            manualRanking: pipelineRow.manual_ranking,
            created: pipelineRow.created.toISOString(),
            modified: pipelineRow.modified.toISOString(),
            color: pipelineRow.color ?? undefined,
            processingModules: pipelineRow.pipeline_modules.map(({ module }) => ({
                ...(JSON.parse(module.data) as ProcessingModule),
            })),
        };
    });
};
