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
    };
};

export type Pipeline = {
    id?: string;
    name: string;
    processingModules: ProcessingModule[];
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

export type ClientMessageRequest = {
    message: string;
};
