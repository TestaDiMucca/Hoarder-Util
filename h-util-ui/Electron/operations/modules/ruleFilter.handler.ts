import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';
import { evaluateRule } from '@shared/rules.utils';

const ruleFilterHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const rules = opts.clientOptions?.rules;

        if (!rules) return;

        const { fileName, rootPath } = splitFileNameFromPath(fileWithMeta.filePath);

        console.log('testing against', rules);
        // TODO get more data
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
