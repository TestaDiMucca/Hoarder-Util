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
import { RenameTemplates } from '@shared/common.constants';
import { ConfigError } from '@util/errors';
import { ModuleHandler, ModuleOptions } from '@util/types';
import { slugify } from '@shared/common.utils';
import { addEventLogForReport } from '../handler.helpers';

type RequiredDataContext = {
    requiredData?: Set<DataNeeded>;
    /** Tags used */
    tags?: string[];
    testMode?: boolean;
};

type DataDict = Partial<Record<RenameTemplates, string>>;

const dynamicRenameHandler: ModuleHandler<RequiredDataContext> = {
    handler: async (fileWithMeta, opts) => {
        const { filePath } = fileWithMeta;
        const stringTemplate = opts.clientOptions?.value;

        if (!stringTemplate) throw new ConfigError('No string template provided');

        if (!opts.context?.requiredData) populateContext(String(stringTemplate), opts);

        const dataDict: DataDict = {};

        // Gather data into map
        const tags = (opts.context?.tags ?? []) as RenameTemplates[];
        await promises.each(tags, async (tag) => populateDataDict(dataDict, tag, filePath));

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

const populateDataDict = async (dataDict: DataDict, tag: string, filePath: string, mask = 'yy-mm-dd-HH-MM') => {
    const castTag = tag as RenameTemplates;
    const { fileName: rawFileName } = splitFileNameFromPath(filePath);
    const ext = path.extname(rawFileName);
    const fileName = rawFileName.replace(ext, '');

    switch (castTag) {
        /** Do both at once so if both are used we only stat once */
        case RenameTemplates.DateCreated:
        case RenameTemplates.DateModified:
            /** Already ran stat - skip */
            if (dataDict[castTag]) return;

            const stat = await fs.stat(filePath);
            dataDict[RenameTemplates.DateCreated] = formatDateString(stat.ctime ?? stat.mtime, mask);
            dataDict[RenameTemplates.DateModified] = formatDateString(stat.mtime ?? stat.ctime, mask);

            return;
        case RenameTemplates.ExifTaken:
            const isImg = checkSupportedExt(filePath, ['img'], true);
            const { dateStr } = await getDateStringForFile(filePath, isImg, mask);
            dataDict[RenameTemplates.ExifTaken] = dateStr;

            return;
        case RenameTemplates.OriginalName:
            dataDict[castTag] = fileName;
            return;
        case RenameTemplates.ParentFolder:
            const dirPath = path.dirname(filePath);
            const folderName = path.basename(dirPath);
            dataDict[RenameTemplates.ParentFolder] = folderName;
            return;
        case RenameTemplates.SlugifiedName:
            dataDict[RenameTemplates.SlugifiedName] = slugify(fileName);
            return;
        case RenameTemplates.MetaAlbum:
        case RenameTemplates.MetaArtist:
        case RenameTemplates.MetaTitle:
        case RenameTemplates.MetaTrackNo:
            if (dataDict[castTag]) return;

            const probeData = await ffMeta.readTags(filePath);
            const tags = probeData?.format.tags;

            dataDict[RenameTemplates.MetaAlbum] = String(tags?.album) ?? 'UnknownAlbum';
            dataDict[RenameTemplates.MetaTrackNo] = String(tags?.track) ?? '0';
            dataDict[RenameTemplates.MetaTitle] = String(tags?.title) ?? 'UnknownTitle';
            dataDict[RenameTemplates.MetaArtist] = String(tags?.artist) ?? 'UnknownArtist';
            return;
        default:
            return;
    }
};

/**
 * Extract all info if first run
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
