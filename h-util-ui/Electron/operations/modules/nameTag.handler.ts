import {
    checkSupportedExt,
    ffMeta,
    getTempName,
    parseStringToTags,
    removeExt,
    replaceFile,
    splitFileNameFromPath,
    withUTimes,
} from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';

const nameTagHandler: ModuleHandler = {
    handler: async ({ filePath }, opts) => {
        const pattern = '%artist% - %title%';

        const { fileName } = splitFileNameFromPath(filePath);

        if (!fileName) return;

        const parsedTags = parseStringToTags(pattern, removeExt(fileName));

        await withUTimes(async () => {
            await ffMeta.writeTags(filePath, { ...parsedTags });
            await replaceFile(filePath, getTempName(filePath));
        }, filePath);

        addEventLogForReport(opts, fileName, 'tagged', JSON.stringify(parsedTags));
    },
    filter: (filePath) => checkSupportedExt(filePath, ['mov'], true),
};

export default nameTagHandler;
