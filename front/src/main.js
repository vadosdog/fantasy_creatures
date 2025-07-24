import App from './App.vue';
import {createApp} from 'vue';
import {createMemoryHistory, createRouter} from "vue-router";
import routes from "./router/routes.js";
import {createPinia} from 'pinia';
import quasarLang from 'quasar/lang/ru'
import {
    ClosePopup,
    QAvatar, QBadge,
    QBtn,
    QCard, QCardActions,
    QCardSection, QDialog,
    QDrawer,
    QFooter,
    QHeader, QIcon, QImg, QKnob,
    QLayout, QLinearProgress, QPage, QPageContainer,
    QRouteTab, QScrollArea, QSeparator, QSpace, QTab,
    QTabs, QTimeline, QTimelineEntry,
    QToolbar,
    QToolbarTitle, QTooltip,
    Quasar, Notify
} from 'quasar'

// Импортируем стили Quasar
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import '../src/css/tailwind.css'

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

const pinia = createPinia();

const app = createApp(App);
app.use(router)
app.use(pinia);
app.use(Quasar, {
    lang: quasarLang,
    plugins: [Notify], // import Quasar plugins and add here

    config: {
        brand: {
            primary: '#CC66FF',
            secondary: '#26A69A',
            accent: '#66CCFF',

            dark: '#1d1d1d',
            'dark-page': '#121212',

            positive: '#21BA45',
            negative: '#C10015',
            info: '#31CCEC',
            warning: '#F2C037'
        },
        // notify: {...}, // default set of options for Notify Quasar plugin
        // loading: {...}, // default set of options for Loading Quasar plugin
        // loadingBar: { ... }, // settings for LoadingBar Quasar plugin
        // ..and many more (check Installation card on each Quasar component/directive/plugin)
    },
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
        QKnob,
        QDialog,
        QScrollArea,
        QTimeline,
        QTimelineEntry,
        QPage,
        QTooltip,
    },
    directives: {ClosePopup},
})


app.mount('#app')