<script setup>

import CreatureCard from "./CreatureCard.vue";
import {computed, ref} from "vue";
import {useBattleStore} from "../../store/battle.js";
import {useGlobalStore} from "../../store/global.js";
import BattleLog from "./BattleLog.vue";
import BattleQueueVertical from "./BattleQueueVertical.vue";

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

</script>

<template>
    <div style="height: 20vh">
        <QBtn label="back" to="/"/>
    </div>
    <div class="row now-wrap-shadow-1" style="height: 60vh;">

        <q-toolbar class="col-12 bg-grey-9">
            <BattleQueueVertical/>

        </q-toolbar>
    </div>
    <div class="row no-wrap shadow-1" style="height: 20vh;">
        <QToolbar class="col-12 bg-grey-2 text-grey-9">
            <QScrollArea style="height: 100%; width: 100%" ref="scrollAreaRef">
                <BattleLog/>
            </QScrollArea>
        </QToolbar>
    </div>
</template>

<style scoped>

</style>