import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('browserWindow', {
    versions: () => ipcRenderer.invoke('versions'),
});

/**
 * Note: Importing common types is causing issues. Make sure to refer to IpcMessageType
 *   until this is fixed
 */

contextBridge.exposeInMainWorld('electronIpc', {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    onMainMessage: (cb: (message: string) => void) =>
        ipcRenderer.on('main-message', (_e, payload) => {
            cb(payload.message);
        }),
    onTaskProgress: (cb: (taskInfo: string) => void) => ipcRenderer.on('task-progress', (_e, payload) => cb(payload)),
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (data: string) => ipcRenderer.send('save-data', data),
    onAppClose: (callback: () => void) => ipcRenderer.on('close', callback),
    confirmAppClose: () => ipcRenderer.send('confirm-close'),
});
