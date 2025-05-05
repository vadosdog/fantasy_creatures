export default [
    {
        path: '/',
        component: () => import('../components/MainLayout.vue'),
        children: [
            {path: '/', component: () => import('../pages/Home.vue')},
            {path: '/game', component: () => import('../pages/Game.vue')},
            {path: '/phaser-game', component: () => import('../pages/PhaserGame.vue')},
        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    // {
    //   path: '/:catchAll(.*)*',
    //   component: () => import('pages/ErrorNotFound.vue')
    // }
]
