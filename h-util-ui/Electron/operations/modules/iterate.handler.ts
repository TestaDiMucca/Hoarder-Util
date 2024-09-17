import fs from 'fs/promises';
import path from 'path';

import { formatDateString, getFileSize, splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { sleep } from '@common/common';
import { addEventLogForReport } from '../handler.helpers';
import { ProcessingError } from '@util/errors';

type FilesScanned = {
    scanned?: string[];
    rootPath?: string;
};

const iterateHandler: ModuleHandler<{}, FilesScanned> = {
    handler: async ({ filePath }, _, dataStore) => {
        const { fileName, rootPath } = splitFileNameFromPath(filePath);

        if (!dataStore.scanned) dataStore.scanned = [];
        if (!dataStore.rootPath) dataStore.rootPath = rootPath;

        if (!fileName) return;

        const fileSize = await getFileSize(filePath);
        dataStore.scanned.push(`${fileName} (${fileSize})`);

        await sleep(500);
    },
    filter: () => true,
    onDone: async (opts, dataStore) => {
        const rootPath = dataStore.rootPath;

        if (!rootPath) return;

        const outputName = String(opts.clientOptions?.value || 'ScannedOutput_%date%').replace(
            '%date%',
            formatDateString(new Date()) ?? String(Date.now()),
        );

        if (!outputName) throw new ProcessingError('No output name provided');

        const filePath = path.join(rootPath, outputName);

        if (!dataStore.scanned || dataStore.scanned.length === 0) return;

        const content = dataStore.scanned.join('\n');
        await fs.writeFile(filePath + '.log', content);

        addEventLogForReport(opts, outputName, 'written');
    },
};

export default iterateHandler;
