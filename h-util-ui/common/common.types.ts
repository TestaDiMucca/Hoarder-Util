export enum ProcessingModuleType {
    datePrefix = 'Date Prefix',
    metadata = 'Metadata Tagging',
    compressImage = 'Compress Image',
    compressVideo = 'Compress Video',
    subfolder = 'Place in Directory',
}

export type ProcessingModule = {
    type: ProcessingModuleType;
    options: {
        value: string | number;
        ignoreErrors?: boolean;
        skipPreviouslyFailed?: boolean;
    };
};

export type Pipeline = {
    id?: string;
    name: string;
    processingModules: ProcessingModule[];
};

export type Storage = {
    pipelines: Record<string, Pipeline>;
};

export type TaskQueue = Array<any>;

export type SpawnedTask = {
    id?: string;
    name: string;
    /** Percentage out of 100 */
    progress: number;
};

export type ProcessingRequest = {
    pipeline: Pipeline;
    filePaths: string[];
};
