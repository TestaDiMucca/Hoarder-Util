import * as path from 'path';
import { rename as fsRename } from 'fs/promises';
import * as colors from 'colors/safe';

import { TerminalArgs } from '../util/types';
import {
  getDateCreated,
  getExif,
  getExt,
  getFileListWithExcludes,
  getUserConfirmation,
  msgShortcuts,
  validatePath,
} from '../util/helpers';
import promises from '../util/promises';
import { formatDateString } from '../util/dateUtils';
import output from '../util/output';
import { DATETAG_SUPPORTED_EXTENSIONS } from '../util/constants';

const dateImg = async (options: TerminalArgs) => {
  const absPath = await validatePath(options.path);

  const fileList = await getFileListWithExcludes(absPath, options.excludes);
  const processed = await getNames(absPath, fileList, !options.commit);

  if (processed.length === 0)
    msgShortcuts.messageAndQuit('No files matched the criteria. Arrivederci.');

  const input = getUserConfirmation('Commit changes?', options.commit);

  if (input === 'n') return;

  const moved = await applyRenames(absPath, processed);

  output.out(`Successfully renamed ${moved.length} items.`);
};

type ProcessedFile = {
  fileName: string;
  exifUsed: boolean;
  newFileName: string;
};

const getNames = async (
  rootDir: string,
  fileNames: string[],
  /** Do we want to print out the proposed changes? */
  log?: boolean
) => {
  const proposed = await promises.reduce<string, Array<ProcessedFile>>(
    fileNames,
    async (list, fileName) => {
      const ext = getExt(fileName).toLowerCase();

      const validImg = DATETAG_SUPPORTED_EXTENSIONS.img.includes(ext);
      const validOther =
        validImg || DATETAG_SUPPORTED_EXTENSIONS.mov.includes(ext);

      output.log(
        `Scanning ${fileName}, valid img/other: ${validImg}/${validOther}`
      );

      /** Not supported type that we want to process */
      if (!validImg && !validOther) return list;

      const fullPath = `${rootDir}/${fileName}`;

      const { dateStr, exifUsed } = await getDateStringForFile(
        fullPath,
        validImg
      );

      if (!dateStr)
        output.log(`Found no date info for ${fileName}... skipping`);

      /** Can't determine a string format, punt */
      if (!dateStr) return list;

      list.push({
        fileName,
        exifUsed,
        newFileName: `${dateStr}${fileName}`,
      });

      return list;
    },
    []
  );

  if (!log) return proposed;

  output.out(
    `Finished scanning, found ${colors.green(
      String(proposed.length)
    )} with parsable data.`
  );

  if (proposed.length === 0) return proposed;

  output.out('Confirm below:');
  output.utils.table(
    proposed.map((v) => ({
      from: v.fileName,
      to: v.newFileName,
      'Exif used': v.exifUsed ? '✅' : '❌',
    }))
  );

  return proposed;
};

const applyRenames = async (rootDir: string, list: ProcessedFile[]) =>
  promises.map(
    list,
    async ({ fileName, newFileName }) => {
      const oldPath = path.join(rootDir, fileName);
      const newPath = path.join(rootDir, newFileName);

      output.log(
        `Attempting rename ${colors.red(fileName)} => ${colors.green(
          newFileName
        )}`
      );

      await fsRename(oldPath, newPath);

      return newPath;
    },
    {
      concurrency: 5,
    }
  );

const getDateStringForFile = async (
  fullPath: string,
  useExif = false
): Promise<{ dateStr?: string; exifUsed?: boolean }> => {
  const exifDate = useExif ? await getExif(fullPath) : null;
  const metaDate = await getDateCreated(fullPath);

  /** No dates read at all, won't modify */
  if (!exifDate && !metaDate) return {};

  const dateStr = formatDateString(exifDate ?? metaDate);

  return {
    dateStr,
    exifUsed: !!exifDate,
  };
};

export default dateImg;
