export default [
    {
        path: '/',
        component: () => import('../components/MainLayout.vue'),
        children: [
            {path: '/', component: () => import('../pages/Home.vue')},
            {path: '/world', component: () => import('../pages/World.vue')},
            {path: '/game', component: () => import('../pages/Game.vue')},
            {path: '/library', component: () => import('../pages/Library.vue')},
        ]
    },
]
