import { ProcessingModule } from '../../common/common.types';

export type ModuleOptions<T extends object> = {
    onProgress: (label: string, progress: number) => void;
    onSuccess: () => void;
    /** Additional info, such as template strings */
    context: T;
    clientOptions?: ProcessingModule['options'];
};

export type ModuleHandler<T extends object = {}> = {
    handler: (filePath: string, opts?: Partial<ModuleOptions<T>>) => Promise<void>;
    filter: (filePath: string) => Promise<boolean>;
};
