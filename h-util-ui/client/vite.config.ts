import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
    build: {
        outDir: './../dist/Electron',
        chunkSizeWarningLimit: 1000,
    },
    base: mode == 'development' ? '' : './',
    plugins: [
        vue(),
        tsconfigPaths(),
        quasar({
            sassVariables: 'src/quasar-variables.sass',
        }) as any,
    ],
    server: {
        port: 3000,
    },
}));
