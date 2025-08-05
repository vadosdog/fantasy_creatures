<script setup>
import CreatureCard from "./CreatureCard.vue";
import { computed, ref, watch } from "vue";
import { useBattleStore } from "../../store/battle.js";
import { useGlobalStore } from "../../store/global.js";
import BattleLog from "./BattleLog.vue";
import BattleQueueVertical from "./BattleQueueVertical.vue";
import { useBattleLogStore } from "../../store/battleLog.js";
import { useGameStore } from "../../store/game.js";

// Импортируем хелпер
import {
    getElementIcon,
    getEmotionIcon,
    getShapeIcon
} from "../../game/classes/iconHelper.js";

const battleStore = useBattleStore();
const globalStore = useGlobalStore();

const activeCreature = computed(() => battleStore.activeCreature);
const selectedActionId = computed(() => battleStore.selectedActionId);

// Тип действия — эмодзи, не меняем
function getActionTypeIcon(action) {
    if (action.range === 0) {
        return '🛡️';
    }
    return { melee: '🗡️', ranged: '🏹', treat: '❤' }[action.actionType];
}

// Убираем дублирующие функции — используем хелпер
function getActionIcon(action) {
    if (action.element) {
        const src = getElementIcon(action.element);
        return src ? { type: 'element', src, color: 'primary' } : null;
    }
    if (action.emotion) {
        const src = getEmotionIcon(action.emotion);
        return src ? { type: 'emotion', src, color: 'red-9' } : null;
    }
    if (action.shape) {
        const src = getShapeIcon(action.shape);
        return src ? { type: 'shape', src, color: 'accent' } : null;
    }
    return null;
}

const confirmSkip = ref(false);
const confirmDelay = ref(false);

function openDialog() {
    globalStore.setDialogVisible(true);
}

function closeDialog() {
    globalStore.setDialogVisible(false);
}

// Ссылка на scroll area для автопрокрутки лога
const scrollAreaRef = ref(null);
const battleLogStore = useBattleLogStore();
const battleLogLength = computed(() => battleLogStore.battleLog.length);

watch(battleLogLength, (newValue) => {
    try {
        if (!scrollAreaRef.value) return;

        const scrollElement = scrollAreaRef.value.getScrollTarget();
        if (!scrollElement) return;

        const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight + 300;
        scrollAreaRef.value.setScrollPosition('vertical', maxScroll, 300);
    } catch (error) {
        console.error('Error in scroll area:', error);
    }
});

const gameStore = useGameStore();
const game = computed(() => gameStore.game);

function cameraAction(action) {
    try {
        if (!game.value) return;

        const scene = gameStore.scene || (game.value.scene && game.value.scene.getScene('Battle'));
        if (scene && scene.scene && scene.scene.cameras) {
            const camera = scene.scene.cameras.main;

            switch (action) {
                case 'up':
                    camera.scrollY -= 50;
                    break;
                case 'down':
                    camera.scrollY += 50;
                    break;
                case 'left':
                    camera.scrollX -= 50;
                    break;
                case 'right':
                    camera.scrollX += 50;
                    break;
                case 'zoomIn':
                    camera.zoom += 0.1;
                    break;
                case 'zoomOut':
                    camera.zoom = Math.max(0.1, camera.zoom - 0.1);
                    break;
            }
        }
    } catch (error) {
        console.error('Error in cameraAction:', error);
    }
}
</script>

<template>
    <div class="battle-drawer-container">
        <!-- Хедер -->
        <q-card class="border bg-grey-2 text-primary-foreground" style="flex: none">
            <q-card-section>
                <div style="max-width: 350px">
                    <q-list bordered separator>
                        <q-item clickable v-ripple to="world">
                            <q-item-section>Выйти</q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Кнопки управления камерой -->
                <div class="q-mt-md">
                    <div class="row q-gutter-xs">
                        <q-btn
                            v-for="(action, i) in [
                { icon: 'add', fn: 'zoomIn' },
                { icon: 'remove', fn: 'zoomOut' },
                { icon: 'keyboard_arrow_left', fn: 'left' },
                { icon: 'keyboard_arrow_right', fn: 'right' },
                { icon: 'keyboard_arrow_up', fn: 'up' },
                { icon: 'keyboard_arrow_down', fn: 'down' }
              ]"
                            :key="i"
                            flat
                            round
                            size="sm"
                            color="indigo"
                            text-color="white"
                            :icon="action.icon"
                            @pointerup="cameraAction(action.fn)"
                            class="control-button"
                        />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- Основной контент -->
        <div class="main-content">
            <!-- Очередь -->
            <div class="queue-section">
                <q-toolbar class="full-height bg-grey-9">
                    <BattleQueueVertical class="full-width" />
                </q-toolbar>
            </div>

            <!-- Лог боя -->
            <div class="log-section bg-grey-2 text-grey-9">
                <q-scroll-area class="full-height full-width q-pa-md" ref="scrollAreaRef">
                    <BattleLog />
                </q-scroll-area>
            </div>
        </div>
    </div>
</template>

<style scoped>
.battle-drawer-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
    overflow: hidden;
}

.battle-drawer-container > .q-card {
    flex: none;
    z-index: 2;
}

.main-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: 100%;
}

.queue-section {
    height: 70%;
    min-height: 0;
    overflow: hidden;
    background: #262626;
}

.log-section {
    height: 30%;
    min-height: 0;
    overflow: hidden;
    background: #f5f5f5;
    border-top: 1px solid #ddd;
}

/* Кнопки управления */
.control-button {
    background-color: #7B68EE;
    transition: all 0.2s ease;
}

.control-button:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(123, 104, 238, 0.4);
}

.control-button:active {
    background-color: #D6AFAF !important;
    transform: scale(0.95);
}
</style>