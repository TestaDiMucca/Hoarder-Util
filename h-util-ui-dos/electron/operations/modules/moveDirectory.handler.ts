import path from 'path';
import fs from 'fs/promises';
import { checkDirectoryExists, splitFileNameFromPath } from '@common/fileops';
import output from '../../utils/output';

import { ModuleHandler } from '../../utils/types';
import { ProcessingModule } from '../../../common/common.types';
import { ProcessingError } from '../../utils/errors';

/** Directories we know we created, or already exist */
type DirectoriesScanned = Record<string, boolean>;

const moveDirectoryHandler: ModuleHandler<ProcessingModule['options'], DirectoriesScanned> = {
    handler: async ({ filePath }, opts, dataStore) => {
        const { rootPath, fileName } = splitFileNameFromPath(filePath);
        const { clientOptions } = opts;

        const targetDirectoryName = clientOptions?.value as string;

        if (!fileName) return output.error(`Cannot move to directory without ${!fileName ? 'file' : 'directory'} name`);

        if (!targetDirectoryName) throw new ProcessingError('Provide directory name');

        const directoryPath = path.join(rootPath, targetDirectoryName);

        if (!dataStore[directoryPath]) {
            const exists = await checkDirectoryExists(directoryPath);

            if (!exists) await fs.mkdir(directoryPath);

            dataStore[directoryPath] = true;
        }

        output.log(`Moving ${fileName} into ${targetDirectoryName}/`);

        await fs.rename(filePath, path.join(directoryPath, fileName));
    },
};

export default moveDirectoryHandler;
