<script setup>
import {computed, onMounted, onUnmounted, ref, watch, watchEffect} from 'vue';
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

function cameraAction(action) {
    try {
        if (!game.value) return;

        // Получаем текущую сцену безопасным способом
        const scene = gameStore.scene || (game.value.scene && game.value.scene.getScene('Battle'));

        if (scene && scene.scene && scene.scene.cameras) {
            // Основной способ отключения ввода
            switch (action) {
                case 'up':
                    scene.scene.cameras.main.scrollY -= 50;
                    break
                case 'down':
                    scene.scene.cameras.main.scrollY += 50;
                    break
                case 'left':
                    scene.scene.cameras.main.scrollX -= 50;
                    break
                case 'right':
                    scene.scene.cameras.main.scrollX += 50;
                    break
                case 'zoomIn':
                    scene.scene.cameras.main.zoom += 0.1;
                    break
                case 'zoomOut':
                    scene.scene.cameras.main.zoom = Math.max(0.1, scene.scene.cameras.main.zoom - 0.1);
                    break
            }
        }
    } catch (error) {
        console.error('Error in dialogVisible watcher:', error);
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
        <!-- UI панель управления -->
        <!-- Мини-панель управления в левом верхнем углу -->
        <div class="absolute-top-left q-ma-md" style="z-index: 10">
            <div class="column q-gutter-xs">
                <!-- Стрелки управления -->
                <div class="row q-gutter-xs">
                    <q-btn
                        flat
                        round
                        size="sm"
                        color="#7B68EE"
                        text-color="#C0C0C0"
                        icon="keyboard_arrow_left"
                        @pointerup="cameraAction('left')"
                        class="control-button"
                    />

                    <q-btn
                        flat
                        round
                        size="sm"
                        color="#7B68EE"
                        text-color="#C0C0C0"
                        icon="keyboard_arrow_right"
                        @pointerup="cameraAction('right')"
                        class="control-button"
                    />

                    <q-btn
                        flat
                        round
                        size="sm"
                        color="#7B68EE"
                        text-color="#C0C0C0"
                        icon="keyboard_arrow_up"
                        @pointerup="cameraAction('up')"
                        class="control-button"
                    />

                    <q-btn
                        flat
                        round
                        size="sm"
                        color="#7B68EE"
                        text-color="#C0C0C0"
                        icon="keyboard_arrow_down"
                        @pointerup="cameraAction('down')"
                        class="control-button"
                    />
                </div>

                <!-- Кнопки зума -->
                <div class="row q-gutter-xs">
                    <q-btn
                        flat
                        round
                        size="sm"
                        color="#7B68EE"
                        text-color="#C0C0C0"
                        icon="add"
                        @pointerup="cameraAction('zoomIn')"
                        class="control-button"
                    />

                    <q-btn
                        flat
                        round
                        size="sm"
                        color="#7B68EE"
                        text-color="#C0C0C0"
                        icon="remove"
                        @pointerup="cameraAction('zoomOut')"
                        class="control-button"
                    />
                </div>
            </div>
        </div>
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
    max-height: calc(100vh - 282px);
    background-color: #282C34;
}

.block-events {
    pointer-events: none;
}

/* Базовые стили кнопок */
.control-button {
    background-color: #7B68EE;
    transition: all 0.2s ease;
}

/* Эффекты при наведении */
.control-button:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(123, 104, 238, 0.4);
}

/* Эффекты при нажатии */
.control-button:active {
    background-color: #D6AFAF !important;
    transform: scale(0.95);
}
</style>