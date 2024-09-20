import { BranchingModule } from '@shared/common.types';
import { DataDict, evaluateRulesForFile } from '../handler.helpers';

/**
 * Not an action module so doesn't follow pattern for other handlers
 * Maybe that is not great
 *
 * @returns next targeted module id if any
 */
const branchingHandler = async (branchingModule: BranchingModule, filePath: string): Promise<string | null> => {
    const branches = branchingModule.branches;

    if (branches.length === 0) return null;

    let dataDict: DataDict | undefined = undefined;

    try {
        for (let i = 0; i < branches.length; i++) {
            const rules = branches[i].rules;

            const matches = await evaluateRulesForFile(filePath, rules, {
                dataDict,
                onDataDict: (populatedDataDict) => {
                    dataDict = populatedDataDict;
                },
            });

            if (matches) return branches[i].targetModule ?? null;
        }

        return null;
    } catch (e) {
        console.error('branching rule error', e);
        return null;
    }
};

export default branchingHandler;
