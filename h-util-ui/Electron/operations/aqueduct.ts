import path from 'path';
import { readdir } from 'fs/promises';
import { promises } from '@common/common';
import { AqueductLoadResponse, AqueductMessage } from '@shared/common.types';
import { db } from '../data/database';
import { pipelineDbToObject } from '../data/pipeline.db';
import { runPipelineForFiles } from './handler';
import { sendRendererMessage } from '@util/ipc';

export const handleAqueductMessage = async (message: AqueductMessage) => {
    switch (message.type) {
        case 'load':
            const rows = await db.aqueduct.findMany({
                include: {
                    pipeline: {
                        select: {
                            uuid: true,
                        },
                    },
                },
            });

            const result: AqueductLoadResponse = {
                data: rows.map((r) => ({
                    id: r.uuid,
                    pipelineId: r.pipeline.uuid,
                    name: r.name,
                    description: r.description ?? undefined,
                    directories: JSON.parse(r.directories),
                })),
            };

            return result;
        case 'run':
            const { aqueduct } = message;

            const response = await sendRendererMessage({
                type: 'requestPipeline',
                pipelineUuid: aqueduct.pipelineId,
            });

            const pipeline = response.type === 'pipelineData' ? response.pipeline : null;

            if (!pipeline) return;

            // todo: use shared helper getter to auto do these, or look up hooks in prisma
            const directories: string[] = aqueduct.directories;

            await promises.each(directories, async (directory) => {
                try {
                    const filePaths = (await readdir(directory)).map((file) => path.join(directory, file));

                    await runPipelineForFiles({
                        pipeline,
                        filePaths,
                    });
                } catch (e) {
                    console.error(e);
                }
            });
            break;
        case 'delete':
            await db.aqueduct.delete({
                where: {
                    uuid: message.aqueDuctId,
                },
            });

            break;
        case 'save':
            const { data } = message;

            const targetedPipeline = await db.pipeline.findFirst({
                where: {
                    uuid: data.pipelineId,
                },
                select: {
                    id: true,
                },
            });

            if (!targetedPipeline) return;

            const stringifiedDirs = JSON.stringify(data.directories);

            await db.aqueduct.upsert({
                where: {
                    uuid: data.id,
                },
                update: {
                    pipeline_id: targetedPipeline.id,
                    name: data.name,
                    description: data.description,
                    directories: stringifiedDirs,
                },
                create: {
                    uuid: data.id,
                    pipeline_id: targetedPipeline.id,
                    name: data.name,
                    description: data.description,
                    directories: stringifiedDirs,
                },
            });
            break;
        default:
    }
};
