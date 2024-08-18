import path from 'path';
import moduleAliases from 'module-alias';

moduleAliases.addAliases({
    '@util': path.join(__dirname, 'util'),
    '@common': path.join(__dirname, 'packages'),
    '@shared': path.join(__dirname, '../common'),
});

import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, ipcMain, screen } from 'electron';

import { IpcMessageType } from '@shared/common.constants';
import { isDev } from './config';
import { appConfig } from './ElectronStore/Configuration';
import AppUpdater from './AutoUpdate';
import { ProcessingRequest, Storage } from '@shared/common.types';
import { handleClientMessage, handleRunPipeline } from './operations/handler';
import output from './util/output';
import { registerMainWindow } from './util/ipc';
import { loadJsonStore, saveJsonStore } from './ElectronStore/jsonStore';
import { getStatsFromStore } from '@util/stats';
import { writeFile } from 'fs/promises';

const DATA_FILE = 'data.json';

async function createWindow() {
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

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const appBounds: any = appConfig.get('setting.appBounds');
    const preload = path.join(__dirname, '/preload.js');
    const BrowserWindowOptions: BrowserWindowConstructorOptions = {
        width: 1200,
        minWidth: 900,
        height: 750,
        minHeight: 600,

        webPreferences: {
            preload,
            devTools: isDev,
        },
        show: false,
        alwaysOnTop: true,
        frame: true,
    };

    output.log(`Creating window w/ preload ${preload}`);

    if (appBounds !== undefined && appBounds !== null) Object.assign(BrowserWindowOptions, appBounds);
    const mainWindow = new BrowserWindow(BrowserWindowOptions);

    // auto updated
    if (!isDev) AppUpdater();

    // and load the index.html of the app.
    // win.loadFile("index.html");
    await mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './index.html')}`);

    if (appBounds !== undefined && appBounds !== null && appBounds.width > width && appBounds.height > height)
        mainWindow.maximize();
    else mainWindow.show();

    // this will turn off always on top after opening the application
    setTimeout(() => {
        mainWindow.setAlwaysOnTop(false);
    }, 1000);

    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    registerMainWindow(mainWindow);

    mainWindow.on('close', () => {
        mainWindow.webContents.send(IpcMessageType.close);
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

    ipcMain.handle(IpcMessageType.saveFile, async (e, content) => {
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

    ipcMain.on(IpcMessageType.runPipeline, (_e, d: string[]) => {
        if (d.length === 0) {
            output.error('Bad format');
            return;
        }

        const pipeline = JSON.parse(d[0]) as ProcessingRequest;
        handleRunPipeline(pipeline);
        output.log(`Run pipeline ${pipeline.pipeline.name} w/ ${pipeline.filePaths.length} files`);
    });

    ipcMain.on(IpcMessageType.confirmClose, () => app.exit());
    ipcMain.on(IpcMessageType.clientMessage, (_e, d: string[]) => handleClientMessage(d[0]));
    ipcMain.on(IpcMessageType.saveData, (_, data: string[]) => saveJsonStore(dataFilePath, data[0]));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    // if dev
    if (isDev) {
        try {
            const { installExt } = await import('./installDevTool');
            await installExt();
        } catch (e) {
            output.error('Can not install extension!');
        }
    }

    createWindow();

    app.on('activate', function () {
        output.log('Window activated and ready');

        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    output.log('All windows closed');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
