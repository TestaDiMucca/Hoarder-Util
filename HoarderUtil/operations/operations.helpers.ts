import * as colors from 'colors/safe';

import {
  getFileListWithExcludes,
  getUserConfirmation,
  msgShortcuts,
  validatePath,
} from '../util/helpers';
import output from '../util/output';
import promises from '../util/promises';
import { TerminalArgs } from '../util/types';

export type EnhancedContext<C> = C & {
  rootDir: string;
  index: number;
};

type ReducerCommit<T> = {
  add: (v: T) => void;
  curr: () => T[];
};

type BaseFile = {
  fileName: string;
};

type WithFileListHandlingArgs<T extends BaseFile, C extends object> = {
  options: TerminalArgs;
  prepReducer: (
    fileName: string,
    ctx: EnhancedContext<C>,
    ops: ReducerCommit<T>
  ) => Promise<void>;
  context?: C;
  outputFormatter?: (v: T) => Record<string, string>;
  commitItem: (item: T, ctx: EnhancedContext<C>) => Promise<void>;
  commitConcurrency?: number;
};

const genericOutputFormatter = <T>(v: T): Record<string, string> =>
  Object.entries(v).reduce<Record<string, string>>((a, [k, v]) => {
    a[k] = String(v);
    return a;
  }, {});

/**
 * Handles scanning, confirms, logging, etc.
 */
export const withFileListHandling = async <
  T extends BaseFile,
  C extends object = {}
>({
  context = {} as C,
  commitItem,
  commitConcurrency = 3,
  options,
  prepReducer,
  outputFormatter = genericOutputFormatter,
}: WithFileListHandlingArgs<T, C>) => {
  const absPath = await validatePath(options.path);
  const fileList = await getFileListWithExcludes(absPath, options.excludes);

  const proposed = await promises.reduce<string, Array<T>>(
    fileList,
    async (list, fileName, i) => {
      try {
        await prepReducer(
          fileName,
          {
            ...context,
            index: i,
            rootDir: absPath,
          },
          {
            add: (v) => list.push(v),
            curr: () => list,
          }
        );
      } catch (e: any) {
        output.queueError(`Error reducing "${fileName}": ${e.message}`);
      } finally {
        return list;
      }
    },
    []
  );

  /**
   * Confirm for non-YOLOers
   */
  if (!options.commit) {
    output.out(
      `Finished scanning, found ${colors.green(
        String(proposed.length)
      )} with parsable data.`
    );

    if (proposed.length === 0)
      return msgShortcuts.messageAndQuit(
        'No files matched the criteria. Arrivederci.'
      );

    output.out('Confirm below:');
    output.utils.table(proposed.map(outputFormatter));

    const input = getUserConfirmation('Commit changes?', options.commit);

    if (input === 'n')
      return msgShortcuts.messageAndQuit(
        'Canceling on user request. Sayonara.'
      );
  }

  let processedCount = 0;
  await promises.map(
    proposed,
    async (item, i) => {
      try {
        await commitItem(item, {
          ...context,
          index: i,
          rootDir: absPath,
        });
        processedCount++;
      } catch (e: any) {
        output.queueError(`Error processing "${item.fileName}": ${e.message}`);
      }
    },
    {
      concurrency: commitConcurrency,
    }
  );

  return processedCount;
};
