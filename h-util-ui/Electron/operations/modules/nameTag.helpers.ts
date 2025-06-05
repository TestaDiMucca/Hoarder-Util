const makeFileSafe = (input: string) => input.replace(/[^a-zA-Z0-9 _.\-()]/g, '_');
/**
 * Source: GPT ;)
 * @param filename Title from filename
 * @param metadataTitle
 * @returns
 */
export const fileNameSafeTitleReplace = (filename: string, metadataTitle: string): string => {
    const fileSafeFilename = makeFileSafe(filename);
    const fileSafeTitle = makeFileSafe(metadataTitle);

    if (fileSafeTitle === metadataTitle) return filename; // No change needed

    if (!fileSafeFilename.includes(fileSafeTitle)) return filename; // No match found

    return filename.replace(fileSafeTitle, metadataTitle);
};
