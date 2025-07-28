<script setup>
import {useYandexStore} from "./store/yandexStore.js";
import {onMounted} from "vue";

const yandexStore = useYandexStore();

onMounted(async () => {
    await yandexStore.initialize();

    // Отправляем событие инициализации
    if (yandexStore.sdk) {
        yandexStore.sendAnalyticsEvent('game_start');
    }
});
</script>
<template>
    <RouterView/>
</template>