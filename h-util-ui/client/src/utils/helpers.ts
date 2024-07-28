import { IpcMessageType } from '../../../common/common.constants';

/** Returns Electron communication channel if available */
export const getIpcRenderer = () => {
    const ipcRenderer = window.electronIpc;

    if (!ipcRenderer) return null;

    return ipcRenderer;
};

/** Send a string message to Electron main channel for whatever reason */
export const sendMessageToMain = (message: string) => {
    const ipcRenderer = getIpcRenderer();

    if (!ipcRenderer) return;

    ipcRenderer.send(IpcMessageType.clientMessage, { message });
};
