<script setup>
import {useYandexStore} from "./store/yandexStore.js";
import {onMounted} from "vue";
import {useGameStore} from "./store/game.js";

const yandexStore = useYandexStore();
const gameStore = useGameStore()

onMounted(async () => {
    await yandexStore.initialize();

    // Отправляем событие инициализации
    if (yandexStore.sdk) {
        yandexStore.sendAnalyticsEvent('game_start');
    }

    await gameStore.initialize()
});
</script>
<template>
    <RouterView/>
</template>