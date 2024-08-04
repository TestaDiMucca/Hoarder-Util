import { ProcessingModule } from '@shared/common.types';

export type ModuleOptions<T extends object> = {
    onProgress: (label: string, progress: number) => void;
    onSuccess: () => void;
    /** Additional info, such as template strings */
    context: T;
    clientOptions?: ProcessingModule['options'];
};

export type FileOptions = {
    filesWithMeta: FileWithMeta[];
};

export type ModuleHandler<T extends object = ProcessingModule['options'], S = Record<string, any>> = {
    handler: (fileWithMeta: FileWithMeta, opts: Partial<ModuleOptions<T>>, dataStore: S) => Promise<void>;
    /** Return false if we shouldn't process a file */
    filter?: (filePath: string) => Promise<boolean> | boolean;
    /** Hook to run on done */
    onDone?: (
        opts: Partial<ModuleOptions<T>>,
        dataStore: S,
        fileOptions: { filesWithMeta: FileWithMeta[] },
    ) => Promise<void>;
};

export type FileWithMeta = {
    filePath: string;
    previouslySkipped?: boolean;
    /** Flag for removal at end of handler */
    remove?: boolean;
};
