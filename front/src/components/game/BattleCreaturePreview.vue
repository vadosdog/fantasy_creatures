<script setup>
import { computed } from 'vue';
import { CreatureAPI } from '../../game/classes/battle/Creature.js';

// Импортируем хелперы
import {
    getElementIcon as getElementIconPath,
    getEmotionIcon as getEmotionIconPath,
    getShapeIcon as getShapeIconPath
} from "../../game/classes/iconHelper.js";
import EffectSpan from "./EffectSpan.vue";

// --- Props ---
const props = defineProps({
    creature: {
        type: Object,
        default: null,
    },
    additionalClass: {
        type: String,
        default: '',
    },
});

// --- Вычисляемые свойства ---
const maxHealth = computed(() => (props.creature ? CreatureAPI.getMaxHealth(props.creature) : 1));
const healthProgress = computed(() => (props.creature?.health || 0) / maxHealth.value);
const healthColor = computed(() => {
    if (healthProgress.value < 0.3) return 'red-9';
    if (healthProgress.value < 0.6) return 'orange-8';
    return 'green-8';
});

function statColor(a, b) {
    const c = (a > b) - (a < b);
    return { "-1": 'text-negative', "1": 'text-positive' }[c] || '';
}

// Статы
const attackStat = computed(() => {
    if (!props.creature) return { value: 1, color: '' };
    const value = CreatureAPI.getAttack(props.creature);
    return { value, color: statColor(value, props.creature?.attackStat) };
});

const defenseStat = computed(() => {
    if (!props.creature) return { value: 1, color: '' };
    const value = CreatureAPI.getDefense(props.creature);
    return { value, color: statColor(value, props.creature?.defenseStat) };
});

const willStat = computed(() => {
    if (!props.creature) return { value: 1, color: '' };
    const value = CreatureAPI.getWill(props.creature);
    return { value, color: statColor(value, props.creature?.willStat) };
});

const initiativeStat = computed(() => {
    if (!props.creature) return { value: 1, color: '' };
    const value = CreatureAPI.getInitiative(props.creature);
    return { value, color: statColor(value, props.creature?.initiativeStat) };
});

// --- Иконки через хелпер ---
const emotionIcon = computed(() => getEmotionIconPath(props.creature?.emotion));
const shapeIcon = computed(() => getShapeIconPath(props.creature?.shape));
const elementIcon = computed(() => getElementIconPath(props.creature?.element));

// --- Эффекты (остаётся без изменений, только эмодзи) ---
const effectIcons = computed(() => {
    if (!props.creature?.effects) return [];
    return props.creature.effects.map(effect => {
        const icons = {
            empower: '💪', haste: '⚡', luck: '🍀', regen: '💚', thorns: '🌵', aegis: '🛡️', defense: '🛡️',
            poison: '☠️', bleed: '💉', burn: '🔥', freeze: '🥶', chill: '❄️',
            blind: '👁️‍🗨️', curse: '📛', madness: '🤪', fear: '😱', confusion: '😖'
        };
        const icon = icons[effect.effect] || '❓';
        const text = `${icon} ${effect.duration}`;
        const color = ['empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense'].includes(effect.effect)
            ? 'positive'
            : 'negative';
        return { ...effect, text, icon, color };
    });
});
</script>

<template>
    <div
        v-if="creature"
        class="absolute top-4 left-4 pointer-events-none main-block"
        :class="additionalClass"
        style="z-index: 1000"
    >
        <!-- Основной контейнер -->
        <div class="p-3 space-y-2">
            <!-- Имя и иконки -->
            <div class="flex items-center justify-between text-sm">
                <strong class="text-white q-pr-sm">{{ creature.name }}</strong>
                <div class="flex items-center space-x-1">
                    <!-- Элемент (PNG) -->
                    <q-img
                        v-if="elementIcon"
                        :src="elementIcon"
                        :style="{ width: '16px', height: '16px' }"
                        class="q-mr-xs"
                    />

                    <!-- Эмоция (PNG) -->
                    <q-img
                        v-if="emotionIcon"
                        :src="emotionIcon"
                        :style="{ width: '16px', height: '16px' }"
                        class="q-mr-xs"
                    />

                    <!-- Форма (PNG) -->
                    <q-img
                        v-if="shapeIcon"
                        :src="shapeIcon"
                        :style="{ width: '16px', height: '16px' }"
                        class="q-mr-xs"
                    />

                    <!-- Уровень -->
                    <q-badge class="q-ml-md" color="grey">Ур. {{ creature.level }}</q-badge>
                </div>
            </div>

            <!-- Полоса здоровья -->
            <div>
                <q-linear-progress
                    :value="healthProgress"
                    :color="healthColor"
                    size="14px"
                    class="rounded"
                >
                    <div class="absolute-full flex flex-center text-xs text-white font-bold">
                        {{ creature.health }} / {{ maxHealth }}
                    </div>
                </q-linear-progress>
            </div>

            <!-- Статы с эмодзи -->
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex items-center">
                    ⚔️
                    <span :class="attackStat.color" class="ml-1">{{ attackStat.value }}</span>
                </div>
                <div class="flex items-center">
                    🛡️
                    <span :class="defenseStat.color" class="ml-1">{{ defenseStat.value }}</span>
                </div>
                <div class="flex items-center">
                    ✨
                    <span :class="willStat.color" class="ml-1">{{ willStat.value }}</span>
                </div>
                <div class="flex items-center">
                    💡
                    <span :class="initiativeStat.color" class="ml-1">{{ initiativeStat.value }}</span>
                </div>
            </div>

            <!-- Активные эффекты -->
            <div v-if="effectIcons.length" class="flex flex-wrap gap-1">
                <EffectSpan
                    v-for="effect in effectIcons"
                    :effect="effect"
                    :show-duration="true"
                />
            </div>
        </div>

        <!-- Тень-градиент снизу -->
        <div
            style="
        height: 8px;
        background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.4));
        pointer-events: none;
      "
        ></div>
    </div>
</template>

<style scoped>
.main-block {
    @apply bg-background text-foreground;
    background: radial-gradient(ellipse at 20% 50%, rgba(139, 69, 193, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(139, 69, 193, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0b14 0%, #1a1b2e 50%, #16213e 100%);
    background-attachment: fixed;
}
</style>