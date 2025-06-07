<script setup>
import {computed} from 'vue';

const props = defineProps({
    effect: {
        type: Object,
        required: true,
        validator: (eff) => 'effect' in eff
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
    return effectIcons[props.effect.effect] || '';
});

// Определяем цвет в зависимости от типа эффекта
const colorClass = computed(() => {
    const buffs = ['empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense'];
    return buffs.includes(props.effect.effect) ? 'text-positive' : 'text-negative';
});
</script>

<template>
  <span :class="colorClass">
    {{ icon }} {{ effect.effect }}
  </span>
</template>

<style scoped>
/* При необходимости добавьте кастомные стили */
</style>