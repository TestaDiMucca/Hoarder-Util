import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('browserWindow', {
    versions: () => ipcRenderer.invoke('versions'),
});

contextBridge.exposeInMainWorld('electronIpc', {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
});
