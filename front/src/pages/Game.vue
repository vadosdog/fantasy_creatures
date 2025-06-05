<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {EventBus} from '../game/EventBus.js';
import StartGame from '../game/main.js';
import {useGameStore} from "../store/game.js";
import BattleFooter from "../components/game/BattleFooter.vue";
import BattleDrawer from "../components/game/BattleDrawer.vue";
import BattleHeader from "../components/game/BattleHeader.vue";
import {useGlobalStore} from "../store/global.js";
import {useBattleStore} from "../store/battle.js";

const game = ref(null);
const phaserContainer = ref(null);
const emit = defineEmits(['current-active-scene', 'update-footer', 'update-drawer', 'update-header']);

const gameStore = useGameStore();
const globalStore = useGlobalStore();

// Защищённый watcher с обработкой ошибок
watch(() => globalStore.dialogVisible, (newVal) => {
    try {
        if (!game.value) return;

        // Получаем текущую сцену безопасным способом
        const scene = gameStore.scene || (game.value.scene && game.value.scene.getScene('Battle'));

        if (scene && scene.systems && scene.systems.input) {
            // Основной способ отключения ввода
            scene.systems.input.enabled = !newVal;

            // Дополнительная защита для Phaser 3.50+
            if (scene.systems.input.mouse) {
                if (newVal) {
                    scene.systems.input.mouse.enabled = false
                } else {
                    scene.systems.input.mouse.enabled = true
                }
            }

            if (scene.systems.input.touch) {
                if (newVal) scene.systems.input.touch.disable();
                else scene.systems.input.touch.enable();
            }

            // Для Phaser 3.60+
            if (scene.systems.input.keyboard) {
                scene.systems.input.keyboard.enabled = !newVal;
            }
        }
    } catch (error) {
        console.error('Error in dialogVisible watcher:', error);
    }
}, {immediate: true});

const battleStore = useBattleStore()

const activeAction = computed(() => battleStore.selectedActionId)


watch(activeAction, (newValue) => {
    try {
        if (!game.value) return;

        // Получаем текущую сцену безопасным способом
        const scene = (game.value.scene && game.value.scene.getScene('Battle'));

        if (scene) {
            scene.selectActionOutside(newValue)
        }
    } catch (error) {
        console.error('Error in dialogVisible watcher:', error);
    }

}, {immediate: true});

onMounted(() => {
    try {
        game.value = StartGame('game-container');
        phaserContainer.value = document.getElementById('game-container');

        // Добавляем глобальный обработчик событий
        if (phaserContainer.value) {
            phaserContainer.value.addEventListener('pointerdown', handlePointerEvent, true);
            phaserContainer.value.addEventListener('pointerup', handlePointerEvent, true);
        }

        EventBus.on('current-scene-ready', (currentScene) => {
            try {
                gameStore.setScene(currentScene.scene);
                emit('current-active-scene', 'Battle');
            } catch (e) {
                console.error('Error in current-scene-ready handler:', e);
            }
        });

        emit('update-footer', BattleFooter);
        emit('update-drawer', BattleDrawer);
        emit('update-header', BattleHeader);

    } catch (error) {
        console.error('Game component mount error:', error);
    }
});

onUnmounted(() => {
    try {
        if (game.value) {
            game.value.destroy(true);
            game.value = null;
        }

        if (phaserContainer.value) {
            phaserContainer.value.removeEventListener('pointerdown', handlePointerEvent, true);
            phaserContainer.value.removeEventListener('pointerup', handlePointerEvent, true);
        }

        EventBus.off('current-scene-ready');
    } catch (error) {
        console.error('Game component unmount error:', error);
    }
});

// Универсальный обработчик событий указателя
function handlePointerEvent(event) {
    if (globalStore.dialogVisible) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
    }
}

defineExpose({game});
</script>

<template>
    <div id="game-container" :class="{ 'block-events': globalStore.dialogVisible }"></div>
</template>

<style scoped>
.block-events {
    pointer-events: none;
    position: relative;
}

.block-events::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: transparent;
}
</style>