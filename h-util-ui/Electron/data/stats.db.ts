import { PipelineStats } from '@prisma/client';
import { db } from './database';
import { PipelineStatsPayload } from '@shared/common.types';

export const getStats = async (): Promise<PipelineStatsPayload[]> => {
    const rows = await db.pipelineStats.findMany({
        include: {
            pipeline: {
                select: {
                    uuid: true,
                    name: true,
                },
            },
        },
    });

    return rows.map<PipelineStatsPayload>((r) => ({
        pipelineId: r.pipeline.uuid,
        pipelineName: r.pipeline.name,
        timesRan: r.times_ran,
        wordsParsed: r.words_parsed,
        timeTaken: r.time_taken,
        bytesCompressed: r.bytes_compressed,
    }));
};

/**
 * This is a three-part
 */
export const addPipelineRunStat = async (
    pipelineUuid: string,
    stat: keyof Omit<PipelineStats, 'id' | 'pipeline_id'>,
    amount: number = 1,
) => {
    await db.$transaction(async (db) => {
        const pipeline = await db.pipeline.findFirst({
            where: {
                uuid: pipelineUuid,
            },
            select: {
                id: true,
                pipeline_stats: true,
            },
        });

        if (!pipeline) return;

        if (pipeline.pipeline_stats.length === 0) {
            await db.pipelineStats.create({
                data: {
                    pipeline_id: pipeline.id,
                },
            });
        }

        await db.pipelineStats.update({
            where: {
                pipeline_id: pipeline.id,
            },
            data: {
                [stat]: {
                    increment: amount,
                },
            },
        });
    });
};
