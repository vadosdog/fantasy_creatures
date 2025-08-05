

<script setup>
import { computed } from 'vue';
import {CreatureAPI} from "../../game/classes/battle/Creature.js";

// --- Props ---
const props = defineProps({
    creature: {
        type: Object,
        default: null,
    },
    // Дополнительный класс, если нужно сдвинуть или изменить позицию
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
    const c = (a > b) - (a < b)
    
    return {
        "-1": 'text-negative',
        "1": 'text-positive'
    }[c]
}


function compare(a, b) {
    // Если a > b -> возвращаем 1.
    // Если a < b -> возвращаем -1.
    // Если a равно b, то возвращаем 0.
    return (a > b) - (a < b);
}

// Статы
const attackStat = computed(() => {
    if (!props.creature) {
        return 1
    }
    const value = props.creature ? CreatureAPI.getAttack(props.creature) : 0;
    return { value, color: statColor(value, props.creature?.attackStat) };
});
const defenseStat = computed(() => {
    if (!props.creature) {
        return 1
    }
    const value = props.creature ? CreatureAPI.getDefense(props.creature) : 0;
    return { value, color: statColor(value, props.creature?.defenseStat) };
});
const willStat = computed(() => {
    if (!props.creature) {
        return 1
    }
    const value = props.creature ? CreatureAPI.getWill(props.creature) : 0;
    return { value, color: statColor(value, props.creature?.willStat) };
});
const initiativeStat = computed(() => {
    if (!props.creature) {
        return 1
    }
    const value = props.creature ? CreatureAPI.getInitiative(props.creature) : 0;
    return { value, color: statColor(value, props.creature?.initiativeStat) };
});

// Иконки
const emotionIcon = computed(() => {
    switch (props.creature?.emotion) {
        case 'rage': return 'shield';
        case 'passion': return 'rocket';
        case 'hope': return 'emergency';
        default: return null;
    }
});

const shapeIcon = computed(() => {
    switch (props.creature?.shape) {
        case 'beast': return 'pets';
        case 'bird': return 'flutter_dash';
        case 'reptile': return 'smart_toy';
        default: return null;
    }
});

const elementIcon = computed(() => {
    const map = {
        fire: { icon: 'whatshot', color: 'red-9' },
        water: { icon: 'water_drop', color: 'blue-10' },
        grass: { icon: 'grass', color: 'green-9' },
    };
    return map[props.creature?.element] || { icon: '', color: 'grey' };
});

// Эффекты
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
        <!-- Основной контейнер (совпадает с hover-attack-data) -->
        <div class="p-3 space-y-2">
            <!-- Имя и иконки (элемент, эмоция, форма, уровень) -->
            <div class="flex items-center justify-between text-sm">
                <strong class="text-white q-pr-sm">{{ creature.name }}</strong>
                <div class="flex items-center space-x-1">
                    <!-- Элемент -->
                    <q-icon
                        v-if="elementIcon.icon"
                        :name="elementIcon.icon"
                        :color="elementIcon.color"
                        size="sm"
                    />
                    <!-- Эмоция -->
                    <q-icon
                        v-if="emotionIcon"
                        :name="emotionIcon"
                        color="red"
                        size="sm"
                    />
                    <!-- Форма -->
                    <q-icon
                        v-if="shapeIcon"
                        :name="shapeIcon"
                        color="accent"
                        size="sm"
                    />
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

            <!-- Краткие статы (Атака, Защита, Воля, Инициатива) -->
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

            <!-- Активные эффекты (иконки) -->
            <div v-if="effectIcons.length" class="flex flex-wrap gap-1">
                <q-badge
                    v-for="effect in effectIcons"
                    :key="effect.effect"
                    :text-color="effect.color === 'negative' ? 'red' : 'green'"
                    :label="effect.text"
                    size="sm"
                    class="px-1 py-0.5"
                />
            </div>
        </div>

        <!-- Лёгкая тень-градиент снизу (как в hover-attack-data) -->
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