<script setup>
import {useGameStore} from "../../store/game.js";
import {useCraftStore} from "../../store/craft.js";
import {computed} from "vue";


// const locations = [
//     {
//         label: 'Тренировочная комната',
//     },
//     {
//         label: 'Кузница Осколков',
//     },
//     {
//         label: 'Библиотека',
//     },
//     {
//         label: 'Выйти',
//         caption: 'Закрыто'
//     }
// ];

const gameStore = useGameStore()
const locations = computed(() => gameStore.currentLocation.options)
const isInDialog = computed(() => !!gameStore.currentDialogNpc)

</script>

<template>
    <div class="font-oldstandardtt q-px-md q-pt-md text-primary-foreground">Перемещения</div>
    <div class="q-pa-md text-accent-foreground" style="max-width: 350px">
        <q-list bordered separator v-if="locations?.length">
            <q-item clickable v-ripple v-for="location in locations" :key="location.id"
                    @click="!isInDialog && gameStore.moveToLocation(location.id)">
                <q-item-section>{{ location.label }}</q-item-section>
                <q-item-label v-if="location.caption" caption>{{ location.caption }}</q-item-label>
            </q-item>
        </q-list>
        <div v-else>а идти некуда...</div>
    </div>
</template>

<style scoped>
</style>