import { v4 as uuidv4 } from 'uuid';
import { Pipeline, ProcessingModule } from '@shared/common.types';
import { promises } from '@common/common';
import { db } from './database';
import { OptionalKey } from '@util/types';
import { database } from './sqlite';

export const sqUpsertPipeline = (pipeline: Pipeline) => {
    // const upsertPipeline = database.prepare<any, { id: number }>(`--sql
    //     INSERT INTO Pipeline (uuid, name, color, manual_ranking)
    //     VALUES (@uuid, @name, @color, @manual_ranking)
    //     ON CONFLICT(uuid) DO UPDATE SET
    //         name = excluded.name,
    //         color = excluded.color,
    //         manual_ranking = excluded.manual_ranking
    //         modified = CURRENT_TIMESTAMP
    //     RETURNING id
    // `);
    // const upsertModule = database.prepare<any, { id: number }>(`--sql
    //     INSERT INTO Module (uuid, name, data)
    //     VALUES (@uuid, @name, @data)
    //     ON CONFLICT(uuid) DO UPDATE SET
    //         name = excluded.name,
    //         data = excluded.data
    //     RETURNING id
    // `);
    // const upsertPipelineModule = database.prepare(`--sql
    //     INSERT INTO PipelineModule (pipeline_id, module_id)
    //     VALUES (@pipeline_id, @module_id)
    //     ON CONFLICT(pipeline_id, module_id) DO NOTHING
    // `);
    // database.transaction(() => {
    //     const pipelineId = upsertPipeline.get({ uuid: pipeline.id, name: pipeline.name })?.id;
    //     pipeline.processingModules.forEach((module) => {
    //         const moduleId = upsertModule.get({
    //             uuid: module.id,
    //             data: JSON.stringify(module),
    //         })?.id;
    //         upsertPipelineModule.run({ pipeline_id: pipelineId, module_id: moduleId });
    //     });
    //     return pipelineId;
    // });
};

export const upsertPipeline = async (pipeline: Pipeline) => {
    const processingModules = await promises.mapSeries(pipeline.processingModules, (module) => upsertModule(module));
    const dbPipeline = await db.pipeline.upsert({
        where: {
            uuid: pipeline.id,
        },
        update: {
            name: pipeline.name,
            color: pipeline.color,
            manual_ranking: pipeline.manualRanking,
        },
        create: {
            uuid: pipeline.id ?? uuidv4(),
            name: pipeline.name,
            color: pipeline.color,
            manual_ranking: Number(pipeline.manualRanking),
        },
    });

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

const fetchAll = (withStats = false) =>
    db.pipeline.findMany({
        include: {
            pipeline_modules: {
                include: {
                    module: true,
                },
            },
            pipeline_stats: withStats,
        },
    });

export const getAllPipelines = async (withStats = false): Promise<Pipeline[]> => {
    const fetched = await fetchAll(withStats);

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

type JoinedDbRow = Awaited<ReturnType<typeof fetchAll>>[number];

export const pipelineDbToObject = (pipelineRow: OptionalKey<JoinedDbRow, 'pipeline_stats'>): Pipeline => ({
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
});
