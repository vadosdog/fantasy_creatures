<script setup>
import { computed, onErrorCaptured } from "vue";
import { CreatureAPI } from "../../game/classes/battle/Creature.js";
// import {getEmotionIcon} from "../../game/classes/iconHelper.js";

// Импортируем хелперы
import {
    getEmotionIcon,
    getShapeIcon,
    getElementIcon,
    getEffectIcon as getEffectIconPath
} from "../../game/classes/iconHelper.js";

onErrorCaptured((err) => {
    console.error('Error in CreatureCard:', err)
    return false
})

const props = defineProps({
    creature: {
        type: Object,
        required: true,
        default: () => ({
            name: 'LOH',
            emotion: 'rage',
            shape: 'beast',
            element: 'fire',
            effects: [],
            level: 1
        })
    },
    showHealth: { type: Boolean, default: true },
    statsVerbose: { type: Boolean, default: false }
})

const maxHealth = computed(() => CreatureAPI.getMaxHealth(props.creature));
const healthProgress = computed(() => props.creature?.health / (maxHealth.value || 1));
const maxPp = computed(() => CreatureAPI.getMaxPP(props.creature));
const ppProgress = computed(() => props.creature?.pp / (maxPp.value || 1));
const currentSpeed = computed(() => CreatureAPI.getSpeed(props.creature));
const healthColor = computed(() => {
    if (healthProgress.value < 0.3) return 'negative';
    if (healthProgress.value < 0.6) return 'warning';
    return 'positive';
});

const emotionIcon = computed(() => getEmotionIcon(props.creature?.emotion));
const shapeIcon = computed(() => getShapeIcon(props.creature?.shape));
const elementIcon = computed(() => getElementIcon(props.creature?.element));

// Обработка эффектов
function getEffectIcon(effect) {
    const iconPath = getEffectIconPath(effect.effect);
    if (!iconPath) return null;

    const text = effect.duration;
    let color = 'negative';

    // Бафы — положительные эффекты
    const isBuff = [
        'empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense'
    ].includes(effect.effect);

    if (isBuff) color = 'positive';

    return {
        ...effect,
        text,
        icon: iconPath,
        color
    };
}

const effectIcons = computed(() => {
    if (!props.creature?.effects) return [];
    return props.creature.effects
        .map(getEffectIcon)
        .filter(Boolean) // убираем null
        .slice(0, 6);
});

// Статы
function compare(a, b) {
    return (a > b) - (a < b);
}

function statColor(multiplier) {
    return { "-1": 'text-negative', "1": 'text-positive' }[multiplier] || '';
}

const attackStat = computed(() => {
    const value = CreatureAPI.getAttack(props.creature);
    const multiplier = compare(value, props.creature.attackStat);
    return { value, multiplier, color: statColor(multiplier) };
});

const defenseStat = computed(() => {
    const value = CreatureAPI.getDefense(props.creature);
    const multiplier = compare(value, props.creature.defenseStat);
    return { value, multiplier, color: statColor(multiplier) };
});

const willStat = computed(() => {
    const value = CreatureAPI.getWill(props.creature);
    const multiplier = compare(value, props.creature.willStat);
    return { value, multiplier, color: statColor(multiplier) };
});

const initiativeStat = computed(() => {
    const value = CreatureAPI.getInitiative(props.creature);
    const multiplier = compare(value, props.creature.initiativeStat);
    return { value, multiplier, color: statColor(multiplier) };
});

const src = computed(() => './assets/creatures/basic/' + (props.creature.number || props.creature.texture) + '.png');
</script>

<template>
    <q-card class="creature-card text-dark" flat bordered>
        <q-card-section horizontal>
            <!-- Иконки слева -->
            <q-card-actions vertical class="justify-around q-pa-xs" style="align-items: center">
                <q-img v-if="elementIcon" :src="elementIcon" :style="{ width: '24px', height: '24px' }" />
                <q-img v-if="emotionIcon" :src="emotionIcon" :style="{ width: '24px', height: '24px' }" />
                <q-img v-if="shapeIcon" :src="shapeIcon" :style="{ width: '24px', height: '24px' }" />
                <q-btn flat color="dark">Ур: {{ creature.level }}</q-btn>
            </q-card-actions>

            <!-- Изображение существа -->
            <q-img
                :src="src"
                :alt="creature.name"
                class="col"
                :class="{ mirror: creature.direction === 'left' }"
            />

            <!-- Эффекты справа -->
            <q-card-actions vertical class="justify-around q-pa-xs" v-if="effectIcons.length">
                <q-badge
                    v-for="effect in effectIcons"
                    :key="effect.effect"
                    flat
                    :color="effect.color"
                    outline
                >
                    <q-avatar size="1.2em" :img="effect.icon" />
                    {{ effect.text }}
                </q-badge>
            </q-card-actions>
        </q-card-section>

        <!-- Имя и полосы HP/PP -->
        <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs text-primary-foreground">{{ creature.name }}</div>

            <q-linear-progress v-if="showHealth" size="20px" :value="healthProgress" :color="healthColor" class="q-mt-sm">
                <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="'HP: ' + creature?.health + '/' + maxHealth"/>
                </div>
            </q-linear-progress>

            <q-linear-progress v-if="showHealth" size="15px" :value="ppProgress" color="accent" class="q-mt-sm">
                <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="dark" :label="'PP: ' + creature?.pp + '/' + maxPp"/>
                </div>
            </q-linear-progress>
        </q-card-section>
    </q-card>

    <!-- Статы -->
    <q-card square class="bg-grey-9">
        <q-list bordered dense v-if="statsVerbose" class="q-mt-sm">
            <q-item><q-item-section>Здоровье</q-item-section><q-item-section side>{{ creature.maxHealthStat }}</q-item-section></q-item>
            <q-item><q-item-section>Атака</q-item-section><q-item-section side>{{ attackStat.value }}</q-item-section></q-item>
            <q-item><q-item-section>Защита</q-item-section><q-item-section side>{{ defenseStat.value }}</q-item-section></q-item>
            <q-item><q-item-section>Воля</q-item-section><q-item-section side>{{ willStat.value }}</q-item-section></q-item>
            <q-item><q-item-section>Инициатива</q-item-section><q-item-section side>{{ initiativeStat.value }}</q-item-section></q-item>
            <q-item><q-item-section>Скорость</q-item-section><q-item-section side>{{ creature.speedStat }}</q-item-section></q-item>
            <q-item><q-item-section>PP</q-item-section><q-item-section side>{{ creature.maxPP }}</q-item-section></q-item>
            <q-item><q-item-section>Регенерация PP</q-item-section><q-item-section side>{{ creature.ppRegen }}</q-item-section></q-item>
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