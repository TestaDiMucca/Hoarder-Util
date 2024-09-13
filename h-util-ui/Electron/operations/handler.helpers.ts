import path from 'path';
import fs from 'fs/promises';

import { withTimer, promises } from '@common/common';
import {
    splitFileNameFromPath,
    checkSupportedExt,
    ffMeta,
    formatDateString,
    getDateStringForFile,
    searchForTextInImage,
} from '@common/fileops';
import { slugify } from '@shared/common.utils';

import { FileOptions, FileWithMeta, ModuleHandler, ModuleOptions } from '@util/types';
import { ProcessingModule } from '@shared/common.types';
import output from '@util/output';
import { ExtraData, RenameTemplates } from '@shared/common.constants';

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
                    let topFileName = 'Unknown file';
                    try {
                        const { filePath } = fileWithMeta;

                        const { fileName } = splitFileNameFromPath(filePath);
                        topFileName = fileName;

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
                    } catch (e: any) {
                        console.log('Error with handler:', e);
                        addEventLogForReport({ context }, topFileName, 'errored', e.message);

                        errored++;

                        if (!clientOptions?.ignoreErrors) throw e;
                    }
                });

                await moduleHandler.onDone?.({ clientOptions, context }, dataStore, fileOptions);
            },
            (time) => {
                timeTaken = time;
            },
        );

    if (!handler && moduleHandler.onDone)
        await moduleHandler.onDone({ clientOptions, context }, dataStore, fileOptions);

    output.log(`Module ran in ${timeTaken}ms, ${fileOptions.filesWithMeta.length} files`);

    return {
        timeTaken,
        errored,
        filtered,
        processed,
    };
};

export const addEventLogForReport = (
    opts: Partial<ModuleOptions<{}>>,
    fileName: string,
    operation: string,
    target = '-',
) => {
    if (!opts?.context?.eventLog) return;

    const timestamp = new Date().toISOString();

    const fullLog = `${timestamp},${fileName},${operation},${target}`;

    opts.context.eventLog.push(fullLog);
};

export const fileListToFileOptions = (fileList: string[]): FileOptions => ({
    filesWithMeta: fileList.map<FileWithMeta>((filePath) => ({ filePath })),
});

export type DataDict = Partial<Record<RenameTemplates | ExtraData, string>>;

type PopulateDataDictArgs = {
    dataDict: DataDict;
    tag: string;
    filePath: string;
    mask?: string;
    /** Populate with non formatted, standard version */
    raw?: boolean;
    /** Arbitrary string option to use with some certain data fetches */
    option?: string;
};

// todo: refactor to opts obj
export const populateDataDict = async ({
    dataDict,
    tag,
    filePath,
    mask = 'yy-mm-dd-HH-MM',
    raw,
    option,
}: PopulateDataDictArgs) => {
    const castTag = tag as RenameTemplates | ExtraData;
    const { fileName: rawFileName } = splitFileNameFromPath(filePath);
    const ext = path.extname(rawFileName);
    const fileName = rawFileName.replace(ext, '');

    switch (castTag) {
        /** Do all at once so if both are used we only stat once */
        case RenameTemplates.DateCreated:
        case RenameTemplates.DateModified:
        case ExtraData.FileSize:
            /** Already ran stat - skip */
            if (dataDict[castTag]) return;

            const stat = await fs.stat(filePath);

            const created = stat.ctime ?? stat.mtime;
            const modified = stat.mtime ?? stat.ctime;

            dataDict[RenameTemplates.DateCreated] = raw ? created.toISOString() : formatDateString(created, mask);
            dataDict[RenameTemplates.DateModified] = raw ? modified.toISOString() : formatDateString(modified, mask);
            dataDict[ExtraData.FileSize] = String(stat.size);
            return;
        case RenameTemplates.ExifTaken:
            const isImg = checkSupportedExt(filePath, ['img'], true);
            const { dateStr } = await getDateStringForFile(filePath, isImg, mask);
            dataDict[RenameTemplates.ExifTaken] = dateStr;

            return;
        case RenameTemplates.OriginalName:
            dataDict[castTag] = fileName;
            return;
        case RenameTemplates.ParentFolder:
            const dirPath = path.dirname(filePath);
            const folderName = path.basename(dirPath);
            dataDict[RenameTemplates.ParentFolder] = folderName;
            return;
        case RenameTemplates.SlugifiedName:
            dataDict[RenameTemplates.SlugifiedName] = slugify(fileName);
            return;
        case RenameTemplates.MetaAlbum:
        case RenameTemplates.MetaArtist:
        case RenameTemplates.MetaTitle:
        case RenameTemplates.MetaTrackNo:
            if (dataDict[castTag]) return;

            const probeData = await ffMeta.readTags(filePath);
            const tags = probeData?.format.tags;

            dataDict[RenameTemplates.MetaAlbum] = String(tags?.album) ?? 'UnknownAlbum';
            dataDict[RenameTemplates.MetaTrackNo] = String(tags?.track) ?? '0';
            dataDict[RenameTemplates.MetaTitle] = String(tags?.title) ?? 'UnknownTitle';
            dataDict[RenameTemplates.MetaArtist] = String(tags?.artist) ?? 'UnknownArtist';
            return;
        case ExtraData.Extension:
            dataDict[ExtraData.Extension] = path.extname(fileName);
            return;
        case ExtraData.ocr:
            if (!option) return;
            const ocrResult = await searchForTextInImage(filePath, [option]);
            dataDict[ExtraData.ocr] = String(ocrResult);
            return;
        default:
            return;
    }
};
