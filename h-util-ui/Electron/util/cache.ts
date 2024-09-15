import { Storage } from '@shared/common.types';

class PipelineCache {
    private pipelines: Storage['pipelines'] | null = null;

    public cachePipelines = (pipelines: Storage['pipelines']) => {
        this.pipelines = pipelines;
    };

    public getPipelines = () => {
        return this.pipelines;
    };
}

export default new PipelineCache();
