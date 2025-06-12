import { sanitizeStringForFilename } from '../handler.helpers';

const replacementCharacter = '_';

export const fileNameSafeTitleReplace = (filename: string, metadataTitle: string): string => {
    const fileSafeFilename = sanitizeStringForFilename(filename, replacementCharacter);
    const fileSafeTitle = sanitizeStringForFilename(metadataTitle, replacementCharacter);

    if (fileSafeTitle === metadataTitle) return filename; // No change needed

    if (!fileSafeFilename.includes(fileSafeTitle)) return filename; // No match found

    const replacementCharCount = (fileSafeFilename.match(new RegExp(replacementCharacter, 'g')) || []).length;

    if (filename.length > 10 && replacementCharCount / filename.length > 0.4) return metadataTitle; // Too many replacement characters

    return filename.replace(fileSafeTitle, metadataTitle);
};
