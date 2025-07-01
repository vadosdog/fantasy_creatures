<script setup>
import {computed, ref} from 'vue';
import {useCraftStore} from "../../store/craft.js";
import {useGameStore} from "../../store/game.js";

const craftStore = useCraftStore()
const gameStore = useGameStore()

const selectedShards = computed(() => craftStore.selectedShards);
const potentialCreature = computed(() => craftStore.potentialCreature)

const isKnownCreature = computed(() => {
    if (!allShardsSelected.value) {
        return false
    }
    console.log(craftStore.potentialCreature?.number)
    return gameStore.knownCreatures.some(number => craftStore.potentialCreature?.number === number)
});


// Состояния превью
const isEmptyState = computed(() =>
    selectedShards.value.every(shard => shard === null)
);

const isPartialState = computed(() => {
        return !isEmptyState.value && !allShardsSelected.value
    }
);

const allShardsSelected = computed(() =>
    selectedShards.value.every(shard => shard !== null)
);

// Имя существа
const creatureName = computed(() => {
    if (!allShardsSelected.value || !isKnownCreature.value) return '???????';

    return potentialCreature.value?.name || 'Неизвестное';
});

// Статы для отображения
const visibleStats = computed(() => {
    const currentStats = (!allShardsSelected.value || !isKnownCreature.value) ? {} : potentialCreature.value

    let maxHealthStat = '???'
    let attackStat = '???'
    let defenseStat = '???'
    let willStat = '???'
    let initiativeStat = '???'
    let speedStat = '???'
    let maxPP = '???'
    let ppRegen = '???'
    if (allShardsSelected.value && isKnownCreature.value) {
        const diffs = craftStore.craftStatRange[potentialCreature.value?.emotion]

        maxHealthStat = (currentStats.maxHealthStat - diffs.maxHealthStat) + ' - ' + (currentStats.maxHealthStat + diffs.maxHealthStat) 
        attackStat = (currentStats.attackStat - diffs.attackStat) + ' - ' + (currentStats.attackStat + diffs.attackStat) 
        defenseStat = (currentStats.defenseStat - diffs.defenseStat) + ' - ' + (currentStats.defenseStat + diffs.defenseStat) 
        willStat = (currentStats.willStat - diffs.willStat) + ' - ' + (currentStats.willStat + diffs.willStat) 
        initiativeStat = (currentStats.initiativeStat - diffs.initiativeStat) + ' - ' + (currentStats.initiativeStat + diffs.initiativeStat) 
        speedStat = currentStats.speedStat 
        maxPP = (currentStats.maxPP - diffs.maxPP) + ' - ' + (currentStats.maxPP + diffs.maxPP) 
        ppRegen = (currentStats.ppRegen - diffs.ppRegen) + ' - ' + (currentStats.ppRegen + diffs.ppRegen) 
    }

    return [
        {label: 'Здоровье', name: 'maxHealthStat', value: maxHealthStat},
        {label: 'Атака', name: 'attackStat', value: attackStat},
        {label: 'Защита', name: 'defenseStat', value: defenseStat},
        {label: 'Воля', name: 'willStat', value: willStat},
        {label: 'Инициатива', name: 'initiativeStat', value: initiativeStat},
        {label: 'Скорость', name: 'speedStat', value: speedStat},
        {label: 'PP', name: 'maxPP', value: maxPP},
        {label: 'Регенерация PP', name: 'ppRegen', value: ppRegen},
    ];
});

const creatureImage = computed(() => {
    if (!allShardsSelected.value || !isKnownCreature.value) {
        return ''
    }
    return 'assets/creatures/basic/' + potentialCreature.value.number + '.png';
})

// Прогноз качества
const qualityChance = computed(() => {
    if (!allShardsSelected.value) return 0;

    let chance = 0;
    selectedShards.value.forEach(shard => {
        if (shard?.rarity === 'rare') chance += 0.1;
        if (shard?.rarity === 'legendary') chance += 0.25;
    });

    return Math.min(chance, 1);
});

const qualityLabel = computed(() => {
    const percent = Math.round(qualityChance.value * 100);
    return `${percent}% (${qualityDescription(percent)})`;
});

const showQuality = computed(() => allShardsSelected.value);

// Вспомогательные функции
function qualityDescription(percent) {
    if (percent === 0) return 'Базовое';
    if (percent <= 15) return 'Обычное';
    if (percent <= 30) return 'Хорошее';
    return 'Отличное';
}

function shardClass(shard) {
    if (!shard) return 'shard-empty';
    return `shard-${shard.rarity}`;
}
</script>

<template>
    <q-card class="craft-preview-panel text-muted-foreground">
        <!-- Область превью существа -->
        <q-card-section class="preview-section">
            <div class="preview-container">
                <!-- Состояние 1: Пустое состояние -->
                <!-- Состояние 2: Частичное заполнение -->
                <div v-if="isEmptyState || isPartialState" class="empty-preview">
                    <q-icon name="help_outline" size="xl"/>
                </div>

                <!-- Состояние 3: Все осколки - известное существо -->
                <div v-else-if="isKnownCreature" class="full-preview">
                    <q-img :src="creatureImage"/>
                    <q-badge class="known-badge" label="Изучено"/>
                </div>

                <!-- Состояние 4: Все осколки - неизвестное существо -->
                <div v-else class="unknown-preview">
                    <q-icon name="help_outline" size="xl"/>
                </div>
            </div>
        </q-card-section>

        <!-- Имя существа -->
        <q-card-section class="name-section">
            <div class="text-h6">{{ creatureName }}</div>
        </q-card-section>

        <!-- Иконки осколков -->
        <q-card-section class="shards-section">
            <div class="shards-container">
                <q-img
                    v-for="shard in selectedShards.filter(s => s != null)"
                    :key="shard.id"
                    :src="shard.img"
                    class="shard-image"
                    :class="shardClass(shard)"
                    no-native-menu
                >
                    <q-tooltip>
                        {{ shard.name }}
                    </q-tooltip>
                </q-img>
            </div>
        </q-card-section>

        <!-- Статы существа -->
        <q-card-section class="stats-section">
            <q-list dense bordered class="stats-list">
                <q-item v-for="stat in visibleStats" :key="stat.name">
                    <q-item-section>
                        <q-item-label>{{ stat.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-item-label>{{ stat.value }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>

        <!-- Прогноз качества -->
        <q-card-section v-if="showQuality" class="quality-section">
            <div class="quality-info">
                <div class="text-caption">Шанс улучшения</div>
                <q-linear-progress :value="qualityChance" stripe size="md"/>
                <div class="quality-value">{{ qualityLabel }}</div>
            </div>
        </q-card-section>
    </q-card>
</template>

<style scoped>
.craft-preview-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.preview-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    max-height: 40vh;
}

.preview-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.empty-preview, .partial-preview, .full-preview, .unknown-preview {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.placeholder-text {
    margin-top: 10px;
    font-size: 1.2rem;
}

.partial-preview {
    position: relative;
}

.silhouette {
    filter: brightness(0);
    opacity: 0.7;
}

.fragments-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.fragment {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
}

.outline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 3px solid;
    border-radius: 8px;
    box-shadow: 0 0 10px currentColor;
}

.known-badge {
    position: absolute;
    top: 10px;
    right: 10px;
}

.name-section {
    padding-top: 0;
    text-align: center;
}

.shards-section {
    padding-top: 0;
}

.shards-container {
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
    height: 64px;
}

.shard-image {
    height: 64px;
    width: 64px;
}

.stats-section {
    flex: none;
}

.stats-list {
    border-radius: 8px;
}

.quality-section {
    padding-top: 0;
}

.quality-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.quality-value {
    text-align: center;
    font-size: 0.9rem;
}
</style>