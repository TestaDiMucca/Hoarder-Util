import { detachPromise, promises, withTimer } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';
import { ActionModule, ProcessingModule, ProcessingModuleType, ProcessingRequest } from '@shared/common.types';
import { ProcessingError } from '@util/errors';
import { updateTaskProgress } from '@util/ipc';
import { CommonContext, FileOptions, ModuleHandler } from '@util/types';
import { addEventLogForReport, fileListToFileOptions } from './handler.helpers';
import { MODULE_MAP } from './modules/moduleMap';
import { addPipelineRunStat } from '../data/stats.db';

let taskId = 0;
const MAX_MODULE_LENGTH = 100;

export const runPipelineForFiles = async (params: ProcessingRequest) => {
    const { filePaths, pipeline } = params;

    if (filePaths.length === 0 || pipeline.processingModules.length === 0) return;

    const pipelineId = pipeline.id!;

    let timeTaken = 0;

    /** Track log only if we need to */
    const hasReporter = pipeline.processingModules.find((m) => m.type === ProcessingModuleType.report);
    const commonContext: CommonContext = {
        pipelineId: pipeline.id,
        ...(hasReporter ? { eventLog: [], pipelineName: pipeline.name } : {}),
    };

    const mainUpdate = (mainName: string, progress: number, subName?: string, subProgress?: number) => {
        updateTaskProgress({
            id: taskId,
            pipelineId,
            name: mainName,
            progress,
            subName,
            subProgress,
        });
    };

    let currentFile = 'none';
    let handled = 0;
    let progress = 0;

    const fileOptions: FileOptions = fileListToFileOptions(filePaths);

    const modulesById = pipeline.processingModules.reduce<Record<string, ProcessingModule>>((a, v) => {
        a[v.id] = v;
        return a;
    }, {});

    const onDoneMap: Record<string, ModuleHandler['onDone']> = {};

    await withTimer(
        async () => {
            /** We don't know what they are up here, we're not concerned. Modules will handle. */
            const moduleDataStores: Record<string, object> = {};

            await promises.each(fileOptions.filesWithMeta, async (fileWithMeta) => {
                let nextModule: ProcessingModule | null = pipeline.processingModules[0];
                let modulesIterated = 0;
                let handling = true;

                const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);
                currentFile = fileName;

                mainUpdate(fileName, progress);

                // todo: refactor/clean
                try {
                    while (!!nextModule && modulesIterated < MAX_MODULE_LENGTH && handling) {
                        if (nextModule.type === ProcessingModuleType.branch) continue;

                        let ignoreError = false;
                        try {
                            const moduleHandler = MODULE_MAP[nextModule.type];

                            if (!moduleHandler) throw new ProcessingError(`No handler for module ${nextModule.type}`);

                            if (nextModule.options.ignoreErrors) ignoreError = true;

                            const { filter, onDone, handler } = moduleHandler;
                            const shouldHandle = filter ? await filter(fileWithMeta.filePath) : true;

                            /** File doesn't apply for this module, move on */
                            if (!shouldHandle) break;

                            if (!moduleDataStores[nextModule.id]) moduleDataStores[nextModule.id] = {};

                            // todo: incremental progress e.g. for media?
                            await handler?.(
                                fileWithMeta,
                                {
                                    context: commonContext,
                                    clientOptions: nextModule.options,
                                },
                                moduleDataStores[nextModule.id],
                            );

                            /** Add to onDone map for final runs */
                            if (onDone && !onDoneMap[nextModule.id]) onDoneMap[nextModule.id] = onDone;

                            /** Immediately cease all handling if a filter module eliminated this file */
                            if (fileWithMeta.remove) handling = false;
                        } catch (e: any) {
                            addEventLogForReport({ context: commonContext }, fileName, 'errored', e.message);
                            if (!ignoreError) throw e;
                        } finally {
                            modulesIterated++;
                            const searchModule: ProcessingModule | null = nextModule.nextModule
                                ? modulesById[nextModule.nextModule]
                                : null;
                            nextModule = searchModule ?? null;
                        }
                    }
                } catch (e) {
                    if (e instanceof ProcessingError) {
                        /* ignore for now, unless specified to not ignore errors */
                    } else {
                        /* real error */
                        console.error('[runPipeline]', e);
                        throw e;
                    }
                }

                handled++;
                progress = Math.ceil((handled / filePaths.length) * 100);

                mainUpdate(fileName, progress);
            });

            /** Run all onDone handlers */
            await promises.each(Object.entries(onDoneMap), async ([moduleId, cb]) => {
                const clientOptions = (modulesById[moduleId] as ActionModule).options;
                await cb?.({ context: commonContext, clientOptions }, moduleDataStores[moduleId]);
            });
        },
        (time) => {
            timeTaken = time;
        },
    );

    detachPromise({
        cb: async () => {
            await addPipelineRunStat(pipeline.id, 'times_ran', 1);
            await addPipelineRunStat(pipeline.id, 'time_taken', timeTaken);
            await addPipelineRunStat(pipeline.id, 'files_processed', handled);
        },
    });

    // take each file individually through the pipeline, using next to determine follow-up module
    // put a cap on module length to prevent infinite loops
    // set up common context, shared across all modules, all files
    // set up data stores indexed by module ID which is passed into handlers

    // for each file, cycle through the modules
    // If module has an onDone handler, dump it at end with a way for it to access the dataStore
};
