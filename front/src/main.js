import App from './App.vue';
import {createApp} from 'vue';
import {createMemoryHistory, createRouter} from "vue-router";
import routes from "./router/routes.js";
import {createPinia} from 'pinia';
import {
    QAvatar, QBadge,
    QBtn,
    QCard, QCardActions,
    QCardSection,
    QDrawer,
    QFooter,
    QHeader, QIcon, QImg,
    QLayout, QLinearProgress, QPageContainer,
    QRouteTab, QSeparator, QSpace, QTab,
    QTabs,
    QToolbar,
    QToolbarTitle,
    Quasar
} from 'quasar'

// Импортируем стили Quasar
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

const pinia = createPinia();

const app = createApp(App);
app.use(router)
app.use(pinia);
app.use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
    /*
    config: {
      brand: {
        // primary: '#e46262',
        // ... or all other brand colors
      },
      notify: {...}, // default set of options for Notify Quasar plugin
      loading: {...}, // default set of options for Loading Quasar plugin
      loadingBar: { ... }, // settings for LoadingBar Quasar plugin
      // ..and many more (check Installation card on each Quasar component/directive/plugin)
    }
    */
    components: {
        QLayout,
        QHeader,
        QToolbar,
        QBtn,
        QAvatar,
        QTabs,
        QRouteTab,
        QDrawer,
        QFooter,
        QToolbarTitle,
        QPageContainer,
        QSpace,
        QCard,
        QCardSection,
        QImg,
        QCardActions,
        QBadge,
        QIcon,
        QLinearProgress,
        QTab,
        QSeparator,
    }
})


app.mount('#app')