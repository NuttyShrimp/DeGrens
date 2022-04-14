import { createApp } from 'vue';

import { key, store } from '@/lib/store';

import App from './App.vue';

import 'animate.css/animate.min.css';

const app = createApp(App);
app.use(store, key);
app.mount('#app');
