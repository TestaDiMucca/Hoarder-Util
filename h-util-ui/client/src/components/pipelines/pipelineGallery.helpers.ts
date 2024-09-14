import { Pipeline } from '@shared/common.types';
import { sortObjects } from '@utils/helpers';

export enum SortType {
    asc = 'ASC',
    desc = 'DESC',
}

export enum SortBy {
    manualRanking = 'Manual ranking',
    timesRan = 'Times ran',
    name = 'Name',
    created = 'Date created',
    modified = 'Last modified',
}

export enum CardStyles {
    standard = 'standard',
    // swatch = 'swatch',
    compact = 'compact',
    // detailed = 'detailed',
}

const SORT_BY_MAP: Record<SortBy, keyof Pipeline> = {
    [SortBy.created]: 'created',
    [SortBy.manualRanking]: 'manualRanking',
    [SortBy.modified]: 'modified',
    [SortBy.name]: 'name',
    [SortBy.timesRan]: 'timesRan',
};

export const sortPipelines = (pipelines: Pipeline[], sortBy: SortBy, sortType: SortType) => {
    const sortKey = SORT_BY_MAP[sortBy];

    return sortObjects(pipelines, sortKey, sortType === SortType.asc);
};
