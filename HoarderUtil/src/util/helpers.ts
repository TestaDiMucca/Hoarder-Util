import * as fs from 'fs/promises';
import * as path from 'path';

import PromptSync = require('prompt-sync');
import output from './output';
import * as prompt from 'prompt-sync';
import { exifToJsDate } from './dateUtils';
import { DATETAG_SUPPORTED_EXTENSIONS, PATH_ALIAS_STORE } from './constants';
import ConfigStore from '../util/confLoader';

const ExifImage = require('exif').ExifImage;

const defaultAc = (_input: string) => ['y', 'n'];

export const getUserInput = <T extends string = string>(
  message = 'Enter your input',
  opts?: {
    /** Options for auto complete in the terminal */
    autocomplete?: PromptSync.Option['autocomplete'];
    validate?: ((input: string) => boolean) | T[];
    default?: T;
  }
): T => {
  const prompter = prompt();
  output.out(`${message}:`);

  const rawResult = prompter({ autocomplete: opts?.autocomplete ?? defaultAc });

  if (!rawResult && opts?.default) return opts.default;

  if (!rawResult) return getUserInput(message, opts);

  const result = rawResult.toLowerCase() as T;

  if (opts.validate) {
    if (Array.isArray(opts.validate)) {
      if (
        !opts.validate.some((o: string) =>
          o.toLowerCase().includes(result.toLowerCase())
        )
      )
        return getUserInput(message, opts);
    } else {
      const valid = opts.validate(result);

      if (!valid) return getUserInput(message, opts);
    }
  }

  return result as T;
};

/**
 * Get 'y' or 'n' from the user
 */
export const getUserConfirmation = (
  message: string,
  /** Just say yes */
  autoCommit = false
): 'y' | 'n' =>
  autoCommit
    ? 'y'
    : getUserInput<'y' | 'n'>(message + ' (y/n)', {
        autocomplete: () => ['y', 'n'],
        default: 'n',
      });

const exitApp = (code = 0) => {
  output.dump();
  process.exit(code);
};

export const errorAndQuit = (message: string) => {
  output.error(message);

  exitApp(1);
};

export const messageAndQuit = (message: string) => {
  output.out(message);

  exitApp();
};

export const getExif = (image: string): Promise<Date | null> =>
  new Promise((resolve) => {
    new ExifImage({ image }, (err, exif) => {
      if (err) resolve(null);

      const originalDate = exif?.exif?.DateTimeOriginal;
      const converted = originalDate ? exifToJsDate(originalDate) : null;

      resolve(originalDate ? new Date(converted) : null);
    });
  });

export const chunkArray = <T>(arr: T[], chunkSize: number) => {
  const result: Array<T>[] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
};

export const validDirectoryPath = async (dir: string) => {
  try {
    const stats = await fs.stat(dir);

    return stats.isDirectory();
  } catch (e) {
    return false;
  }
};

export const getFileList = (dir: string) => fs.readdir(dir);

export const getFileListWithExcludes = async (
  dir: string,
  excludes?: string
) => {
  let excludeList: string[] | null;

  try {
    excludeList = excludes ? excludes.split(',').map((s) => s.trim()) : null;
  } catch (e: any) {
    errorAndQuit(`Invalid excludes provided. ${e.message}`);
  }

  const fullList = await getFileList(dir);

  if (!excludeList) return fullList;

  const filteredList = fullList.filter(
    (fileName) =>
      !excludeList.some((ex) =>
        fileName.toLowerCase().includes(ex.toLowerCase())
      )
  );

  output.log(
    `Excludes filter removed ${(fullList.length = filteredList.length)} files.`
  );

  return filteredList;
};

export const getExt = (fileName: string) =>
  path.extname(fileName).replace(/\./g, '').toLowerCase();

export const getDateCreated = async (filePath: string) => {
  const stat = await fs.stat(filePath);

  return stat.ctime;
};

export const randomFromArray = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

/**
 * Do a message and something else
 */
export const msgShortcuts = {
  errorAndQuit,
  messageAndQuit,
};

const getAliasName = (pathStr: string) => {
  const m = pathStr.match(/%(.*?)%/g);

  if (m?.length) return m[0].replace(/%/g, '');

  return null;
};

/**
 * Return absolute path if valid
 */
export const validatePath = async (inputPath = '.', quit = true) => {
  const alias = getAliasName(inputPath);
  const usePath = alias
    ? (ConfigStore.get(`${PATH_ALIAS_STORE}.${alias}`) as string)
    : inputPath;
  const absPath = path.resolve(usePath);

  const validPath = validDirectoryPath(absPath);

  output.log(`Scanning for path "${absPath}" ; valid ${!!validPath}`);

  if (validPath) return absPath;

  if (quit) msgShortcuts.errorAndQuit(`Not a valid path: ${absPath}`);
  return null;
};

export const patternToTags = (pattern: string): string[] | null =>
  pattern.match(/%(.*?)%/g)?.map((s) => s.replace(/%/g, ''));

/**
 * Does weird reg-ex-y matching stuff
 * Returns null if it fails
 */
export const parseStringToTags = (
  pattern: string,
  input: string
): null | Record<string, string> => {
  const tagNames = patternToTags(pattern);

  if (!tagNames) return null;

  const inputMatcherRegExp = new RegExp(
    pattern.replace(/%(.*?)%/g, '(.*?)') + '$'
  );
  const extractedMatches = input.match(inputMatcherRegExp)?.slice(1);

  if (!extractedMatches) output.log(`Skipping "${input}" - no tags found`);
  if (!extractedMatches) return null;

  return tagNames.reduce<Record<string, string>>((tags, tagName, i) => {
    tags[tagName] = extractedMatches[i];
    return tags;
  }, {});
};

export const removeExt = (s: string) => s.replace(/\.[^/.]+$/, '');

export const checkSupportedExt = (
  ext: string,
  categories: Array<keyof typeof DATETAG_SUPPORTED_EXTENSIONS>
) => categories.some((cat) => DATETAG_SUPPORTED_EXTENSIONS[cat].includes(ext));

export const withTimer = async <T>(
  cb: () => Promise<T>,
  onDone: (time: number) => void
) => {
  const start = Date.now();

  const result = await cb();

  const time = Date.now() - start;

  onDone(time);

  return result;
};

export const checkPathExists = async (path: string) => {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
};

export const replaceFile = async (oldPath: string, newPath: string) => {
  output.log(`Replacing ${newPath} => ${oldPath}`);
  await fs.unlink(oldPath);
  await fs.rename(newPath, oldPath);
};
