import { withTimer, promises } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';

import { FileOptions, ModuleHandler } from '@util/types';
import { ProcessingModule } from '@shared/common.types';
import output from '@util/output';

type WithFileListHandlingArgs<T extends object> = {
    fileOptions: FileOptions;
    moduleHandler: ModuleHandler<T>;
    /** Information shared across modules if necessary */
    context?: T;
    onProgress?: (label: string, progress: number) => void;
    /** Configurations passed from the client: module configs */
    clientOptions?: ProcessingModule['options'];
    onEvent?: (message: string) => void;
};

/**
 * Take a module and iterate through with its handler over files
 */
export const withFileListHandling = async <T extends object = {}>({
    fileOptions,
    moduleHandler,
    onProgress,
    context,
    clientOptions,
}: WithFileListHandlingArgs<T>) => {
    const { filter, handler } = moduleHandler;

    let processed = 0;
    let filtered = 0;
    let errored = 0;
    let timeTaken = 0;

    /** For handlers to persist any temporary data needed */
    const dataStore: Record<string, any> = {};

    if (handler)
        await withTimer(
            async () => {
                await promises.map(fileOptions.filesWithMeta, async (fileWithMeta, i) => {
                    try {
                        const { filePath } = fileWithMeta;

                        const { fileName } = splitFileNameFromPath(filePath);

                        const shouldHandle = filter ? await filter(filePath) : true;

                        onProgress?.(fileName, Math.ceil((i / fileOptions.filesWithMeta.length) * 100));

                        /**
                         * If this file has been previously marked to skip, or we determine that now
                         */
                        if (!shouldHandle || (clientOptions?.skipPreviouslyFailed && fileWithMeta.previouslySkipped)) {
                            filtered++;
                            if (clientOptions?.skipPreviouslyFailed) fileWithMeta.previouslySkipped = true;
                            return;
                        }

                        await handler(
                            fileWithMeta,
                            {
                                onSuccess: () => {},
                                context,
                                clientOptions,
                            },
                            dataStore,
                        );

                        processed++;
                    } catch (e) {
                        console.log('Error with handler:', e);
                        errored++;

                        if (!clientOptions?.ignoreErrors) throw e;
                    }
                });

                await moduleHandler.onDone?.({ clientOptions }, dataStore, fileOptions);
            },
            (time) => {
                timeTaken = time;
            },
        );

    if (!handler && moduleHandler.onDone) await moduleHandler.onDone({ clientOptions }, dataStore, fileOptions);

    output.log(`Module ran in ${timeTaken}ms, ${fileOptions.filesWithMeta.length} files`);

    return {
        timeTaken,
        errored,
        filtered,
        processed,
    };
};
