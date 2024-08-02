import { join } from 'path';
import { app } from 'electron';

import { StatsStorage } from '@shared/common.types';
import { loadJsonStore, saveJsonStore } from '../ElectronStore/jsonStore';

const DATA_FILE = 'stats.json';
const dataFilePath = join(app.getPath('userData'), DATA_FILE);

export const getStatsFromStore = () => loadJsonStore<StatsStorage>(dataFilePath);

export const writeStatsToStore = (data: Partial<StatsStorage>) => saveJsonStore(dataFilePath, JSON.stringify(data));

const getCurrentStateCopy = async () => {
    const current = await getStatsFromStore();

    const newStats = {
        ...(current ?? {}),
    } as StatsStorage;

    return newStats;
};

export const addPipelineRunToStats = async (pipelineName: string) => {
    const newStats = await getCurrentStateCopy();

    if (!newStats.pipelineRuns) newStats.pipelineRuns = {};

    newStats.pipelineRuns[pipelineName] = newStats.pipelineRuns[pipelineName]
        ? newStats.pipelineRuns[pipelineName] + 1
        : 1;

    await writeStatsToStore(newStats);
};

export const addNumericalStat = async (statName: keyof Omit<StatsStorage, 'pipelineRuns'>, statAddition: number) => {
    const newStats = await getCurrentStateCopy();

    newStats[statName] = newStats[statName] ? newStats[statName] + statAddition : statAddition;

    await writeStatsToStore(newStats);
};
