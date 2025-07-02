<script setup>
import {computed, onMounted, onUnmounted, ref, watch, watchEffect} from 'vue';
import {EventBus} from '../game/EventBus.js';
import StartGame from '../game/main.js';
import {useGameStore} from "../store/game.js";
import BattleFooter from "../components/game/BattleFooter.vue";
import BattleHeader from "../components/game/BattleHeader.vue";
import {useGlobalStore} from "../store/global.js";
import {useBattleStore} from "../store/battle.js";
import BattleRightDrawer from "../components/game/BattleRightDrawer.vue";
import BattleLeftDrawer from "../components/game/BattleLeftDrawer.vue";
import CraftLeftDrawer from "../components/game/CraftLeftDrawer.vue";
import CraftRightDrawer from "../components/game/CraftRightDrawer.vue";

const game = ref(null);
const phaserContainer = ref(null);
const emit = defineEmits(['current-active-scene', 'update-footer', 'update-right-drawer', 'update-left-drawer', 'update-header']);

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
        gameStore.setGame(game)
        phaserContainer.value = document.getElementById('game-container');

        // Добавляем глобальный обработчик событий
        if (phaserContainer.value) {
            phaserContainer.value.addEventListener('pointerdown', handlePointerEvent, true);
            phaserContainer.value.addEventListener('pointerup', handlePointerEvent, true);
        }

        EventBus.on('current-scene-ready', (currentScene) => {
            try {
                switch (currentScene.scene.key) {
                    case 'Battle':
                        emit('update-footer', BattleFooter);
                        emit('update-left-drawer', BattleLeftDrawer);
                        emit('update-right-drawer', BattleRightDrawer);
                        emit('update-header', BattleHeader);
                        break
                    default:
                        emit('update-footer', undefined);
                        emit('update-left-drawer', CraftLeftDrawer);
                        emit('update-right-drawer', CraftRightDrawer);
                        emit('update-header', BattleHeader);
                }
                gameStore.setScene(currentScene.scene);
                emit('current-active-scene', 'Battle');
            } catch (e) {
                console.error('Error in current-scene-ready handler:', e);
            }
        });
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
        gameStore.setGame(null)
        gameStore.setScene(null)

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

// В основном Vue приложении или отдельном файле
watchEffect(() => {
    if (gameStore.tooltip.show) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.style.cssText = `
      position: absolute;
      background: #333;
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 10000;
      top: ${gameStore.tooltip.position.y + 20}px;
      left: ${gameStore.tooltip.position.x + 20}px;
    `;
        tooltip.textContent = gameStore.tooltip.text;
        document.body.appendChild(tooltip);

        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
        }, 3000);
    }
});
</script>

<template>
    <q-page>
        <div id="game-container" :class="{ 'block-events': globalStore.dialogVisible }"></div>
    </q-page>
</template>

<style scoped>
#game-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    max-height: 100vh;
}

#game-container {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 60px);
    background-color: #282C34;
}

.block-events {
    pointer-events: none;
}
</style>