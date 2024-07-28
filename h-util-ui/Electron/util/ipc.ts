import { BrowserWindow } from 'electron';

import output from './output';
import { IpcMessageType } from '../../common/common.constants';

let mainWindow: BrowserWindow | null = null;

export const registerMainWindow = (newWindow: BrowserWindow) => {
    mainWindow = newWindow;
    output.out('Main window registered, ready for IPC use.');
};

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
