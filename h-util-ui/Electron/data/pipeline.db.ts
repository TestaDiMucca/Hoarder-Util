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
        update: {
            // todo: condense, re-use
            name: pipeline.name,
            color: pipeline.color,
            manual_ranking: pipeline.manualRanking,
        },
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
export const upsertModule = async (processingModule: ProcessingModule) =>
    db.module.upsert({
        where: {
            uuid: processingModule.id,
        },
        update: {
            data: JSON.stringify(processingModule),
        },
        create: {
            uuid: processingModule.id,
            data: JSON.stringify(processingModule),
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

export const removePipeline = async (pipelineUuid: string, removeModules = true) => {
    /** When modules become re-usable, we'll want to check that there's only 1 pipeline here */
    if (removeModules) {
        await db.$executeRaw`
        DELETE FROM Module
        WHERE id IN (
            SELECT r.id FROM Module m
            JOIN PipelineModule pm ON pm.module_id = m.id
            JOIN Pipeline p ON p.id = pm.pipeline_id
            WHERE p.uuid = ${pipelineUuid}
        );
        `;
    }

    /** Join table rows should cascade */
    await db.pipeline.delete({
        where: {
            uuid: pipelineUuid,
        },
    });
};

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

    return fetched.map((pipelineRow) => {
        return {
            id: pipelineRow.uuid,
            name: pipelineRow.name,
            manualRanking: pipelineRow.manual_ranking,
            created: pipelineRow.created.toISOString(),
            modified: pipelineRow.modified.toISOString(),
            color: pipelineRow.color ?? undefined,
            timesRan: pipelineRow.pipeline_stats?.[0]?.times_ran,
            processingModules: pipelineRow.pipeline_modules.map(({ module }) => ({
                ...(JSON.parse(module.data) as ProcessingModule),
            })),
        };
    });
};
