import * as path from 'path';
import { rename as fsRename } from 'fs/promises';
import * as colors from 'colors/safe';

import { getDateStringForFile, getExt, checkSupportedExt } from '@common/fileops';

import { FileOpFlags } from '../util/types';
import output from '../util/output';
import { withFileListHandling } from './operations.helpers';

type ProcessedFile = {
    fileName: string;
    exifUsed: boolean;
    newFileName: string;
};

const dateImg = async (options: FileOpFlags) => {
    await withFileListHandling<ProcessedFile, {}>({
        options,
        prepReducer: async (fileName, { rootDir }, { add }) => {
            const ext = getExt(fileName);

            const validImg = checkSupportedExt(ext, ['img']);
            const validOther = validImg || checkSupportedExt(ext, ['mov']);

            output.log(`Scanning "${fileName}", valid img/other: ${validImg}/${validOther}`);

            /** Not supported type that we want to process */
            if (!validImg && !validOther) return;

            const fullPath = `${rootDir}/${fileName}`;

            const { dateStr, exifUsed } = await getDateStringForFile(fullPath, validImg);

            if (!dateStr) output.log(`Found no date info for ${fileName}... skipping`);

            /** Can't determine a string format, punt */
            if (!dateStr) return;

            add({
                fileName,
                exifUsed,
                newFileName: `${dateStr}${fileName}`,
            });
        },
        outputFormatter,
        commitItem: async ({ fileName, newFileName }, { rootDir }, { onProgress }) => {
            const oldPath = path.join(rootDir, fileName);
            const newPath = path.join(rootDir, newFileName);

            output.log(`Attempting rename ${colors.red(fileName)} => ${colors.cyan(newFileName)}`);

            onProgress('rename', 0);

            await fsRename(oldPath, newPath);

            onProgress('rename', 100);
        },
    });
};

const outputFormatter = (v: ProcessedFile) => ({
    from: v.fileName,
    to: v.newFileName,
    'Exif used': v.exifUsed ? '✅' : '❌',
});

export default dateImg;
