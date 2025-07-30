<script setup>
import {computed, onMounted} from "vue";
import WorldLeftDrawer from "../components/game/WorldLeftDrawer.vue";
import WorldRightDrawer from "../components/game/WorldRightDrawer.vue";
import {useGameStore} from "../store/game.js";

const emit = defineEmits(['current-active-scene', 'update-footer', 'update-left-drawer', 'update-right-drawer', 'update-header']);

onMounted(() => {
    emit('update-footer', null)
    emit('update-header', null)
    emit('update-left-drawer', WorldLeftDrawer)
    emit('update-right-drawer', WorldRightDrawer)

});

// const dialog = {
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


const gameStore = useGameStore()
const locationName = computed(() => gameStore.currentLocation.name)
const locationImage = computed(() => gameStore.currentLocation.image)
const locationDescription = computed(() => gameStore.currentLocation.description)
const dialog = computed(() => gameStore.currentDialog)

</script>
<template>
    <q-page>
        <q-img :src="locationImage"
               fit="cover">
            <img :src="dialog.image" v-if="dialog" class="absolute-top-right" style="height: 100%"/>
            <div class="absolute-bottom text-subtitle1 text-center">
                <div>
                    {{ dialog ? dialog.phrase : locationDescription }}
                </div>
                <div v-if="dialog">
                    <q-btn
                        v-for="option in dialog.options"
                        size="md" outline no-caps
                        class="font-neucha text-sx border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 q-ma-sm"
                        :class="{
                            'font-neucha': option.type === 'phrase',
                            'font-scada': option.type !== 'phrase',
                        }"
                        @click="gameStore.selectDialogOption(option)"
                    >
                        <q-icon v-if="option.icon" :name="option.icon" class="mr-2"/>
                        {{ option.label }}
                    </q-btn>
                </div>
            </div>
        </q-img>
        <div class="location-name">
            {{ dialog ? dialog.name : locationName }}
        </div>
    </q-page>

</template>
<style scoped>
.location-name {
    @apply absolute;
    @apply bg-primary;
    @apply font-oldstandardtt;
    @apply text-primary-foreground;

    font-size: 20px;
    border-radius: 4px;
    padding: 2px 16px;
    top: 16px;
    left: 16px;
}
</style>