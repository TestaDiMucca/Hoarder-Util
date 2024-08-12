import { withTimer, promises } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';

import { FileOptions, ModuleHandler } from '../utils/types';
import { ProcessingModule } from '../../common/common.types';
import output from '../utils/output';

type WithFileListHandlingArgs<T extends object> = {
    fileOptions: FileOptions;
    moduleHandler: ModuleHandler<T>;
    /** Information shared across modules if necessary */
    context?: T;
    onProgress?: (label: string, progress: number) => void;
    /** Configurations passed from the client: module configs */
    clientOptions?: ProcessingModule['options'];
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
    let processed = 0;
    let filtered = 0;
    let errored = 0;
    let timeTaken = 0;

    await withTimer(
        async () => {
            /** For handlers to persist any temporary data needed */
            const dataStore: Record<string, any> = {};

            await promises.map(fileOptions.filesWithMeta, async (fileWithMeta, i) => {
                try {
                    const { filter, handler } = moduleHandler;
                    const { filePath } = fileWithMeta;

                    const { fileName } = splitFileNameFromPath(filePath);

                    // In future if option is selected, can also filter based on previous fail
                    const shouldHandle = filter ? await filter(filePath) : true;

                    onProgress?.(fileName, Math.ceil((i / fileOptions.filesWithMeta.length) * 100));

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
                        dataStore
                    );

                    processed++;
                } catch (e) {
                    console.log(e);
                    errored++;

                    if (!clientOptions?.ignoreErrors) throw e;
                }
            });

            await moduleHandler.onDone?.({ clientOptions }, dataStore, fileOptions);
        },
        (time) => {
            timeTaken = time;
        }
    );

    output.log(`Module ran in ${timeTaken}ms, ${fileOptions.filesWithMeta.length} files`);

    return {
        timeTaken,
        errored,
        filtered,
        processed,
    };
};
