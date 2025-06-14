import { createRouter, createMemoryHistory } from 'vue-router'
import routes from './routes'
// import { authStore } from 'src/store/auth'

export default  createRouter({
    history: createMemoryHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { left: 0, top: 0 };
    },
})
