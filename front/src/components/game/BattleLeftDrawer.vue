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


function getRoleIcon(role) {
    switch (role) {
        case 'tank':
            return 'shield'
        case 'dd':
            return 'rocket'
        case 'support':
            return 'emergency'
    }

    return undefined
}

function getFormIcon(form) {
    switch (form) {
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
    if (action.role) {
        return {
            color: 'red',
            icon: getRoleIcon(action.role)
        }
    }
    return {
        color: 'accent',
        icon: getFormIcon(action.form)
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
    <!-- Header Card -->
    <q-card class="border bg-grey-2 text-primary-foreground" style="height: 20vh">
        <q-card-section>
            <QBtn label="Сдаться" to="/"/>
            <div class="q-mt-md" style="z-index: 10">
                <div class="column q-gutter-xs">
                    <!-- Стрелки управления -->
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
                </div>
            </div>
        </q-card-section>
    </q-card>
    <div class="row now-wrap-shadow-1" style="height: 50vh;">

        <q-toolbar class="col-12 bg-grey-9">
            <BattleQueueVertical/>

        </q-toolbar>
    </div>
    <div class="row no-wrap shadow-1" style="height: 30vh;">
        <QScrollArea class="col-12 bg-grey-2 text-grey-9 q-pa-md"
                     style="height: 100%; width: 100%"
                     ref="scrollAreaRef"
        >
            <BattleLog/>
        </QScrollArea>
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
</style>