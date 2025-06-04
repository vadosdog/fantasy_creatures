<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {EventBus} from '../game/EventBus.js';
import StartGame from '../game/main.js';
import {useGameStore} from "../store/game.js";
import BattleFooter from "../components/game/BattleFooter.vue";
import BattleDrawer from "../components/game/BattleDrawer.vue";
import BattleHeader from "../components/game/BattleHeader.vue";

// Save the current scene instance
const game = ref();

const emit = defineEmits(['current-active-scene', 'update-footer', 'update-drawer', 'update-header']);

const store = useGameStore()

onMounted(() => {
    game.value = StartGame('game-container');

    EventBus.on('current-scene-ready', (currentScene) => {
        //какая-то гомосятина
        store.setScene(currentScene.scene)
        emit('current-active-scene', 'Battle');
    });

    emit('update-footer', BattleFooter)
    emit('update-drawer', BattleDrawer)
    emit('update-header', BattleHeader)
    
});

onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }
});

defineExpose({game});
</script>
<template>
    
    <div id="game-container"></div>
</template>