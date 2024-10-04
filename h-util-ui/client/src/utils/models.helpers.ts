import { v4 as uuidV4 } from 'uuid';
import { Aqueduct, ProcessingModule, ProcessingModuleType } from '@shared/common.types';
import { getDefaultRule } from '@shared/rules.utils';

/**
 * Filtering type modules can be inverted
 */
export const getModuleCanInvert = (type: ProcessingModuleType) => {
    switch (type) {
        case ProcessingModuleType.filter:
        case ProcessingModuleType.ruleFilter:
        case ProcessingModuleType.ocr:
            return true;
        default:
            return false;
    }
};

export const getDefaultAqueduct = (id = uuidV4()): Aqueduct => ({
    id,
    name: `Novus acquaeductus ${new Date().toISOString()}`,
    pipelineId: '',
    directories: [],
});

/** Get a default starter module */
export const getDefaultModule = (id: string, branching = false): ProcessingModule =>
    branching
        ? {
              id,
              type: ProcessingModuleType.branch,
              branches: [
                  {
                      rules: getDefaultRule(),
                  },
              ],
          }
        : {
              id,
              type: ProcessingModuleType.datePrefix,
              options: {
                  value: '',
                  inverse: false,
                  ignoreErrors: true,
                  skipPreviouslyFailed: false,
              },
          };
