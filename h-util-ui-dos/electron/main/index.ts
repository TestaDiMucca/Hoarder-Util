import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

import moduleAliases from 'module-alias';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

moduleAliases.addAliases({
    '@util': path.join(__dirname, '../util'),
    '@common': path.join(__dirname, '../../common'),
});

import { IpcMessageType } from '../../common/common.constants';
import { loadJsonStore, saveJsonStore } from '../utils/jsonStore';
import { getStatsFromStore } from '../utils/stats';
import { ProcessingRequest, Storage } from '../../common/common.types';
import { registerMainWindow } from '../utils/ipc';
import output from '../utils/output';
import { handleClientMessage, handleRunPipeline } from '../operations/handler';

const DATA_FILE = 'data.json';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
let dataFilePath: string = '';
const preload = path.join(__dirname, '../preload/index.js');
const indexHtml = path.join(RENDERER_DIST, 'index.html');

async function createWindow() {
    /** Create handlers before window is ready */
    dataFilePath = path.join(app.getPath('userData'), DATA_FILE);
    ipcMain.handle(IpcMessageType.loadData, async () => {
        const data = await loadJsonStore<Storage>(dataFilePath);
        if (data?.pipelines) {
            const stats = await getStatsFromStore();

            if (!stats) return data;

            const mapped: Storage = { pipelines: {} };
            Object.keys(data.pipelines).forEach((pipelineId) => {
                mapped.pipelines[pipelineId] = {
                    ...data.pipelines[pipelineId],
                    timesRan: stats.pipelineRuns[data.pipelines[pipelineId]?.name] ?? 0,
                };
            });

            return mapped;
        }

        return data;
    });
    ipcMain.handle(IpcMessageType.getStats, () => getStatsFromStore());

    win = new BrowserWindow({
        title: 'Main window',
        icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // nodeIntegration: true,

            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            // contextIsolation: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        // #298
        win.loadURL(VITE_DEV_SERVER_URL);
        // Open devTool if the app is not packaged
        win.webContents.openDevTools();
    } else {
        win.loadFile(indexHtml);
    }

    registerMainWindow(win);

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString());
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });
    // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
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
