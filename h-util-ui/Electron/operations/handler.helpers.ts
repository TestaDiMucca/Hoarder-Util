import path from 'path';
import fs from 'fs/promises';

import {
    splitFileNameFromPath,
    checkSupportedExt,
    ffMeta,
    formatDateString,
    getDateStringForFile,
    searchForTextInImage,
} from '@common/fileops';
import { slugify } from '@shared/common.utils';

import { FileOptions, FileWithMeta, ModuleOptions } from '@util/types';
import { ExtraData, RenameTemplates } from '@shared/common.constants';
import { Rule } from '@shared/rules.types';
import { promises } from '@common/common';
import { crawlRules, evaluateRule } from '@shared/rules.utils';

export const addEventLogForReport = (
    opts: Partial<ModuleOptions<{}>>,
    fileName: string,
    operation: string,
    target = '-',
) => {
    if (!opts?.context?.eventLog) return;

    const timestamp = new Date().toISOString();

    const fullLog = `${timestamp},${fileName},${operation},${target}`;

    opts.context.eventLog.push(fullLog);
};

export const fileListToFileOptions = (fileList: string[]): FileOptions => ({
    filesWithMeta: fileList.map<FileWithMeta>((filePath) => ({ filePath })),
});

export type DataDict = Partial<Record<RenameTemplates | ExtraData, string>>;

type PopulateDataDictArgs = {
    dataDict: DataDict;
    tag: string;
    filePath: string;
    mask?: string;
    /** Populate with non formatted, standard version */
    raw?: boolean;
    /** Arbitrary string option to use with some certain data fetches */
    option?: string | string[];
};

export const populateDataDict = async ({
    dataDict,
    tag,
    filePath,
    mask = 'yy-mm-dd-HH-MM',
    raw,
    option,
}: PopulateDataDictArgs) => {
    const castTag = tag as RenameTemplates | ExtraData;
    const { fileName: rawFileName } = splitFileNameFromPath(filePath);
    const ext = path.extname(rawFileName);
    const fileName = rawFileName.replace(ext, '');

    switch (castTag) {
        /** Do all at once so if both are used we only stat once */
        case RenameTemplates.DateCreated:
        case RenameTemplates.DateModified:
        case ExtraData.FileSize:
            /** Already ran stat - skip */
            if (dataDict[castTag]) return;

            const stat = await fs.stat(filePath);

            const created = stat.ctime ?? stat.mtime;
            const modified = stat.mtime ?? stat.ctime;

            dataDict[RenameTemplates.DateCreated] = raw ? created.toISOString() : formatDateString(created, mask);
            dataDict[RenameTemplates.DateModified] = raw ? modified.toISOString() : formatDateString(modified, mask);
            dataDict[ExtraData.FileSize] = String(stat.size);
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
        case ExtraData.Extension:
            dataDict[ExtraData.Extension] = path.extname(fileName);
            return;
        case ExtraData.ocr:
            if (!option) return;
            const ocrResult = await searchForTextInImage(filePath, Array.isArray(option) ? option : [option]);
            dataDict[ExtraData.ocr] = String(ocrResult);
            return;
        default:
            return;
    }
};

type EvaluateRulesOpts = {
    onDataDict?: (dataDict: DataDict, ocrOptions: string[]) => void;
    /** If operation multiple evaluations on one file, this prevents pulling data again */
    dataDict?: DataDict;
};

export const evaluateRulesForFile = async (filePath: string, rules: Rule, opts: EvaluateRulesOpts = {}) => {
    const dataDict: DataDict = {};
    const ocrOptions: string[] = [];

    if (!opts.dataDict) {
        await promises.each(
            getRuleAttrsUsed(rules, (rule) => {
                if (rule.type === 'basic' && rule.attribute === ExtraData.ocr) {
                    ocrOptions.push(rule.value);
                }
            }),
            async (tag) => {
                await populateDataDict({
                    dataDict,
                    tag,
                    filePath: filePath,
                    raw: true,
                    option: ocrOptions,
                });
            },
        );

        opts.onDataDict?.(dataDict, ocrOptions);
    }

    return evaluateRule(rules, opts.dataDict ?? dataDict);
};

const getRuleAttrsUsed = (
    rules: Rule,
    onRuleEvaluated?: (rule: Rule) => void,
): Array<RenameTemplates | ExtraData | string> => {
    const attrsUsed = new Set<string>();

    crawlRules(rules, (rule) => {
        onRuleEvaluated?.(rule);
        attrsUsed.add(rule.attribute);
    });

    return [...attrsUsed];
};

export const sanitizeStringForFilename = (input: string, replacement = '_') =>
    input.replace(/[^a-zA-Z0-9 _.\-()]/g, replacement);
