<script setup>
import {useGameStore} from "../../store/game.js";
import {useCraftStore} from "../../store/craft.js";
import {computed, ref} from "vue";
import {useBattleStore} from "../../store/battle.js";
import {useRouter} from "vue-router";
import BattleStartDialog from "./BattleStartDialog.vue";

const router = useRouter()

const gameStore = useGameStore()
const options = computed(() => gameStore.currentLocation.options)
const isInDialog = computed(() => !!gameStore.currentDialogNpc)
const battleStore = useBattleStore()

function handleOptionClick(option) {
    if (isInDialog.value) {
        return;
    }

    switch (option.type) {
        case 'start_battle':
            startBattle(option.config)
            break;
        case 'start_craft':
            gameStore.setState('craft')
            gameStore.changeScene('Craft')
            router.push('/game')
            break;
        default:
            gameStore.moveToLocation(option.id)
    }
}

const battleStartDialogOpen = ref(false);

function startBattle(config) {
    // battleStartDialogOpen.value = true
    // console.log(config)
    // return
    battleStore.startBattle(config)
    gameStore.setState('battle')
    gameStore.changeScene('Battle')
    router.push('/game')
}

function handleBattleStart(battleData) {
    console.log('Начало боя с данными:', battleData);
    // Здесь будет логика инициализации боя
    // Например: router.push('/battle') или вызов API
}

</script>

<template>
    <BattleStartDialog v-model="battleStartDialogOpen" @battle-start="handleBattleStart"/>
    <div class="font-oldstandardtt q-px-md q-pt-md text-primary-foreground">Перемещения</div>
    <div class="q-pa-md text-accent-foreground" style="max-width: 350px">
        <q-list bordered separator v-if="options?.length">
            <q-item clickable v-ripple v-for="option in options" :key="option.id"
                    @click="() => handleOptionClick(option)">
                <q-item-section>{{ option.label }}</q-item-section>
                <q-item-label v-if="option.caption" caption>{{ option.caption }}</q-item-label>
            </q-item>
        </q-list>
        <div v-else>а идти некуда...</div>
    </div>
</template>

<style scoped>
</style>