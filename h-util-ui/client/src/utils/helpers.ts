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

// todo: use @common
export const sortObjects = <T extends Record<string, any>>(list: T[], key: keyof T, ascending: boolean = true): T[] => {
    return [
        ...list.sort((a, b) => {
            if (a[key] < b[key]) {
                return ascending ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return ascending ? 1 : -1;
            }
            return 0;
        }),
    ];
};

// todo: use @common
export const formatMilliseconds = (ms: number): string => {
    // Calculate hours, minutes, seconds, and milliseconds
    const hours = Math.floor(ms / (1000 * 60 * 60));
    ms %= 1000 * 60 * 60;
    const minutes = Math.floor(ms / (1000 * 60));
    ms %= 1000 * 60;
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;

    // Format each component to ensure correct number of digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(3, '0');

    // Combine into desired format
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
};

// todo: use @common
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0B';

    const sizes = ['b', 'kb', 'mb', 'gb', 'tb'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const value = bytes / Math.pow(1024, i);
    const formattedValue = value.toFixed(i === 0 ? 0 : 1); // No decimals for bytes

    return `${formattedValue} ${sizes[i]}`;
};

export const readTextFileAndParseJson = <T>(file: File): Promise<T> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsText(file);

        reader.onload = (e) => {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content) as T;
            // Needs validation.
            resolve(parsed);
        };

        reader.onerror = (e) => {
            // Error catch/report here
            reject(e);
        };
    });
