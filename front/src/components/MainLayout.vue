<script setup>
import {ref, toRaw, shallowRef} from "vue";
import {useGameStore} from "../store/game.js";
import DefaultFooter from './layout/DefaultFooter.vue';
import DefaultHeader from './layout/DefaultHeader.vue';


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
    <q-layout view="hHh LpR fFr">

        <q-header elevated class="bg-primary text-white border-b border-solid border-primary/20" :height-hint="50">
            <q-toolbar>
                <DefaultHeader/>

                <!-- Кнопки справа -->
                <q-space/> <!-- Заполняет доступное пространство -->

                <QBtn
                    v-if="!currentHeaderComponent"
                    class="rounded mystical-glow hover:scale-105 transition-all duration-300"
                      no-caps
                      icon="play_arrow"
                      color="primary"
                      text-color="primary-foreground"
                      label="Play Now"
                      to="/game"
                />
                <component :is="currentHeaderComponent"/>
            </q-toolbar>
        </q-header>

        <q-drawer
            show-if-above
            v-model="rightDrawerOpen"
            side="right"
            elevated
            :width="300"
        >
            <component :is="currentRightDrawerContent"/>
        </q-drawer>

        <q-footer elevated class="bg-transparent text-white">
            <component :is="currentFooterComponent"/>
        </q-footer>

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

    </q-layout>
</template>

<style scoped>
/* Убираем стандартный фон Quasar для header */
.q-header {
    background: transparent !important;
}
</style>