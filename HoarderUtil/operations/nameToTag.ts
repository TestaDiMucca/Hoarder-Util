import * as ffMeta from 'ffmetadata';
import * as colors from 'colors/safe';

import {
  getExt,
  getFileListWithExcludes,
  getUserConfirmation,
  msgShortcuts,
  parseStringToTags,
  removeExt,
  validatePath,
} from '../util/helpers';
import { TerminalArgs } from '../util/types';
import promises from '../util/promises';
import output from '../util/output';
import {
  DATETAG_SUPPORTED_EXTENSIONS,
  DEFAULT_TAGGING_PATTERN,
} from '../util/constants';
import { writeTags } from '../util/ffMeta';

const nameToTag = async (options: TerminalArgs) => {
  const absPath = await validatePath(options.path);

  const fileList = await getFileListWithExcludes(absPath, options.excludes);

  const pattern = options.format ?? DEFAULT_TAGGING_PATTERN;

  output.out(
    `Only files matching the pattern "${colors.magenta(
      pattern
    )}" will be processed.`
  );

  const processed = await getTags(absPath, fileList, pattern, options.commit);

  if (processed.length === 0)
    msgShortcuts.messageAndQuit('No files matched, ciao');

  const input = getUserConfirmation('Commit changes?', options.commit);

  if (input === 'n') return;

  const applied = await applyTags(absPath, processed);

  output.out(`Successfully tagged ${applied.length} items.`);
};

type ProcessedFile = {
  fileName: string;
  tags: Record<string, string>;
};

const getTags = async (
  _rootDir: string,
  fileNames: string[],
  pattern: string,
  commit = false
) => {
  const proposed = await promises.reduce<string, Array<ProcessedFile>>(
    fileNames,
    async (list, fileName) => {
      const ext = getExt(fileName).toLowerCase();

      const validMedia = DATETAG_SUPPORTED_EXTENSIONS.mov.includes(ext);

      output.log(`Scanning ${fileName}, valid media: ${validMedia}`);

      /** Not supported type that we want to process */
      if (!validMedia) return list;

      const parsedTags = parseStringToTags(pattern, removeExt(fileName));

      if (!parsedTags) return list;

      list.push({
        fileName,
        tags: parsedTags,
      });

      return list;
    },
    []
  );

  if (commit) return proposed;

  output.out(
    `Finished scanning, found ${colors.green(
      String(proposed.length)
    )} with parsable data.`
  );

  if (proposed.length === 0) return proposed;

  output.out('Confirm below:');

  output.utils.table(
    proposed.map((v) => ({
      'File name': v.fileName,
      ...(v.tags ?? {}),
    }))
  );

  return proposed;
};

const applyTags = (rootDir: string, list: ProcessedFile[]) =>
  promises.map(
    list,
    async ({ fileName, tags }) => {
      const fullPath = `${rootDir}/${fileName}`;

      await writeTags(fullPath, tags);

      return fileName;
    },
    {
      concurrency: 3,
    }
  );

export default nameToTag;
