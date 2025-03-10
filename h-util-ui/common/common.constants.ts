export enum IpcMessageType {
    /** Execute a pipeline on some loaded files */
    runPipeline = 'run-pipeline',
    /** Transfer a message from main to client */
    mainMessage = 'main-message',
    /** Transfer a message from the client to main */
    clientMessage = 'client-message',
    /** Persist saved user data */
    saveData = 'save-data',
    /** Let main update the client on task progress */
    taskProgress = 'task-progress',
    /** Call an electron dialog from the client to save file */
    saveFile = 'save-file',
    /** Open dialog to select a directory */
    selectDirectory = 'select-dir',
    /** Receive a file list and test against it, returning results */
    testFilter = 'test-filter',
    /** Send a renderer error to the main process */
    errorReport = 'errorReport',
    /** Test dynamic renaming */
    testRename = 'test-rename',
    /** Run a test rename, filter, or otherwise */
    runTest = 'run-test',
    /** An "aqueduct" operation */
    aqueducts = 'aqueducts',
    getDbPath = 'get-db-path',
    /** Let main request renderer to update stats */
    updateStat = 'update-stat',
    rendererMessage = 'renderer-message',
}

export enum RenameTemplates {
    ParentFolder = 'parentFolder',
    ExifTaken = 'exifTaken',
    DateCreated = 'dateCreated',
    DateModified = 'dateModified',
    OriginalName = 'original',
    SlugifiedName = 'slugified',
    MetaArtist = 'metaArtist',
    MetaAlbum = 'metaAlbum',
    MetaTitle = 'metaTitle',
    MetaTrackNo = 'metaTrackNo',
}

/**
 * Data we can extract from files
 */
export enum ExtraData {
    ocr = 'ocr',
    FileSize = 'fileSize',
    Extension = 'ext',
}

export const defaultTimeMask = 'yy-mm-dd-HH-MM';
