import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport, DataDict, populateDataDict } from '../handler.helpers';
import { crawlRules, evaluateRule } from '@shared/rules.utils';
import { Rule } from '@shared/rules.types';
import { ExtraData, RenameTemplates } from '@shared/common.constants';
import { promises } from '@common/common';
import { addPipelineRunStat } from '../../data/stats.db';

const ruleFilterHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const rules = opts.clientOptions?.rules;

        if (!rules) return;

        const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);

        const dataDict: DataDict = {};
        const ocrOptions: string[] = [];

        await promises.each(
            getRuleAttrsUsed(rules, (rule) => {
                if (rule.type === 'basic' && rule.attribute === ExtraData.ocr) {
                    ocrOptions.push(rule.value);
                }
            }),
            async (tag) => {
                await populateDataDict({
                    dataDict,
                    tag,
                    filePath: fileWithMeta.filePath,
                    raw: true,
                    option: ocrOptions,
                });

                if (ocrOptions?.length && opts.context?.pipelineId)
                    void addPipelineRunStat(opts.context.pipelineId, 'words_parsed', ocrOptions.length);
            },
        );

        const excluded = evaluateRule(rules, dataDict);

        const inverse = opts.clientOptions?.inverse;
        if ((excluded && !inverse) || (!excluded && inverse)) {
            fileWithMeta.remove = true;

            addEventLogForReport(opts, fileName, 'filtered');
        }
    },
    onDone: async (_opts, _store, fileOptions) => {
        fileOptions.filesWithMeta = fileOptions.filesWithMeta.filter((f) => !f.remove);
    },
};

export default ruleFilterHandler;

const getRuleAttrsUsed = (
    rules: Rule,
    onRuleEvaluated?: (rule: Rule) => void,
): Array<RenameTemplates | ExtraData | string> => {
    const attrsUsed = new Set<string>();

    crawlRules(rules, (rule) => {
        onRuleEvaluated?.(rule);
        attrsUsed.add(rule.attribute);
    });

    return [...attrsUsed];
};
