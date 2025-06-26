<script setup>
import {computed} from 'vue';

const props = defineProps({
    effect: {
        type: Object,
        required: true,
        validator: (eff) => 'effect' in eff
    },
    type: {
        default: 'span'
    }
});

// Мапинг иконок для эффектов
const effectIcons = {
    // Бафы
    'empower': '💪',
    'haste': '⚡',
    'luck': '🍀',
    'regen': '💚',
    'thorns': '🌵',
    'aegis': '🛡️',
    'defense': '🛡️',

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
    'confusion': '😖'
};

// Получаем иконку для эффекта
const icon = computed(() => {
    console.log(props.effect)
    return effectIcons[props.effect.effect] || '';
});

// Определяем цвет в зависимости от типа эффекта
const colorClass = computed(() => {
    const buffs = ['empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense'];
    return buffs.includes(props.effect.effect) ? 'positive' : 'negative';
});
</script>

<template>
    <q-badge
        v-if="type === 'badge'"
        :color="colorClass"
    >
        {{ icon }} {{ effect.effect }}
    </q-badge>
    <span :class="'text-' + colorClass" v-else>
        {{ icon }} {{ effect.effect }}
    </span>
</template>

<style scoped>
/* При необходимости добавьте кастомные стили */
</style>