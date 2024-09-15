import { v4 as uuidv4 } from 'uuid';
import { Pipeline, ProcessingModule } from '@shared/common.types';
import { db } from './database';
import { promises } from '@common/common';

export const upsertPipeline = async (pipeline: Pipeline) => {
    // upsert the modules
    const processingModules = await promises.mapSeries(pipeline.processingModules, (module) => upsertModule(module));
    // upsert pipeline
    const dbPipeline = await db.pipeline.upsert({
        where: {
            uuid: pipeline.id,
        },
        update: {},
        create: {
            uuid: pipeline.id ?? uuidv4(),
            name: pipeline.name,
            color: pipeline.color,
            manual_ranking: pipeline.manualRanking,
        },
    });
    // create joins
    await promises.each(processingModules, ({ id }) => joinModuleWithPipeline(id, dbPipeline.id));
};

/**
 * These are not bulk so we can use the upsert. Not high traffic throughput application
 * so for now will only bulk when necessary.
 */
export const upsertModule = async (processingModules: ProcessingModule) =>
    db.module.upsert({
        where: {
            uuid: processingModules.id,
        },
        update: {},
        create: {
            uuid: processingModules.id,
            data: JSON.stringify(processingModules),
        },
    });

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

export const getAllPipelines = async (withStats = false): Promise<Pipeline[]> => {
    const fetched = await db.pipeline.findMany({
        include: {
            pipeline_modules: {
                include: {
                    module: true,
                },
            },
            pipeline_stats: withStats,
        },
    });

    console.log('sql fetch', fetched);

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
