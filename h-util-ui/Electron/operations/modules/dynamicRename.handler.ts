import { RenameTemplates } from '@shared/common.constants';
import { ConfigError } from '@util/errors';
import { ModuleHandler, ModuleOptions } from '@util/types';

type RequiredDataContext = {
    requiredData?: Set<DataNeeded>;
    tags?: string[];
};

type DataDict = Partial<Record<RenameTemplates, string>>;

const dynamicRenameHandler: ModuleHandler<RequiredDataContext> = {
    handler: async ({ filePath }, opts) => {
        const stringTemplate = opts.clientOptions?.value;

        if (!stringTemplate) throw new ConfigError('No string template provided');

        if (!opts.context?.requiredData) populateContext(String(stringTemplate), opts);

        const dataDict: DataDict = {};
        // Gather data into map

        populateDataDict(dataDict, opts.context!.tags!, filePath);

        // Replace using data from the map
    },
};

export default dynamicRenameHandler;

const populateDataDict = (dataDict: DataDict, tags: string[], filePath: string) => {};

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

    return matches;
};
