import { createApp } from 'vue';
import { Quasar } from 'quasar';
import Notify from 'quasar/src/plugins/notify/Notify';

import './style.css';
import App from './App.vue';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

const myApp = createApp(App);

myApp.use(Quasar, {
    plugins: {
        Notify,
    },
    config: {
        notify: {
            timeout: 1500,
        },
    },
});

myApp.mount('#app');
