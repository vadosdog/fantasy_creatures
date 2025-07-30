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
            emotion: 'rage',
            shape: 'beast',
            element: 'fire',
            effects: [],
            level: 1
        },
        required: true
    },
    showHealth: true,
    statsVerbose: false,
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

function getElementIcon(element) {
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
const emotionIcon = computed(() => {
    return getEmotionIcon(props.creature?.emotion) || 'favorite'
})
const shapeIcon = computed(() => {
    return getShapeIcon(props.creature?.shape) || 'favorite'
})
const elementIcon = computed(() => {
    return getElementIcon(props.creature?.element)
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
    if (!props.creature?.effects) {
        return []
    }
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

const src = './assets/creatures/basic/' + (props.creature.number || props.creature.texture) + '.png'


</script>

<template>
    <q-card class="creature-card text-dark" flat bordered v-if="safeCreature">
        <q-card-section horizontal>
            <q-card-actions vertical class="justify-around q-pa-xs">
                <q-btn flat round :color="elementIcon.color" :icon="elementIcon.icon"/>
                <q-btn flat round color="red" :icon="emotionIcon"/>
                <q-btn flat round color="accent" :icon="shapeIcon"/>
                <q-btn flat color="dark">Ур: {{ creature.level }}</q-btn>
            </q-card-actions>
            <q-img
                :src="src"
                :alt="creature.name"
                class="col"
                :class="{mirror: creature.direction === 'left'}"
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
            <div class="text-h5 q-mt-sm q-mb-xs text-primary-foreground">{{ creature.name }}</div>


            <q-linear-progress size="20px" :value="healthProgress" :color="healthColor" class="q-mt-sm" v-if="showHealth">
                <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="'HP: ' + creature?.health + '/' + maxHealth"/>
                </div>
            </q-linear-progress>
            <q-linear-progress size="15px" :value="ppProgress" color="accent" class="q-mt-sm" v-if="showHealth">
                <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="'PP: ' + creature?.pp + '/' + maxPp"/>
                </div>
            </q-linear-progress>
        </q-card-section>
    </q-card>
    <q-card square class="bg-grey-9">
        <q-list bordered dense v-if="statsVerbose" class="q-mt-sm">
            <q-item>
                <q-item-section>Здоровье</q-item-section>
                <q-item-section side>{{ creature.maxHealthStat }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>Атака</q-item-section>
                <q-item-section side>{{ attackStat.value }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>Защита</q-item-section>
                <q-item-section side>{{ defenseStat.value }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>Воля</q-item-section>
                <q-item-section side>{{ willStat.value }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>Инициатива</q-item-section>
                <q-item-section side>{{ initiativeStat.value }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>Скорость</q-item-section>
                <q-item-section side>{{ creature.speedStat }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>PP</q-item-section>
                <q-item-section side>{{ creature.maxPP }}</q-item-section>
            </q-item>
            <q-item>
                <q-item-section>Регенерация PP</q-item-section>
                <q-item-section side>{{ creature.ppRegen }}</q-item-section>
            </q-item>
        </q-list>
        <q-card-section class="text-center" v-else>
            ⚔️ <span :class="attackStat.color">{{ attackStat.value }}</span>
            · 🛡️ <span :class="defenseStat.color">{{ defenseStat.value }}</span>
            · ✨ <span :class="willStat.color">{{ willStat.value }}</span>
            · 💡 <span :class="initiativeStat.color">{{ initiativeStat.value }}</span>
        </q-card-section>
    </q-card>
</template>

<style scoped>
.mirror {
    transform: scaleX(-1);
}
</style>