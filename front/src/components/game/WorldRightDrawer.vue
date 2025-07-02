<script setup>
import {useGameStore} from "../../store/game.js";
import {useCraftStore} from "../../store/craft.js";
import {computed} from "vue";


const gameStore = useGameStore()
const npcs = computed(() => gameStore.currentLocation.npcs)
const isInDialog = computed(() => !!gameStore.currentDialogNpc)

const dialog = false;
// {
//     name: 'Драгомир',
//     phrase: 'anime character, Vinland Saga style, dark fantasy mentor:: \n' +
//         '50s, Askeladd’s physique — broad shoulders, battle-worn. Long grey hair (high ponytail), short beard with braids. Fiery coral scar from temple to jaw. \n' +
//         'Clothing: Navy tunic with Slavic white embroidery, tattered cloak, no armor. \n' +
//         'Pose: Leaning on runic staff, pipe in mouth (electric blue smoke). \n' +
//         'Eyes: Steel grey, weary but piercing — Witcher’s Vesemir gaze. \n' +
//         'Style: Wit Studio, dramatic shadows --v 6',
//     options: [
//         {
//             label: 'anime character, Vinland Saga style, dark fantasy mentor:: 50s, Askeladd’s physique', type: 'phrase'
//         },
//     ],
//     image: '/assets/npcs/dragomir_transperent.png'
// }
</script>

<template>
    <div class="font-oldstandardtt q-px-md q-pt-md text-primary-foreground">Персонажи</div>
    <div class="q-pa-md text-accent-foreground" style="max-width: 350px">
        <q-list bordered separator v-if="npcs?.length">
            <q-item clickable v-ripple v-for="npc in npcs" @click="gameStore.startDialog(npc.id, npc.startDialogNode)">
                <q-item-section>{{ npc.label }}</q-item-section>
                <q-item-label v-if="npc.caption" caption>{{ npc.caption }}</q-item-label>
            </q-item>
            <q-item v-if="isInDialog" clickable v-ripple @click="gameStore.endDialog()">
                <q-item-section avatar>
                    <q-icon name="logout"/>
                </q-item-section>
                <q-item-section>Закончить диалог</q-item-section>
            </q-item>
        </q-list>
        <div v-else>тут никого нет...</div>
    </div>
</template>

<style scoped>
</style>