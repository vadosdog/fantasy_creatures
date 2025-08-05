<script setup>
import { computed } from 'vue';
import { getEffectIcon } from "../../game/classes/iconHelper.js";

const props = defineProps({
    effect: {
        type: Object,
        required: true,
        validator: (eff) => 'effect' in eff
    },
    type: {
        type: String,
        default: 'span' // 'span' или 'badge'
    }
});

// Получаем путь к PNG-иконке
const iconSrc = computed(() => getEffectIcon(props.effect.effect));

// Определяем цвет: бафы — positive, дебафы — negative
const colorClass = computed(() => {
    const buffs = [
        'empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense'
    ];
    return buffs.includes(props.effect.effect) ? 'positive' : 'negative';
});
</script>

<template>
    <!-- Режим: бейдж с иконкой и текстом -->
    <q-badge
        v-if="type === 'badge'"
        :color="colorClass"
        class="effect-badge"
    >
        <q-avatar
            v-if="iconSrc"
            size="1em"
            class="q-mr-xs"
        ><img :src="iconSrc" alt="" /></q-avatar>
        <span v-else class="q-mr-xs">{{ effect.effect[0] }}</span>
        {{ effect.effect }}
    </q-badge>

    <!-- Режим: инлайн текст с иконкой -->
    <span
        v-else
        :class="`text-${colorClass}`"
        class="effect-inline"
    >
    <q-avatar
        v-if="iconSrc"
        size="1em"
        class="q-mr-xs inline-icon"
    ><img :src="iconSrc" alt="" /></q-avatar>
    <span v-else class="q-mr-xs">{{ effect.effect[0] }}</span>
    {{ effect.effect }}
  </span>
</template>

<style scoped>
/* Размер иконки в тексте */
.inline-icon {
    display: inline-flex;
    vertical-align: middle;
}

/* Дополнительные стили при необходимости */
.effect-badge {
    font-size: 0.85em;
    padding: 2px 6px;
}

.effect-inline {
    font-size: 0.95em;
}
</style>