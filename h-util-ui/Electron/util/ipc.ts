import { BrowserWindow } from 'electron';

import output from './output';
import { IpcMessageType } from '../../common/common.constants';
import { SpawnedTask, UpdateStatPayload } from '@shared/common.types';
import logger from '@util/logger';

let mainWindow: BrowserWindow | null = null;

export const registerMainWindow = (newWindow: BrowserWindow) => {
    mainWindow = newWindow;
    output.out('Main window registered, ready for IPC use.');
};

export const getMainWindow = () => mainWindow;

/** Send a string message to the client */
export const messageWindow = (message: string) => {
    if (!mainWindow) {
        output.error('Main window not initialized');
        return;
    }

    output.log(`Sending ipc message: ${message}`);

    mainWindow.webContents.send(IpcMessageType.mainMessage, {
        message,
    });
};

export const updateTaskProgress = (data: SpawnedTask) => {
    if (!mainWindow) {
        output.error('Main window not initialized');
        return;
    }

    mainWindow.webContents.send(IpcMessageType.taskProgress, JSON.stringify(data));
};

export const handleErrorMessage = (message: string, stack?: string) => {
    logger.error(`[err] Error: ${message}`, stack);
};

export const addStat = (payload: UpdateStatPayload) => {
    if (!mainWindow) {
        output.error('Main window not initialized');
        return;
    }

    mainWindow.webContents.send(IpcMessageType.updateStat, payload);
};
