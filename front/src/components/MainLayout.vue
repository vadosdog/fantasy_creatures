<script setup>
import {ref, toRaw, shallowRef} from "vue";
import {useGameStore} from "../store/game.js";
import DefaultFooter from './DefaultFooter.vue'


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();
const rightDrawerOpen = ref(false)
const currentRightDrawerContent = shallowRef(null)
const currentFooterComponent = shallowRef(DefaultFooter)
const currentHeaderComponent = shallowRef(null)

const handleFooterUpdate = (component) => {
    currentFooterComponent.value = component || DefaultFooter
}

const handleHeaderUpdate = (component) => {
    currentHeaderComponent.value = component
}

const handleDrawerUpdate = (component) => {
    rightDrawerOpen.value = !!component
    currentRightDrawerContent.value = component
}

const store = useGameStore()

const changeScene = (newScene) => {
    if (!store.scene) {
        return
    }

    store.scene.start(newScene);
}

const toggleRightDrawer = () => {
    rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
<template>
    <q-layout view="hhh lpR lfr">

        <q-header elevated class="bg-primary text-white">
            <q-toolbar>
                <!-- Логотип и название -->
                <div class="row items-center no-wrap">
                    <q-avatar>
                        <img src="/favicon-32x32.png">
                    </q-avatar>
                    <span class="q-ml-sm">Рунные осколки</span>
                </div>

                <!-- Табы - теперь в одной строке с лого -->
                <q-tabs inline-label align="left" class="q-ml-md">
                    <q-route-tab to="/" label="Home"/>
                    <q-route-tab to="/game" label="Game"/>
                </q-tabs>

                <!-- Кнопки справа -->
                <q-space/> <!-- Заполняет доступное пространство -->

                <component :is="currentHeaderComponent"/>
            </q-toolbar>
        </q-header>

        <q-drawer
            show-if-above
            v-model="rightDrawerOpen"
            side="right"
            elevated
        >
            <component :is="currentRightDrawerContent"/>
        </q-drawer>

        <q-page-container>
            <router-view v-slot="{ Component }">
                <component
                    :is="Component"
                    @update-footer="handleFooterUpdate"
                    @update-drawer="handleDrawerUpdate"
                    @update-header="handleHeaderUpdate"
                />
            </router-view>
        </q-page-container>

        <q-footer elevated class="bg-grey-8 text-white">
            <component :is="currentFooterComponent"/>
        </q-footer>

    </q-layout>
</template>

<style scoped>

</style>