import App from './App.vue';
import {createApp} from 'vue';
import {createMemoryHistory, createRouter} from "vue-router";
import routes from "./router/routes.js";
import {createPinia} from 'pinia';


const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

const pinia = createPinia();

const app = createApp(App);
app.use(router)
app.use(pinia);
app.mount('#app')