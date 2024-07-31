import fs from 'fs/promises';
import path from 'path';

import { formatDateString, getFileSize, splitFileNameFromPath } from '@common/fileops';
import { ProcessingModule } from '@shared/common.types';
import { ModuleHandler } from '@util/types';

type FilesScanned = {
    scanned?: string[];
};

const iterateHandler: ModuleHandler<ProcessingModule['options'], FilesScanned> = {
    handler: async (filePath, _, dataStore) => {
        const { fileName } = splitFileNameFromPath(filePath);

        if (!dataStore.scanned) dataStore.scanned = [];

        if (!fileName) return;

        const fileSize = await getFileSize(filePath);
        dataStore.scanned.push(`${fileName} (${fileSize})`);
    },
    filter: () => true,
    onDone: async (opts, dataStore) => {
        const outputName = String(opts.clientOptions?.value ?? 'ScannedOutput_%date%').replace(
            '%date%',
            formatDateString(new Date()) ?? String(Date.now()),
        );
        const filePath = path.join(__dirname, outputName);

        if (!dataStore.scanned || dataStore.scanned.length === 0) return;

        const content = dataStore.scanned.join('\n');
        await fs.writeFile(filePath + '.log', content);
    },
};

export default iterateHandler;
