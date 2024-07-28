/** Manually added to prevent ts error */
declare module 'vue-material-design-icons/*.vue' {
    import type { DefineComponent } from 'vue';

    const IconVue: DefineComponent<{
        /** `size` defaults to 24 */
        size?: number;
        /** `fillColor` defaults to 'currentColor' */
        fillColor?: string;
        title?: string;
    }>;
    export default IconVue;
}

type IpcRendererExposed = {
    send: <T>(channel: string, data: T) => void;
    on: <T>(channel: string, cb: (event: unknown, message: T) => void) => void;
    onMainMessage: (cb: (msg: string) => void) => void;
};

interface Window {
    electronIpc?: IpcRendererExposed;
}
