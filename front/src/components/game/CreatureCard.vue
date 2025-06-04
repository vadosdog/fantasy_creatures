<script setup>
import {computed, onErrorCaptured, ref, watch} from "vue";
import {CreatureAPI} from "../../game/classes/battle/Creature.js";

onErrorCaptured((err) => {
    console.error('Error in CreatureCard:', err)
    return false // предотвращаем дальнейшее всплытие ошибки
})

const props = defineProps({
    creature: {
        type: Object,
        default: {
            name: 'LOH',
            role: 'tank',
            form: 'beast',
            element: 'fire',
            effects: [],
            level: 1
        },
        required: true
    }
})
const maxHealth = computed(() => CreatureAPI.getMaxHealth(props.creature));
const healthProgress = computed(() => props.creature?.health / (maxHealth.value || 1));
const maxPp = computed(() => CreatureAPI.getMaxPP(props.creature));
const ppProgress = computed(() => props.creature?.pp / (maxPp.value || 1));
const currentSpeed = computed(() => CreatureAPI.getSpeed(props.creature));
const healthColor = computed(() => {
    let healthColor = 'positive'
    if (healthProgress.value < 0.3) {
        healthColor = 'negative'
    } else if (healthProgress.value < 0.6) {
        healthColor = 'warning'
    }
    return healthColor
})

const roleIcon = computed(() => {

    switch (props.creature?.role) {
        case 'tank':
            return 'shield'
        case 'dd':
            return 'rocket'
        case 'support':
            return 'emergency'
    }

    return 'favorite'
})

const formIcon = computed(() => {
    switch (props.creature?.form) {
        case 'beast':
            return 'pets'
        case 'bird':
            return 'flutter_dash'
        case 'reptile':
            return 'smart_toy'
    }

    return 'favorite'
})

const elementIcon = computed(() => {
    const elementIcon = {icon: '', color: ''}
    switch (props.creature?.element) {
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
})

function getEffectIcon(effect) {
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

const effectIcons = computed(() => {
    return props.creature?.effects.map(getEffectIcon).slice(0, 6)
})

function compare(a, b) {
    // Если a > b -> возвращаем 1.
    // Если a < b -> возвращаем -1.
    // Если a равно b, то возвращаем 0.
    return (a > b) - (a < b);
}

function statColor(a) {
    return {
        "-1": 'text-negative',
        "1": 'text-positive'
    }[a]
}

const attackStat = computed(() => {
    const value = CreatureAPI.getAttack(props.creature)
    const multiplier = compare(value, props.creature.attackStat)
    return {
        value,
        multiplier,
        color: statColor(multiplier)
    }
})
const defenseStat = computed(() => {
    const value = CreatureAPI.getDefense(props.creature)
    const multiplier = compare(value, props.creature.defenseStat)
    console.log(value, props.creature.defenseStat)
    return {
        value,
        multiplier,
        color: statColor(multiplier)
    }
})
const willStat = computed(() => {
    const value = CreatureAPI.getWill(props.creature)
    const multiplier = compare(value, props.creature.willStat)
    return {
        value,
        multiplier,
        color: statColor(multiplier)
    }
})
const initiativeStat = computed(() => {
    const value = CreatureAPI.getInitiative(props.creature)
    const multiplier = compare(value, props.creature.initiativeStat)
    return {
        value,
        multiplier,
        color: statColor(multiplier)
    }
})

const safeCreature = ref(true)

function getActionIcon(action)
{
    if (action.range === 0) {
        return '🛡️'
    }
    
    return {"melee": '🗡️', 'ranged': '🏹', 'treat': '❤'}[action.actionType]
}


</script>

<template>
    <q-card class="creature-card text-dark" flat bordered v-if="safeCreature">
        <q-card-section horizontal>
            <q-card-actions vertical class="justify-around q-pa-xs">
                <q-btn flat round :color="elementIcon.color" :icon="elementIcon.icon"/>
                <q-btn flat round color="red" :icon="roleIcon"/>
                <q-btn flat round color="accent" :icon="formIcon"/>
                <q-btn flat color="dark">Lvl: {{ creature.level }}</q-btn>
            </q-card-actions>

            <q-img
                class="col"
                src="https://img.league17.ru/pub/mnst/norm/full/502.png"
            />

            <q-card-actions vertical class="justify-around q-pa-xs" v-if="effectIcons.length">
                <q-badge
                    v-for="effect in effectIcons"
                    flat v-text="effect.text"
                    :color="effect.color"
                    outline
                />
            </q-card-actions>
        </q-card-section>
        <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ creature.name }}</div>


            <q-linear-progress size="20px" :value="healthProgress" :color="healthColor" class="q-mt-sm">
                <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="'HP: ' + creature?.health + '/' + maxHealth"/>
                </div>
            </q-linear-progress>
            <q-linear-progress size="15px" :value="ppProgress" color="healthColor" class="q-mt-sm">
                <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="'PP: ' + creature?.pp + '/' + maxPp"/>
                </div>
            </q-linear-progress>
        </q-card-section>
    </q-card>
    <q-card square class="bg-grey-9">
        <q-card-section class="text-center">
            ⚔️ <span :class="attackStat.color">{{ attackStat.value }}</span>
            · 🛡️ <span :class="defenseStat.color">{{ defenseStat.value }}</span>
            · ✨ <span :class="willStat.color">{{ willStat.value }}</span>
            · 💡 <span :class="initiativeStat.color">{{ initiativeStat.value }}</span>
        </q-card-section>
    </q-card>
    <q-card>
        <q-card-section class="row">
            <q-btn
                v-for="action in creature.actions"
                class="col-12 text-teal q-mb-sm"
                no-caps
                align="left"
            >
                <div class="col-12 text-left">{{ getActionIcon(action) }} ️{{ action.name }}</div>
                <div class="col-12 text-left" v-if="action.range > 1">📏 {{ action.range }}</div>
                <div class="col-12 text-left">PP: {{ action.pp }} <span v-if="action.cooldown > 0">CD: {{ action.cooldown }}</span></div>
                <div class="col-12 text-left">🎯 {{ action.hitChance * 100 }}% <span v-if="action.critChance > 0">💢 {{ action.critChance * 100 }}%</span> 💥 {{ action.baseDamage }}</div>
                <div class="col-12 text-left" v-if="action.effects.length">
                    <q-separator />
                    <div v-for="effect in action.effects">
                        {{ getEffectIcon(effect).icon }} {{ effect.effect }} <span v-if="effect.duration > 1">x{{effect.duration}}</span> 🎲 {{ effect.chance * 100 }}%
                    </div>
                </div>
            </q-btn>
            <q-btn class="col-6 text-teal" label="Пропустить"/>
            <q-btn class="col-6 text-teal" label="Защита"/>
        </q-card-section>
    </q-card>
</template>

<style scoped>
</style>