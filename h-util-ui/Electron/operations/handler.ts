import { detachPromise, promises, withTimer } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';
import { ActionModule, ProcessingModule, ProcessingModuleType, ProcessingRequest } from '@shared/common.types';
import { ProcessingError } from '@util/errors';
import { updateTaskProgress } from '@util/ipc';
import { CommonContext, FileOptions, FileWithMeta, ModuleHandler } from '@util/types';
import { addEventLogForReport, fileListToFileOptions } from './handler.helpers';
import { MODULE_MAP } from './modules/moduleMap';
import { addPipelineRunStat } from '../data/stats.db';
import branchingHandler from './modules/branching.handler';

let taskId = 0;
const MAX_MODULE_LENGTH = 100;

/** Top level does not know what this is. Gives modules places to store data. */
type ModuleDataStore = Record<string, object>;

/** Store on done callbacks to run at the end of processing */
type OnDoneMap = Record<string, ModuleHandler['onDone']>;

/**
 * Full flow for running a pipeline.
 */
export const runPipelineForFiles = async (params: ProcessingRequest) => {
    taskId++;
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

    const onDoneMap: OnDoneMap = {};

    await withTimer(
        async () => {
            /** We don't know what they are up here, we're not concerned. Modules will handle. */
            const moduleDataStores: ModuleDataStore = {};

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
                        if (nextModule.type === ProcessingModuleType.branch) {
                            const matchingModuleId: string | null = await branchingHandler(
                                nextModule,
                                fileWithMeta.filePath,
                            );
                            console.log('matches,', matchingModuleId);
                            modulesIterated++;
                            const searchModule: ProcessingModule | null = matchingModuleId
                                ? modulesById[matchingModuleId]
                                : null;
                            nextModule = searchModule ?? null;
                            continue;
                        }

                        await runModuleForFile({
                            processingModule: nextModule,
                            fileWithMeta,
                            commonContext,
                            moduleDataStores,
                            onDoneMap,
                        });

                        /** Immediately cease all handling if a filter module eliminated this file */
                        if (fileWithMeta.remove) handling = false;

                        modulesIterated++;
                        const searchModule: ProcessingModule | null = nextModule.nextModule
                            ? modulesById[nextModule.nextModule]
                            : null;
                        nextModule = searchModule ?? null;
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
};

export const runModuleForFile = async <T extends object = {}>({
    processingModule,
    fileWithMeta,
    commonContext,
    moduleDataStores,
    onDoneMap,
}: {
    processingModule: ProcessingModule;
    fileWithMeta: FileWithMeta;
    commonContext: CommonContext & T;
    moduleDataStores?: ModuleDataStore;
    onDoneMap?: OnDoneMap;
}) => {
    // TODO: support
    if (processingModule.type === ProcessingModuleType.branch) return;

    const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);
    let ignoreError = false;
    try {
        const moduleHandler = MODULE_MAP[processingModule.type];

        if (!moduleHandler) throw new ProcessingError(`No handler for module ${processingModule.type}`);

        if (processingModule.options.ignoreErrors) ignoreError = true;

        const { filter, onDone, handler } = moduleHandler;
        const shouldHandle = filter ? await filter(fileWithMeta.filePath) : true;

        /** File doesn't apply for this module, move on */
        if (!shouldHandle && processingModule.options.skipPreviouslyFailed) fileWithMeta.remove = true;
        if (!shouldHandle) return;

        if (moduleDataStores && !moduleDataStores[processingModule.id]) moduleDataStores[processingModule.id] = {};

        // todo: incremental progress e.g. for media?
        await handler?.(
            fileWithMeta,
            {
                context: commonContext,
                clientOptions: processingModule.options,
            },
            moduleDataStores?.[processingModule.id] ?? {},
        );

        /** Add to onDone map for final runs */
        if (onDone && onDoneMap && !onDoneMap[processingModule.id]) onDoneMap[processingModule.id] = onDone;
    } catch (e: any) {
        addEventLogForReport({ context: commonContext }, fileName, 'errored', e.message);
        if (!ignoreError) throw e;
    } finally {
    }
};

export const handleClientMessage = (message: string) => {
    console.log(`[client-message] ${message}`);
};
