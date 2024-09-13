import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport, DataDict, populateDataDict } from '../handler.helpers';
import { evaluateRule } from '@shared/rules.utils';
import { Rule } from '@shared/rules.types';
import { ExtraData, RenameTemplates } from '@shared/common.constants';
import { promises } from '@common/common';

const ruleFilterHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const rules = opts.clientOptions?.rules;

        if (!rules) return;

        const { fileName, rootPath } = splitFileNameFromPath(fileWithMeta.filePath);

        const dataDict: DataDict = {};

        await promises.each(getRuleAttrsUsed(rules), async (tag) => {
            await populateDataDict({ dataDict, tag, filePath: fileWithMeta.filePath, raw: true });
        });

        const excluded = evaluateRule(rules, {
            name: fileName,
            path: rootPath,
        });

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

const getRuleAttrsUsed = (rules: Rule): Array<RenameTemplates | ExtraData | string> => {
    // todo: need to get value for ocr
    const attrsUsed: string[] = [];

    return attrsUsed;
};
