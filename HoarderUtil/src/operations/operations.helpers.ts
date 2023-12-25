import * as colors from 'colors/safe';

import {
  getFileListWithExcludes,
  getUserConfirmation,
  msgShortcuts,
  validatePath,
  withTimer,
} from '../util/helpers';
import output from '../util/output';
import promises from '../util/promises';
import ConfigStore, { addKeyToStore } from '../util/confLoader';
import { FileOpFlags, TerminalArgs } from '../util/types';
import { OP_ALIAS_STORE } from '../util/constants';
import ProgressBar from '../fun/progressBar';

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
  options: FileOpFlags;
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
  /** Look for files */
  const fileList = await getFileListWithExcludes(absPath, options.excludes);

  output.log(`Searching in ${absPath}`);

  const progressBar = new ProgressBar('Scanning files', {
    subStep: fileList.length,
  });

  /** Scan file names and propose changes */
  const proposed = await withTimer(
    () =>
      promises.reduce<string, Array<T>>(
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

            progressBar.updateBar('subStep', i + 1, fileName);
          } catch (e: any) {
            output.queueError(`Error reducing "${fileName}": ${e.message}`);
          } finally {
            return list;
          }
        },
        []
      ),
    (time) => output.log(`Time to scan: ${time} ms`)
  );

  progressBar.stop();

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

  output.out('Writing changes...');

  await withTimer(
    () =>
      promises.map(
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
            output.queueError(
              `Error processing "${item.fileName}": ${e.message}`
            );
          }
        },
        {
          concurrency: commitConcurrency,
        }
      ),
    (time) => output.log(`Time to process: ${time} ms`)
  );

  output.dump();

  return processedCount;
};

export const confAliasLsFactory =
  <T = string>(storeName: string, processor?: (v: T) => string) =>
  () => {
    const stored = ConfigStore.get(storeName);

    if (!stored) return output.out('There are no stored aliases.');

    if (typeof stored !== 'object')
      msgShortcuts.errorAndQuit(
        `Something weird is stored in the store: ${stored}`
      );

    output.utils.table(
      Object.keys(stored).map((k) => ({
        alias: k,
        path: processor ? processor(stored[k]) : stored[k],
      }))
    );
  };

export const confAliasMkFactory =
  <T = string>(
    storeName: string,
    ls: () => void,
    validate: (path: T) => Promise<boolean>
  ) =>
  async (alias: string, path: T) => {
    const valid = await validate(path);

    if (!valid) return;

    addKeyToStore(storeName, alias, path);

    output.out(`Added path under alias "${alias}"`);
    ls();
  };

export const confAliasRmFactory =
  (storeName: string, ls: () => void) => (alias: string) => {
    const key = `${storeName}.${alias}`;
    const exists = ConfigStore.get(key);

    if (!exists) msgShortcuts.errorAndQuit(`Alias ${alias} does not exist.`);

    ConfigStore.delete(key);

    output.out('Store now:');
    ls();
  };

export const withAliasPersist = async (
  cb: () => Promise<void>,
  opts: TerminalArgs
) => {
  await cb();

  if (!opts.saveAlias) return;

  const alias = opts.saveAlias;

  output.out(`Operation "${opts.operation}" ran.`);

  const input = getUserConfirmation(`Save operation alias "${alias}"?`);

  if (input === 'n') return;

  delete opts.saveAlias;

  addKeyToStore(OP_ALIAS_STORE, alias, opts);

  output.out('Saved new operation alias');
};
