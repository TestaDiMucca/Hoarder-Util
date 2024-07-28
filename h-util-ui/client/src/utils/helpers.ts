import { IpcMessageType } from '../../../common/common.constants';

type IpcRendererExposed = {
    send: <T>(channel: string, data: T) => void;
    on: <T>(channel: string, cb: (message: T) => void) => void;
};

/** Returns Electron communication channel if available */
export const getIpcRenderer = () => {
    const ipcRenderer = (window as any).electronIpc;

    if (!ipcRenderer) return null;

    return ipcRenderer as IpcRendererExposed;
};

/** Send a string message to Electron main channel for whatever reason */
export const sendMessageToMain = (message: string) => {
    const ipcRenderer = getIpcRenderer();

    if (!ipcRenderer) return;

    ipcRenderer.send(IpcMessageType.clientMessage, { message });
};
