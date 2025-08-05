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
import BattleOverDialog from "../components/game/BattleOverDialog.vue";
import {useRouter} from 'vue-router';
import BattleCreaturePreview from "../components/game/BattleCreaturePreview.vue";

const router = useRouter();
const game = ref(null);
const phaserContainer = ref(null);
const gameIsInitialized = ref(false);
const emit = defineEmits(['current-active-scene', 'update-footer', 'update-right-drawer', 'update-left-drawer', 'update-header']);

const gameStore = useGameStore();
const globalStore = useGlobalStore();

const safeDestroyGame = () => {
    if (!game.value) return;

    try {
        // 1. Останавливаем все анимации и таймеры
        game.value.events.emit('destroy');

        // 2. Останавливаем игровой цикл
        if (game.value.loop && game.value.loop.running) {
            game.value.loop.stop();
        }

        // 3. Уничтожаем все сцены
        const scenes = game.value.scene.getScenes(true);
        scenes.forEach(scene => {
            if (scene.scene && scene.scene.key) {
                try {
                    scene.scene.stop();
                    scene.scene.destroy();
                } catch (sceneError) {
                    console.warn('Error destroying scene:', sceneError);
                }
            }
        });

        // 4. Уничтожаем рендерер
        if (game.value.renderer) {
            try {
                game.value.renderer.destroy();
            } catch (rendererError) {
                console.warn('Error destroying renderer:', rendererError);
            }
        }

        // 5. Уничтожаем основной экземпляр игры
        try {
            game.value.destroy(true);
        } catch (destroyError) {
            console.warn('Error destroying game:', destroyError);
        }

        // 6. Удаляем canvas вручную
        const container = document.getElementById('game-container');
        if (container) {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                canvas.remove();
            }
        }

        game.value = null;
    } catch (mainError) {
        console.error('Safe destroy error:', mainError);
    } finally {
        gameStore.setGame(null);
        gameStore.setScene(null);
        gameIsInitialized.value = false;
    }
};

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
        safeDestroyGame();

        const container = document.getElementById('game-container');
        if (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        // Создаем новый элемент для игры
        const gameContainer = document.createElement('div');
        gameContainer.id = 'game-canvas-container';
        container.appendChild(gameContainer);

        game.value = StartGame('game-canvas-container');
        gameStore.setGame(game.value);
        gameIsInitialized.value = true;

        phaserContainer.value = container;

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
                    case 'Craft':
                        emit('update-footer', undefined);
                        emit('update-left-drawer', CraftLeftDrawer);
                        emit('update-right-drawer', CraftRightDrawer);
                        emit('update-header', BattleHeader);
                        break;
                    default:
                        emit('update-footer', undefined);
                        emit('update-left-drawer', undefined);
                        emit('update-right-drawer', undefined);
                        emit('update-header', BattleHeader);
                }
                gameStore.setScene(currentScene.scene);
                emit('current-active-scene', currentScene.scene.key);
            } catch (e) {
                console.error('Error in current-scene-ready handler:', e);
            }
        });
    } catch (error) {
        console.error('Game component mount error:', error);
    }
});

// Добавляем обработчик для роутера
router.beforeEach((to, from, next) => {
    if (gameIsInitialized.value) {
        // Отправляем событие для корректного завершения работы
        if (game.value) {
            game.value.events.emit('before-destroy');
        }
        safeDestroyGame();
    }
    next();
});

onUnmounted(() => {
    safeDestroyGame();

    // Очищаем EventBus
    EventBus.off('current-scene-ready');

    // Удаляем обработчики событий
    if (phaserContainer.value) {
        phaserContainer.value.removeEventListener('pointerdown', handlePointerEvent, true);
        phaserContainer.value.removeEventListener('pointerup', handlePointerEvent, true);
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

// Конец битвы
const battleOverData = computed(() => battleStore.battleOverData)
const battleOverOpen = computed(() => battleStore.showBattleOverDialog)
</script>

<template>
    <q-page>
        <BattleOverDialog :battle-data="battleOverData" v-model="battleOverOpen"/>
        <!-- Правый верхний угол -->
        <!-- Подсказка при наведении на противника -->
        <div
            v-if="battleStore.hoverAttackData"
            class="absolute top-4 right-4 pointer-events-none hover-attack-data"
        >
            <div class="p-3 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="hit-chance">🎯 {{ Math.round(battleStore.hoverAttackData.hitChance * 100) }}%</span>
                    <span
                        v-if="battleStore.hoverAttackData.critChance > 0"
                        class="crit-chance"
                    >
                💢 {{ Math.round(battleStore.hoverAttackData.critChance * 100) }}%
            </span>
                </div>

                <div class="damage">
                    💥 {{ battleStore.hoverAttackData.damageFrom }} – {{ battleStore.hoverAttackData.damageTo }}
                </div>
            </div>

            <!-- Лёгкая тень-градиент снизу -->
            <div style="
                height: 8px;
                background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.4));
                pointer-events: none;
            "></div>
        </div>
        <BattleCreaturePreview
            v-if="battleStore.hoveredCreature"
            :creature="battleStore.hoveredCreature"
            additionalClass="left-4"
        />
        <div id="game-container" :class="{ 'block-events': globalStore.dialogVisible }">
            <!-- Canvas будет создан здесь -->
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
    max-height: calc(100vh - 60px);
    background-color: #282C34;
}

/* Добавляем изоляцию для WebGL */
#game-canvas-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    contain: strict;
    isolation: isolate;
}

.block-events {
    pointer-events: none;
}

.hover-attack-data {
    width: 180px;
    @apply bg-background text-foreground;
    background: radial-gradient(ellipse at 20% 50%, rgba(139, 69, 193, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(139, 69, 193, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0b14 0%, #1a1b2e 50%, #16213e 100%);
    background-attachment: fixed;
}

.hover-attack-data .hit-chance {
    color: #f0c860;
}

.hover-attack-data .crit-chance {
    color: #d05050;
}

.hover-attack-data .damage {
    color: #88c080;
    font-weight: bold;
}
</style>