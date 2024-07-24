import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig(({ mode }) => ({
    build: {
        outDir: './../dist',
        chunkSizeWarningLimit: 1000,
    },
    base: mode == 'development' ? '' : './',
    plugins: [
        vue(),
        quasar({
            sassVariables: 'src/quasar-variables.sass',
        }),
    ],
    server: {
        port: 3000,
    },
}));
