import * as colors from 'colors/safe';
import { getExt, checkSupportedExt } from '@common/fileops';

import { parseStringToTags, withUTimes } from '../util/helpers';
import { FileOpFlags } from '../util/types';
import output from '../util/output';
import { DEFAULT_TAGGING_PATTERN } from '../util/constants';
import { writeTags } from '../util/ffMeta';
import { withFileListHandling } from './operations.helpers';
import { getTempName, removeExt, replaceFile } from '../util/files';

type NameToTagCtx = {
    pattern: string;
};

type ProcessedFile = {
    fileName: string;
    existingTags: Record<string, string | number>;
    tags: Record<string, string | number>;
};

const nameToTag = async (options: FileOpFlags) => {
    const pattern = options.format ?? DEFAULT_TAGGING_PATTERN;

    await withFileListHandling<ProcessedFile, NameToTagCtx>({
        options,
        context: { pattern },
        prepReducer: async (fileName, _, { add }) => {
            const ext = getExt(fileName);

            const validMedia = checkSupportedExt(ext, ['mov']);

            output.log(`Scanning "${fileName}", valid media: ${validMedia}`);

            /** Not supported type that we want to process */
            if (!validMedia) return;

            const parsedTags = parseStringToTags(pattern, removeExt(fileName));

            if (!parsedTags) return;

            const existingTags = {};

            add({
                fileName,
                existingTags,
                tags: parsedTags,
            });
        },
        outputFormatter,
        commitItem: async ({ fileName, existingTags, tags }, { rootDir }, { onProgress }) => {
            const fullPath = `${rootDir}/${fileName}`;
            output.log(`Attempting to tag ${colors.cyan(fileName)}`);

            await withUTimes(async () => {
                await writeTags(fullPath, { ...existingTags, ...tags }, (p) => onProgress('tagging', p));
                await replaceFile(fullPath, getTempName(fullPath));
            }, fullPath);

            output.log(`Completed ${colors.cyan(fileName)}`);
        },
        commitConcurrency: 1,
    });
};

const outputFormatter = (v: ProcessedFile) => ({
    'File name': v.fileName,
    ...(v.tags ?? {}),
});

export default nameToTag;
