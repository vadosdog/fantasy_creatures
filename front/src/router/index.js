import { createRouter, createMemoryHistory } from 'vue-router'
import routes from './routes'
// import { authStore } from 'src/store/auth'

export default  createRouter({
    history: createMemoryHistory(),
    routes,
})
