import { Pipeline } from '@shared/common.types';

/** Electron supplements file path */
export type ElectronFile = File & { path: string };

export interface PipelineCardProps {
    pipelineItem: Pipeline;
    onDrop: (fileList: string[]) => void;
}
