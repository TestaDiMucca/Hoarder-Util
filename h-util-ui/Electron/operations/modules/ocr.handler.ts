import { checkSupportedExt, searchForTextInImage, splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';
import { addStat } from '@util/ipc';

const ocrHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const stringMatch = opts.clientOptions?.value;

        if (!stringMatch) return;

        /* Support CSV */
        const matches = String(stringMatch)
            .split(',')
            .map((s) => s.trim());

        const hasMatches = await searchForTextInImage(fileWithMeta.filePath, matches);

        if (opts.context?.pipelineId) {
            addStat({
                pipelineUuid: opts.context.pipelineId,
                stats: [
                    {
                        stat: 'words_parsed',
                        amount: matches.length,
                    },
                ],
            });
        }

        const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);

        const inverse = opts.clientOptions?.inverse;
        if ((!hasMatches && !inverse) || (hasMatches && inverse)) {
            fileWithMeta.remove = true;
            addEventLogForReport(opts, fileName, 'ocr filtered');
        }
    },
    filter: (fileName) => checkSupportedExt(fileName, ['img'], true),
};

export default ocrHandler;
