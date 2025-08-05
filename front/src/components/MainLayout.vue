<script setup>
import {ref, toRaw, shallowRef} from "vue";
import {useGameStore} from "../store/game.js";
import DefaultFooter from './layout/DefaultFooter.vue';
import DefaultHeader from './layout/DefaultHeader.vue';


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const currentLeftDrawerContent = shallowRef(null)
const currentRightDrawerContent = shallowRef(null)
const currentFooterComponent = shallowRef(DefaultFooter)
const currentHeaderComponent = shallowRef(null)

const handleFooterUpdate = (component) => {
    currentFooterComponent.value = component || DefaultFooter
}

const handleHeaderUpdate = (component) => {
    currentHeaderComponent.value = component
}

const handleRightDrawerUpdate = (component) => {
    rightDrawerOpen.value = !!component
    currentRightDrawerContent.value = component
}
const handleLeftDrawerUpdate = (component) => {
    leftDrawerOpen.value = !!component
    currentLeftDrawerContent.value = component
}

const toggleRightDrawer = () => {
    rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
<template>
    <q-layout view="hHh LpR lFr">

        <q-header elevated class="bg-primary text-white border-b border-solid border-primary/20" :height-hint="60">
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
                    to="/world"
                />
                <component :is="currentHeaderComponent"/>
            </q-toolbar>
        </q-header>

        <q-drawer
            show-if-above
            v-model="leftDrawerOpen"
            side="left"
            elevated
            :width="300"
        >
            <component :is="currentLeftDrawerContent"/>
        </q-drawer>
        <q-drawer
            show-if-above
            v-model="rightDrawerOpen"
            side="right"
            elevated
            :width="300"
        >
            <component :is="currentRightDrawerContent"/>
        </q-drawer>

<!--        <q-footer elevated class="bg-transparent text-white">-->
<!--            <component :is="currentFooterComponent"/>-->
<!--        </q-footer>-->

        <q-page-container class="font-scada game-layout-container">
            <router-view v-slot="{ Component }">
                <component
                    :is="Component"
                    @update-footer="handleFooterUpdate"
                    @update-right-drawer="handleRightDrawerUpdate"
                    @update-left-drawer="handleLeftDrawerUpdate"
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
    min-height: 60px;
}

.game-layout-container {
    overflow: hidden;
}
</style>