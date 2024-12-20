import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport, evaluateRulesForFile } from '../handler.helpers';
import { ExtraData } from '@shared/common.constants';
import { addStat } from '@util/ipc';

const ruleFilterHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const rules = opts.clientOptions?.rules;

        if (!rules) return;

        const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);

        const excluded = await evaluateRulesForFile(fileWithMeta.filePath, rules, {
            onDataDict: (dataDict, ocrOptions) => {
                if (dataDict[ExtraData.ocr])
                    if (ocrOptions?.length && opts.context?.pipelineId) {
                        addStat({
                            pipelineUuid: opts.context.pipelineId,
                            stats: [
                                {
                                    stat: 'words_parsed',
                                    amount: ocrOptions.length,
                                },
                            ],
                        });
                    }
            },
        });

        const inverse = opts.clientOptions?.inverse;
        if ((excluded && !inverse) || (!excluded && inverse)) {
            fileWithMeta.remove = true;

            addEventLogForReport(opts, fileName, 'filtered');
        }
    },
};

export default ruleFilterHandler;
