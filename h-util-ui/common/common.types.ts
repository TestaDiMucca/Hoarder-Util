export enum ProcessingModuleType {
    datePrefix = 'Date Prefix',
    metadata = 'Metadata Tagging',
    compressImage = 'Compress Image',
    compressVideo = 'Compress Video',
    subfolder = 'Place in Directory',
    iterate = 'Iterate',
    filter = 'Filter',
    ocr = 'Text Parsing (OCR)',
    report = 'Report output',
    dynamicRename = 'Dynamic Rename',
}

export type ProcessingModule = {
    type: ProcessingModuleType;
    options: {
        value: string | number;
        ignoreErrors?: boolean;
        skipPreviouslyFailed?: boolean;
        inverse?: boolean;
    };
};

export type Pipeline = {
    id?: string;
    name: string;
    created?: string;
    modified?: string;
    manualRanking?: number;
    timesRan?: number;
    processingModules: ProcessingModule[];
};

export type Storage = {
    pipelines: Record<string, Pipeline>;
};

export type StatsStorage = {
    /** Times each pipeline got ran */
    pipelineRuns: Record<string, number>;
    /** Number of bytes reduced via compression modules */
    bytesShaved: number;
    /** Amount of time spent running tasks */
    msRan: number;
    /** Number of words read from parser */
    wordsParsed: number;
};

export type TaskQueue = Array<SpawnedTask>;

export type SpawnedTask = {
    id: number;
    /** Numerical id to sort */
    pipelineId: string;
    name: string;
    /** Percentage out of 100 */
    progress: number;
    subName?: string;
    subProgress?: number;
};

export type ProcessingRequest = {
    pipeline: Pipeline;
    filePaths: string[];
};

export type FilterTestRequest = {
    filter: string;
    invert: boolean;
    filePaths: string[];
    moduleType?: ProcessingModuleType;
};

export type RenameTestRequest = {
    templateString: string;
    filePaths: string[];
};
