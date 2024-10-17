import { BrowserWindow } from 'electron';
import { v4 as uuidv4 } from 'uuid';

import output from './output';
import { IpcMessageType } from '../../common/common.constants';
import { RendererMessage, RendererMessagePayload, SpawnedTask, UpdateStatPayload } from '@shared/common.types';
import logger from '@util/logger';
import eventEmitter from './events';

let mainWindow: BrowserWindow | null = null;

export const registerMainWindow = (newWindow: BrowserWindow) => {
    mainWindow = newWindow;
    output.out('Main window registered, ready for IPC use.');
};

export const getMainWindow = () => mainWindow;

/**
 * Send a string message to the client
 * @deprecated use sendRendererMessage
 */
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

export const sendRendererMessage = (payload: RendererMessagePayload) =>
    new Promise<RendererMessage>((resolve, reject) => {
        if (!mainWindow) {
            output.error('Main window not initialized');
            return reject('No main window');
        }

        const messageId = uuidv4();

        mainWindow.webContents.send(
            IpcMessageType.rendererMessage,
            JSON.stringify({
                ...payload,
                messageId,
            }),
        );

        /** Handle replies */
        eventEmitter.on('rendererMessage', (payload: RendererMessage) => {
            if (payload.messageId !== messageId) return;

            console.debug('Response received', payload);
            resolve(payload);
        });
    });

export const handleErrorMessage = (message: string, stack?: string) => {
    logger.error(`[err] Error: ${message}`, stack);
};

/** @deprecated use sendRendererMessage */
export const addStat = (payload: UpdateStatPayload) => {
    if (!mainWindow) {
        output.error('Main window not initialized');
        return;
    }

    mainWindow.webContents.send(IpcMessageType.updateStat, payload);
};
