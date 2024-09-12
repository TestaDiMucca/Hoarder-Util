import fs from 'fs/promises';
import path from 'path';

import { promises } from '@common/common';
import {
    checkSupportedExt,
    ffMeta,
    formatDateString,
    getDateStringForFile,
    splitFileNameFromPath,
} from '@common/fileops';
import { defaultTimeMask, RenameTemplates } from '@shared/common.constants';
import { ConfigError } from '@util/errors';
import { ModuleHandler, ModuleOptions } from '@util/types';
import { addEventLogForReport, DataDict, populateDataDict } from '../handler.helpers';

type RequiredDataContext = {
    requiredData?: Set<DataNeeded>;
    /** Tags used */
    tags?: string[];
    testMode?: boolean;
};

const dynamicRenameHandler: ModuleHandler<RequiredDataContext> = {
    handler: async (fileWithMeta, opts) => {
        const { filePath } = fileWithMeta;
        const stringTemplate = opts.clientOptions?.value;
        const timeMask = opts.clientOptions?.dateMask ?? defaultTimeMask;

        if (!stringTemplate) throw new ConfigError('No string template provided');

        if (!opts.context?.requiredData) populateContext(String(stringTemplate), opts);

        const dataDict: DataDict = {};

        // Gather data into map
        const tags = (opts.context?.tags ?? []) as RenameTemplates[];
        await promises.each(tags, async (tag) => populateDataDict(dataDict, tag, filePath, timeMask));

        // Replace using data from the map
        const { fileName } = splitFileNameFromPath(filePath);

        const ext = path.extname(fileName);

        let newName = String(stringTemplate);
        tags.forEach((tag) => {
            newName = newName.replaceAll(`%${tag}%`, dataDict[tag] ?? 'unknown');
        });

        const newNameWithExt = `${newName}${ext}`;
        const newPath = filePath.replace(fileName, newNameWithExt);

        if (!opts.context?.testMode) await fs.rename(filePath, newPath);
        else fileWithMeta.newFilePath = newPath;

        addEventLogForReport(opts, fileName, 'renamed', newNameWithExt);
    },
};

export default dynamicRenameHandler;

/**
 * Extract all info if first run
 * This informs what data we need to extract from file based on tags
 */
const populateContext = (stringTemplate: string, opts: Partial<ModuleOptions<RequiredDataContext>>) => {
    if (!opts.context) opts.context = {};

    const { dataNeeded, tags } = getDataNeeded(String(stringTemplate));
    opts.context.requiredData = dataNeeded;
    opts.context.tags = tags;
};

/**
 * Represents what data fetchers we need to get info for naming
 */
enum DataNeeded {
    exif,
    meta,
}

const getDataNeeded = (stringTemplate: string): { dataNeeded: Set<DataNeeded>; tags: string[] } => {
    const tags = extractTemplatesUsed(stringTemplate);

    const dataNeeded: Set<DataNeeded> = new Set();

    tags.forEach((tag) => {
        if (tag.includes('exif')) dataNeeded.add(DataNeeded.exif);
        if (tag.includes('meta')) dataNeeded.add(DataNeeded.meta);
    });

    return { dataNeeded, tags };
};

const validTags = Object.values(RenameTemplates).reduce<Set<RenameTemplates>>((a, t) => {
    a.add(t);
    return a;
}, new Set());

const extractTemplatesUsed = (input: string): string[] => {
    // Regex pattern to find text enclosed between %
    const regex = /%([^%]+)%/g;

    // Collect matches
    const matches: string[] = [];
    let match;

    // Use exec to iterate over all matches
    while ((match = regex.exec(input)) !== null) {
        // The first capturing group is at index 1
        if (match[1]) {
            matches.push(match[1]);
        }
    }

    return matches.filter((t) => validTags.has(t as RenameTemplates));
};
