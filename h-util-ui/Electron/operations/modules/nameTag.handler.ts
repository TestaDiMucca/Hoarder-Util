import {
    checkSupportedExt,
    ffMeta,
    getExt,
    getTempName,
    parseStringToTags,
    removeExt,
    replaceFile,
    splitFileNameFromPath,
    withUTimes,
} from '@common/fileops';
import { ModuleHandler } from '@util/types';

const nameTagHandler: ModuleHandler = {
    handler: async (filePath, _opts) => {
        const pattern = '%artist% - %title%';

        const { fileName } = splitFileNameFromPath(filePath);

        if (!fileName) return;

        const parsedTags = parseStringToTags(pattern, removeExt(fileName));

        await withUTimes(async () => {
            await ffMeta.writeTags(filePath, { ...parsedTags });
            await replaceFile(filePath, getTempName(filePath));
        }, filePath);
    },
    filter: (filePath) => checkSupportedExt(getExt(filePath), ['mov']),
};

export default nameTagHandler;
