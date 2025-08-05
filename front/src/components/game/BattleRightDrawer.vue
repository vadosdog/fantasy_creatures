<script setup>

import CreatureCard from "./CreatureCard.vue";
import {computed, ref, watch} from "vue";
import {useBattleStore} from "../../store/battle.js";
import {useGlobalStore} from "../../store/global.js";
import BattleLog from "./BattleLog.vue";
import BattleQueueVertical from "./BattleQueueVertical.vue";
import {useBattleLogStore} from "../../store/battleLog.js";
import {useGameStore} from "../../store/game.js";

const battleStore = useBattleStore()
const globalStore = useGlobalStore()

const activeCreature = computed(() => battleStore.activeCreature)
const selectedActionId = computed(() => {
    return battleStore.selectedActionId
})


function getActionTypeIcon(action) {
    if (action.range === 0) {
        return '🛡️'
    }

    return {"melee": '🗡️', 'ranged': '🏹', 'treat': '❤'}[action.actionType]
}


function getElementIcon(element) { //TODO унести в какое нибудь единое место
    const elementIcon = {icon: '', color: ''}
    switch (element) {
        case 'fire':
            elementIcon.icon = 'whatshot'
            elementIcon.color = 'red-9'
            break;
        case 'water':
            elementIcon.icon = 'water_drop'
            elementIcon.color = 'blue-10'
            break;
        case 'grass':
            elementIcon.icon = 'grass'
            elementIcon.color = 'green-9'
            break;
    }

    return elementIcon
}


function getEmotionIcon(emotion) {
    switch (emotion) {
        case 'rage':
            return 'shield'
        case 'passion':
            return 'rocket'
        case 'hope':
            return 'emergency'
    }

    return undefined
}

function getShapeIcon(shape) {
    switch (shape) {
        case 'beast':
            return 'pets'
        case 'bird':
            return 'flutter_dash'
        case 'reptile':
            return 'smart_toy'
    }

    return undefined
}

function getActionIcon(action) {
    if (action.element) {
        return getElementIcon(action.element)
    }
    if (action.emotion) {
        return {
            color: 'red',
            icon: getEmotionIcon(action.emotion)
        }
    }
    return {
        color: 'accent',
        icon: getShapeIcon(action.shape)
    }
}

const confirmSkip = ref(false)
const confirmDelay = ref(false)

function openDialog() {
    globalStore.setDialogVisible(true);
}

function closeDialog() {
    globalStore.setDialogVisible(false);
}


const scrollAreaRef = ref(null)
const battleLogStore = useBattleLogStore()
const battleLogLength = computed(() => battleLogStore.battleLog.length)

watch(battleLogLength, (newValue) => {
    try {
        if (!scrollAreaRef.value) return

        const scrollElement = scrollAreaRef.value.getScrollTarget()
        if (!scrollElement) return

        // Вычисляем максимальную позицию скролла
        const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight + 300

        // Прокручиваем с анимацией
        scrollAreaRef.value.setScrollPosition('vertical', maxScroll, 300)
    } catch (error) {
        console.error('Error in scroll area:', error);
    }

});

const gameStore = useGameStore();
const game = gameStore.game

function cameraAction(action) {
    try {
        if (!game) return;

        // Получаем текущую сцену безопасным способом
        const scene = gameStore.scene || (game.scene && game.scene.getScene('Battle'));

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


</script>

<template>
    <!-- Внешний контейнер: занимает всю высоту drawer'а -->
    <div class="battle-drawer-container">
        <!-- Хедер: только под контент -->
        <q-card class="border bg-grey-2 text-primary-foreground" style="flex: none">
            <q-card-section>
                <div class="text-accent-foreground" style="max-width: 350px">
                    <q-list bordered separator>
                        <q-item clickable v-ripple to="world">
                            <q-item-section>Выйти</q-item-section>
                        </q-item>
                    </q-list>
                </div>

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
                            color="#7B68EE"
                            text-color="#C0C0C0"
                            :icon="action.icon"
                            @pointerup="cameraAction(action.fn)"
                            class="control-button"
                        />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- Основной контент: очередь + лог -->
        <div class="main-content">
            <!-- Очередь: 70% -->
            <div class="queue-section">
                <q-toolbar class="full-height bg-grey-9">
                    <BattleQueueVertical class="full-width" />
                </q-toolbar>
            </div>

            <!-- Лог: 30% -->
            <div class="log-section bg-grey-2 text-grey-9">
                <q-scroll-area class="full-height full-width q-pa-md" ref="scrollAreaRef">
                    <BattleLog />
                </q-scroll-area>
            </div>
        </div>
    </div>
</template>

<style scoped>
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

.battle-drawer-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
    overflow: hidden;
}

/* Хедер — только под контент */
.battle-drawer-container > .q-card {
    flex: none;
    z-index: 2;
}

/* Основной контент: занимает всё, что осталось после хедера */
.main-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: 100%;
}

/* Очередь — 70% от оставшегося места */
.queue-section {
    height: 70%;
    min-height: 0;
    overflow: hidden;
    background: #262626;
}

/* Лог — 30% */
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