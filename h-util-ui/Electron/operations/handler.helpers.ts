import { withTimer, promises } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';

import { ModuleHandler } from '../util/types';
import { ProcessingModule } from '../../common/common.types';

type WithFileListHandlingArgs<T extends object> = {
    fileList: string[];
    moduleHandler: ModuleHandler<T>;
    context?: T;
    onProgress?: (label: string, progress: number) => void;
    clientOptions?: ProcessingModule['options'];
};

/**
 * Take a module and iterate through with its handler over files
 */
export const withFileListHandling = async <T extends object = {}>({
    fileList,
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
            await promises.map(fileList, async (filePath, i) => {
                try {
                    const { filter, handler } = moduleHandler;

                    const { fileName } = splitFileNameFromPath(filePath);
                    const shouldHandle = await filter(filePath);

                    onProgress?.(fileName!, Math.round(i / fileList.length) * 100);

                    if (!shouldHandle) {
                        filtered++;
                        return;
                    }

                    await handler(filePath, {
                        onSuccess: () => {
                            processed++;
                        },
                        context,
                        clientOptions,
                    });
                } catch (e) {
                    console.log(e);
                    errored++;
                }
            });
        },
        (time) => {
            timeTaken = time;
        },
    );

    return {
        timeTaken,
        errored,
        filtered,
        processed,
    };
};
