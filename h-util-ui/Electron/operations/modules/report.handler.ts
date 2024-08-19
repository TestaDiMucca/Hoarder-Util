import path from 'path';
import fs from 'fs/promises';

import { checkDirectoryExists } from '@common/fileops';
import { formatDate, slugify } from '@shared/common.utils';
import { ProcessingError } from '@util/errors';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';

const reportHandler: ModuleHandler = {
    onDone: async (opts) => {
        const { context, clientOptions } = opts;

        /** No dir set */
        if (!clientOptions?.value) return;

        const outDir = String(clientOptions.value);
        const dirExists = await checkDirectoryExists(outDir);

        if (!dirExists) throw new ProcessingError(`${clientOptions.value} is not a valid directory`);

        /** No log found */
        if (!context?.eventLog || !context?.pipelineName) return;

        const outputName = `${slugify(context.pipelineName)}_${formatDate(new Date())}.csv`;

        const content: string[] = ['timestamp,sourceFile,operation,target', ...context.eventLog];

        const outputPath = path.join(outDir, outputName);

        await fs.writeFile(outputPath, content.join('\n'));

        addEventLogForReport(opts, outputName, 'written');
    },
};

export default reportHandler;
