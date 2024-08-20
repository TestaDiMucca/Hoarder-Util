import { ProcessingModule, ProcessingModuleType } from '@shared/common.types';

export interface PipelineOptionsProps {
    moduleType: ProcessingModuleType;
    currentOptions: ProcessingModule['options'];
    handleOptionChange: (flag: keyof ProcessingModule['options'], newValue: string) => void;
}
