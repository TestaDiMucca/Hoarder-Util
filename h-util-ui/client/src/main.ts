import { createApp } from 'vue';
import { Quasar } from 'quasar';

import './style.css';
import App from './App.vue';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

const myApp = createApp(App);

myApp.use(Quasar, {
    plugins: {},
});

myApp.mount('#app');
