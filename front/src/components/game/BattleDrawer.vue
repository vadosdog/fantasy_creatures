<script setup>

import CreatureCard from "./CreatureCard.vue";
import {computed, ref} from "vue";
import {useBattleStore} from "../../store/battle.js";
import {useGlobalStore} from "../../store/global.js";

const battleStore = useBattleStore()
const globalStore = useGlobalStore()

const activeCreature = computed(() => battleStore.activeCreature)
const selectedActionId = computed(() => {
    return battleStore.selectedActionId
})

function getEffectIcon(effect) { //TODO унести в какое нибудь единое место
    const icon = {
        // Бафы
        'empower': '💪',
        'haste': '⚡',
        'luck': '🍀',
        'regen': '💚',
        'thorns': '🌵',
        'aegis': '🛡️',
        'defense': '🛡️', // можно какой-то другой

        // Дебафы
        'poison': '☠️',
        'bleed': '💉',
        'burn': '🔥',
        'freeze': '🥶',
        'chill': '❄️',
        'blind': '👁️‍🗨️',
        'curse': '📛',
        'madness': '🤪',
        'fear': '😱',
        'confusion': '😖' // нужно какой-то другой
    }[effect.effect] || ''
    const text = icon + ' ' + effect.duration

    let color = 'negative'
    if (
        // Бафы
        ['empower',
            'haste',
            'luck',
            'regen',
            'thorns',
            'aegis',
            'defense',].some(e => e === effect.effect)) {
        color = 'positive'
    }
    return {...effect, text, icon, color}
}


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
    <q-dialog v-model="confirmSkip" persistent class="text-dark" @show="openDialog" @hide="closeDialog">
        <q-card>
            <q-card-section class="row items-center">
                <q-avatar icon="shield" color="primary" text-color="white"/>
                <span class="q-ml-sm">Вы уверены, что хотите принять защитную стойку?</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Сражаться!" color="" v-close-popup/>
                <q-btn flat label="Защищаться!" color="primary" v-close-popup
                       @click="() => battleStore.selectAction('skip')"
                       icon="shield"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDelay" persistent class="text-dark" @show="openDialog" @hide="closeDialog">
        <q-card>
            <q-card-section class="row items-center">
                <q-avatar icon="shield" color="primary" text-color="white"/>
                <span class="q-ml-sm">Пока недоступно. Иди сражайся!</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Сражаться!" color="" v-close-popup/>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-card class="bg-blue-1 text-blue-9 q-mb-md">
        <q-card-section>
            <div class="text-h6">Ваш ход</div>
        </q-card-section>
    </q-card>
    <CreatureCard
        v-if="activeCreature && activeCreature.id"
        :creature="activeCreature"
        :key="activeCreature.id"
    />
    <q-card v-if="activeCreature && activeCreature.id">
        <q-card-section class="row">
            <q-btn
                v-for="action in activeCreature.actions"
                class="col-12 text-teal q-mb-sm"
                :class="{
                    'text-teal': selectedActionId !== action.id,
                    'text-grey-1': selectedActionId === action.id,
                }"
                :color="selectedActionId === action.id ? 'teal' : undefined"
                no-caps
                align="left"
                :disable="action.currentCooldown > 0 || action.pp > activeCreature.pp"
                @click="() => battleStore.selectAction(action.id)"
            >
                <q-knob
                    show-value
                    font-size="5px"
                    class="text-light-blue q-ma-xs absolute-right"
                    :model-value="action.cooldown - action.currentCooldown"
                    :max="action.cooldown"
                    :thickness="0.25"
                    color="light-blue"
                    track-color="grey-3"
                    size="md"
                >
                    <q-icon flat round :color="getActionIcon(action).color" :name="getActionIcon(action).icon"
                            size="sm"/>
                </q-knob>
                <div class="col-12 text-left">{{ getActionTypeIcon(action) }} ️{{ action.name }}</div>
                <div class="col-12 text-left" v-if="action.range > 1">📏 {{ action.range }}</div>
                <div class="col-12 text-left">
                    <span
                        :class="{'text-negative': action.pp > activeCreature.pp}"
                    >
                        PP: {{ action.pp }}
                    </span>
                    <span
                        v-if="action.cooldown > 0"
                        :class="{'text-negative': action.currentCooldown > 0}"
                    >
                        CD: {{ action.currentCooldown }} / {{ action.cooldown }}
                    </span>
                </div>
                <div class="col-12 text-left">🎯 {{ action.hitChance * 100 }}% <span
                    v-if="action.critChance > 0">💢 {{ action.critChance * 100 }}%</span> 💥 {{ action.baseDamage }}
                </div>
                <div class="col-12 text-left" v-if="action.effects.length">
                    <q-separator/>
                    <div v-for="effect in action.effects">
                        {{ getEffectIcon(effect).icon }} {{ effect.effect }} <span
                        v-if="effect.duration > 1">x{{ effect.duration }}</span> 🎲 {{ effect.chance * 100 }}%
                    </div>
                </div>
            </q-btn>
            <q-btn class="col-6 text-teal" icon="fast_forward" label="Отложить" @click="confirmDelay = true "/>
            <q-btn class="col-6 text-teal" icon="shield" label="Защита" @click="confirmSkip = true "/>
        </q-card-section>
    </q-card>
</template>

<style scoped>

</style>