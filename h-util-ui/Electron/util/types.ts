import { ActionModule } from '@shared/common.types';

export type CommonContext = {
    eventLog?: string[];
    pipelineName?: string;
    pipelineId?: string;
};

export type ModuleOptions<T extends object> = {
    onProgress: (label: string, progress: number) => void;
    /** Push a message up when done */
    onSuccess: (message?: string) => void;
    /** Additional info, such as template strings */
    context: CommonContext & T;
    /** Passed from the pipeline's module configuration */
    clientOptions?: ActionModule['options'];
};

/** Object wrapper for file list to allow us to modify the reference */
export type FileOptions = {
    filesWithMeta: FileWithMeta[];
};

export type ModuleHandler<T extends object = {}, S = Record<string, any>> = {
    /** Per-file handler. If none provided, provide an onDone for a single method run */
    handler?: (fileWithMeta: FileWithMeta, opts: Partial<ModuleOptions<T>>, dataStore: S) => Promise<void>;
    /** Return false if we shouldn't process a file */
    filter?: (filePath: string) => Promise<boolean> | boolean;
    /** Hook to run on done with all files or if no handler was provided */
    onDone?: (
        opts: Partial<ModuleOptions<T>>,
        dataStore: S,
        fileOptions?: { filesWithMeta: FileWithMeta[] },
    ) => Promise<void>;
};

export type FileWithMeta = {
    filePath: string;
    /** We usually apply this, but for test mode, we append this */
    newFilePath?: string;
    /** @deprecated we can just drop the file processing now */
    previouslySkipped?: boolean;
    /** Flag telling the pipeline to stop processing this */
    remove?: boolean;
};
