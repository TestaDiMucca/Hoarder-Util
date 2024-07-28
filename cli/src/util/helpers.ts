import * as fs from 'fs/promises';
import * as path from 'path';

import PromptSync = require('prompt-sync');
import output from './output';
import * as prompt from 'prompt-sync';
import { PATH_ALIAS_STORE } from './constants';
import ConfigStore from './confLoader';
import { getFileList, validDirectoryPath } from './files';

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
            if (!opts.validate.some((o: string) => o.toLowerCase().includes(result.toLowerCase())))
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

export const checkFilenameExcluded = (fileName: string, pattern: string) => {
    try {
        const re = new RegExp(pattern, 'i');

        return fileName.search(re) >= 0;
    } catch (e) {
        return fileName.toLowerCase().includes(pattern.toLowerCase());
    }
};

export const getFileListWithExcludes = async (dir: string, excludes?: string) => {
    let excludeList: string[] | null;

    try {
        /** Double comma required to not break apart regex stuff */
        excludeList = excludes ? excludes.split(',,').map((s) => s.trim()) : null;
    } catch (e: any) {
        errorAndQuit(`Invalid excludes provided. ${e.message}`);
    }

    const fullList = await getFileList(dir);

    if (!excludeList) return fullList;

    output.log(`Excludes matching with: "${excludeList.join(',')}"`);

    const filteredList = fullList.filter((fileName) => !excludeList.some((ex) => checkFilenameExcluded(fileName, ex)));

    output.log(`Excludes filter removed ${fullList.length - filteredList.length} files.`);

    return filteredList;
};

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
 * Return absolute path (presumably from an input) if valid
 */
export const validatePath = async (inputPath = '.', quit = true) => {
    const alias = getAliasName(inputPath);
    const usePath = alias ? (ConfigStore.get(`${PATH_ALIAS_STORE}.${alias}`) as string) : inputPath;
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
export const parseStringToTags = (pattern: string, input: string): null | Record<string, string> => {
    const tagNames = patternToTags(pattern);

    if (!tagNames) return null;

    const inputMatcherRegExp = new RegExp(pattern.replace(/%(.*?)%/g, '(.*?)') + '$');
    const extractedMatches = input.match(inputMatcherRegExp)?.slice(1);

    if (!extractedMatches) output.log(`Skipping "${input}" - no tags found`);
    if (!extractedMatches) return null;

    return tagNames.reduce<Record<string, string>>((tags, tagName, i) => {
        tags[tagName] = extractedMatches[i];
        return tags;
    }, {});
};

/**
 * Get date metadata times for a file and apply them back when performing file op
 * It is assumed the callback will modify or replace the file specified by the path
 */
export const withUTimes = async <T>(cb: () => Promise<T>, filePath: string) => {
    let meta: null | Awaited<ReturnType<typeof fs.stat>> = null;

    try {
        meta = await fs.stat(filePath);
    } catch (e: any) {
        output.error(`[withUTimes] could not get metadata on file to apply: ${e.message}`);
    }

    const res = await cb();

    if (meta) await fs.utimes(filePath, meta.atime, meta.mtime);

    return res;
};
