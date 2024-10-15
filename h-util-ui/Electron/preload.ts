import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('browserWindow', {
    versions: () => ipcRenderer.invoke('versions'),
});

/**
 * Note: Importing common types is causing issues. Make sure to refer to IpcMessageType
 *
 * Thread: https://github.com/electron/electron/issues/35587
 * Preload scripts cannot support importing modules. Molto trieste
 */
contextBridge.exposeInMainWorld('electronIpc', {
    send: ipcRenderer.send,
    invoke: ipcRenderer.invoke,
    on: ipcRenderer.on,
    onMainMessage: (cb: (message: string) => void) =>
        ipcRenderer.on('main-message', (_e, payload) => {
            cb(payload.message);
        }),
    onStatUpdate: (cb: (statPayload: object) => void) =>
        addSoleListener<object>('update-stat', (payload) => cb(payload)),
    onTaskProgress: (cb: (taskInfo: string) => void) =>
        addSoleListener<string>('task-progress', (payload) => cb(payload)),
    onRendererMessage: (cb: (statPayload: object) => void) =>
        addSoleListener<object>('renderer-message', (payload) => cb(payload)),
    loadData: () => ipcRenderer.invoke('load-data'),
    saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
    saveData: (data: string) => ipcRenderer.send('save-data', data),
    selectFolder: () => ipcRenderer.invoke('select-dir'),
});

const addSoleListener = <T>(channel: string, cb: (payload: T) => void) => {
    ipcRenderer.removeAllListeners(channel);

    ipcRenderer.on(channel, (_e, payload) => cb(payload));
};
