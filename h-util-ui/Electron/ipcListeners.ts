import path from 'path';
import { app, dialog } from 'electron';
import { IpcMessageType } from '@shared/common.constants';
import { loadJsonStore, saveJsonStore } from './ElectronStore/jsonStore';
import { getStatsFromStore } from '@util/stats';
import { ProcessingModuleType, ProcessingRequest, RunTestRequest, Storage } from '@shared/common.types';
import { getMainWindow, handleErrorMessage } from '@util/ipc';
import { writeFile } from 'fs/promises';
import { filterTest } from './operations/filterTest';
import { renameTest } from './operations/renameTest';
import output from '@util/output';
import { handleClientMessage, handleRunPipeline } from './operations/handler';

const DATA_FILE = 'data.json';

export const addListenersToIpc = (ipcMain: Electron.IpcMain) => {
    /** Create handlers before window is ready */
    const dataFilePath = path.join(app.getPath('userData'), DATA_FILE);

    ipcMain.handle(IpcMessageType.loadData, async () => {
        const data = await loadJsonStore<Storage>(dataFilePath);
        if (data?.pipelines) {
            const stats = await getStatsFromStore();

            if (!stats) return data;

            const mapped: Storage = { pipelines: {} };
            Object.keys(data.pipelines).forEach((pipelineId) => {
                mapped.pipelines[pipelineId] = {
                    ...data.pipelines[pipelineId],
                    timesRan: stats.pipelineRuns[pipelineId] ?? 0,
                };
            });

            return mapped;
        }

        return data;
    });
    ipcMain.handle(IpcMessageType.getStats, async () => {
        const stats = await getStatsFromStore();
        const data = await loadJsonStore<Storage>(dataFilePath);
        // replace the id with name

        if (!stats || !data) return {};

        const pipelineRuns = Object.entries(stats?.pipelineRuns).reduce<Record<string, number>>(
            (a, [pipelineId, runCount], i) => {
                const pipelineName = data.pipelines[pipelineId]?.name ?? `Unknown/Deleted ${i}`;

                a[pipelineName] = runCount;
                return a;
            },
            {},
        );

        return {
            ...stats,
            pipelineRuns,
        };
    });
    ipcMain.handle(IpcMessageType.selectDirectory, async () => {
        const mainWindow = getMainWindow();
        if (!mainWindow) throw new Error('No main window registered');

        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
        });
        if (canceled) {
            return;
        } else {
            return filePaths[0];
        }
    });

    ipcMain.handle('versions', () => {
        return {
            node: process.versions.chrome,
            chrome: process.versions.chrome,
            electron: process.versions.electron,
            version: app.getVersion(),
            name: app.getName(),
        };
    });

    ipcMain.handle(IpcMessageType.errorReport, async (_e, content: string) => {
        handleErrorMessage(content);
    });

    ipcMain.handle(IpcMessageType.saveFile, async (_e, content) => {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save pipeline data',
            defaultPath: path.join(app.getPath('downloads'), `h-util-pipelines_${Date.now()}.json`),
            buttonLabel: 'Save',
            filters: [
                { name: 'Json files', extensions: ['json'] },
                { name: 'All files', extensions: ['*'] },
            ],
        });

        if (filePath) {
            writeFile(filePath, content, 'utf-8');
        }
    });

    ipcMain.handle(IpcMessageType.runTest, async (_e, testRequest: RunTestRequest) => {
        switch (testRequest.type) {
            case ProcessingModuleType.dynamicRename:
                return await renameTest(testRequest);
            case ProcessingModuleType.ruleFilter:
            case ProcessingModuleType.filter:
                return await filterTest(testRequest);
            default:
                return [];
        }
    });

    /** @deprecated use runTest */
    ipcMain.handle(IpcMessageType.testFilter, async (_e, filterTestRequest) => {
        const filtered = await filterTest(filterTestRequest);

        return filtered;
    });

    /** @deprecated use runTest */
    ipcMain.handle(IpcMessageType.testRename, async (_e, renameTestRequest) => {
        const renamed = await renameTest(renameTestRequest);

        return renamed;
    });

    ipcMain.on(IpcMessageType.runPipeline, (_e, d: string[]) => {
        if (d.length === 0) {
            output.error('Bad format');
            return;
        }

        const pipeline = JSON.parse(d[0]) as ProcessingRequest;
        handleRunPipeline(pipeline);
        output.log(`Run pipeline ${pipeline.pipeline.name} w/ ${pipeline.filePaths.length} files`);
    });

    ipcMain.on(IpcMessageType.clientMessage, (_e, d: string[]) => handleClientMessage(d[0]));
    ipcMain.on(IpcMessageType.saveData, (_, data: string[]) => saveJsonStore(dataFilePath, data[0]));
};
