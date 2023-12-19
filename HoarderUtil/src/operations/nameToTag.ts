import * as colors from 'colors/safe';

import {
  checkSupportedExt,
  getExt,
  parseStringToTags,
  removeExt,
} from '../util/helpers';
import { FileOpFlags } from '../util/types';
import output from '../util/output';
import { DEFAULT_TAGGING_PATTERN } from '../util/constants';
import { writeTags } from '../util/ffMeta';
import { withFileListHandling } from './operations.helpers';

type NameToTagCtx = {
  pattern: string;
};

type ProcessedFile = {
  fileName: string;
  tags: Record<string, string>;
};

const nameToTag = async (options: FileOpFlags) => {
  const pattern = options.format ?? DEFAULT_TAGGING_PATTERN;

  await withFileListHandling<ProcessedFile, NameToTagCtx>({
    options,
    context: { pattern },
    prepReducer: async (fileName, _, { add }) => {
      const ext = getExt(fileName);

      const validMedia = checkSupportedExt(ext, ['mov']);

      output.log(`Scanning "${fileName}", valid media: ${validMedia}`);

      /** Not supported type that we want to process */
      if (!validMedia) return;

      const parsedTags = parseStringToTags(pattern, removeExt(fileName));

      if (!parsedTags) return;

      add({
        fileName,
        tags: parsedTags,
      });
    },
    outputFormatter,
    commitItem: async ({ fileName, tags }, { rootDir }) => {
      const fullPath = `${rootDir}/${fileName}`;
      output.log(`Attempting to tag ${colors.cyan(fileName)}`);

      await writeTags(fullPath, tags);
    },
  });
};

const outputFormatter = (v: ProcessedFile) => ({
  'File name': v.fileName,
  ...(v.tags ?? {}),
});

export default nameToTag;
