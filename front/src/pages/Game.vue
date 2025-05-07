<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {EventBus} from '../game/EventBus.js';
import StartGame from '../game/main.js';
import {useGameStore} from "../store/game.js";

// Save the current scene instance
const game = ref();

const emit = defineEmits(['current-active-scene']);

const store = useGameStore()

onMounted(() => {
    game.value = StartGame('game-container');

    EventBus.on('current-scene-ready', (currentScene) => {
        //какая-то гомосятина
        store.setScene(currentScene.scene)
        emit('current-active-scene', 'Battle');
    });

    
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