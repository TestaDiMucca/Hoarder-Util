import { ProcessingModule } from '@shared/common.types';

export type ModuleOptions<T extends object> = {
    onProgress: (label: string, progress: number) => void;
    onSuccess: () => void;
    /** Additional info, such as template strings */
    context: T;
    clientOptions?: ProcessingModule['options'];
};

export type ModuleHandler<T extends object = ProcessingModule['options'], S = Record<string, any>> = {
    handler: (filePath: string, opts: Partial<ModuleOptions<T>>, dataStore: S) => Promise<void>;
    filter: (filePath: string) => Promise<boolean>;
};

export type FileWithMeta = {
    filePath: string;
    previouslySkipped?: boolean;
};
