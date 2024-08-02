import { StatsStorage } from '@shared/common.types';
import { app } from 'electron';
import { loadJsonStore, saveJsonStore } from 'Electron/ElectronStore/jsonStore';
import { join } from 'path';

const DATA_FILE = 'stats.json';
const dataFilePath = join(app.getPath('userData'), DATA_FILE);

export const getStatsFromStore = () => loadJsonStore<StatsStorage>(dataFilePath);

export const writeStatsToStore = (data: Partial<StatsStorage>) => saveJsonStore(dataFilePath, JSON.stringify(data));

export const addPipelineRunToStats = async (pipelineName: string) => {
    const current = await getStatsFromStore();

    const newStats = {
        ...(current ?? {}),
    } as StatsStorage;

    if (!newStats.pipelineRuns) newStats.pipelineRuns = {};

    newStats.pipelineRuns[pipelineName] = newStats.pipelineRuns[pipelineName]
        ? newStats.pipelineRuns[pipelineName] + 1
        : 1;

    await writeStatsToStore(newStats);
};

export const addNumericalStat = async (statName: keyof Omit<StatsStorage, 'pipelineRuns'>, statAddition: number) => {
    const current = await getStatsFromStore();

    const newStats = {
        ...(current ?? {}),
    } as StatsStorage;

    newStats[statName] = newStats[statName] ? newStats[statName] + statAddition : statAddition;

    await writeStatsToStore(newStats);
};
