import { IpcMessageType } from '@shared/common.constants';
import { StatsStorage, Storage } from '@shared/common.types';
import { VueStore } from './store';

/**
 * Sometimes structuredClone throws an error, catch and retry with caveman method
 */
export const cloneObject = <T extends object>(obj: T) => {
    try {
        return structuredClone(obj);
    } catch (e) {
        return JSON.parse(JSON.stringify(obj));
    }
};

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

    ipcRenderer.send(IpcMessageType.clientMessage, [message]);
};

export const loadUserData = async () => {
    const ipcRenderer = getIpcRenderer();

    if (!ipcRenderer) return null;

    return await ipcRenderer?.loadData<Storage>();
};

export const loadStats = async () => {
    const ipcRenderer = getIpcRenderer();

    if (!ipcRenderer) return null;

    return await ipcRenderer?.loadStats<StatsStorage>();
};

export const saveUserData = (data: VueStore['pipelines']) => {
    const ipcRenderer = getIpcRenderer();

    const serialized = JSON.stringify(
        {
            pipelines: data,
        },
        null,
        2,
    );

    ipcRenderer?.send(IpcMessageType.saveData, [serialized]);
};
