import { sanitizeStringForFilename } from '../handler.helpers';

export const fileNameSafeTitleReplace = (filename: string, metadataTitle: string): string => {
    const fileSafeFilename = sanitizeStringForFilename(filename);
    const fileSafeTitle = sanitizeStringForFilename(metadataTitle);

    if (fileSafeTitle === metadataTitle) return filename; // No change needed

    if (!fileSafeFilename.includes(fileSafeTitle)) return filename; // No match found

    return filename.replace(fileSafeTitle, metadataTitle);
};
