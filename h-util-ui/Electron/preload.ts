import { contextBridge, ipcRenderer } from 'electron/renderer';
import { IpcMessageType } from '../common/common.constants';

contextBridge.exposeInMainWorld('browserWindow', {
    versions: () => ipcRenderer.invoke('versions'),
});

contextBridge.exposeInMainWorld('electronIpc', {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    onMainMessage: (cb: (message: string) => void) =>
        ipcRenderer.on('main-message', (_e, payload) => {
            cb(payload.message);
        }),
});
