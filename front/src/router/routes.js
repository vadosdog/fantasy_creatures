export default [
    {
        path: '/',
        component: () => import('../components/MainLayout.vue'),
        children: [
            {path: '/', component: () => import('../pages/Home.vue')},
            {path: '/game', component: () => import('../pages/Game.vue')},
        ]
    },
]
