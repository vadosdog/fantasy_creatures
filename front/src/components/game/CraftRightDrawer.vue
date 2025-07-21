<script setup>
import {computed, ref} from 'vue';
import {useCraftStore} from "../../store/craft.js";
import {useGameStore} from "../../store/game.js";
import {creaturesLib} from "../../database/creaturesLib.js";

const craftStore = useCraftStore()
const gameStore = useGameStore()

const selectedShards = computed(() => craftStore.selectedShards);
const potentialCreature = computed(() => craftStore.potentialCreature)

const isKnownCreature = computed(() => {
    if (!allShardsSelected.value) {
        return false
    }
    return gameStore.knownCreatures.some(number => craftStore.potentialCreature?.number === number)
});

const createdCreature = computed(() => craftStore.createdCreature)
console.log(createdCreature.value)

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
    if (createdCreature.value) {
        return createdCreature.value.name
    }

    if (!allShardsSelected.value || !isKnownCreature.value) return '???????';

    return potentialCreature.value?.name || 'Неизвестное';
});

// Статы для отображения
const visibleStats = computed(() => {
    let currentStats = {}

    if (createdCreature.value) {
        currentStats = getBaseCreature(createdCreature.value.element, createdCreature.value.shape, createdCreature.value.emotion)
    } else if (allShardsSelected.value && isKnownCreature.value) {
        currentStats = potentialCreature.value
    }

    const result = [
        {label: 'Здоровье', name: 'maxHealthStat', value: '???'},
        {label: 'Атака', name: 'attackStat', value: '???'},
        {label: 'Защита', name: 'defenseStat', value: '???'},
        {label: 'Воля', name: 'willStat', value: '???'},
        {label: 'Инициатива', name: 'initiativeStat', value: '???'},
        {label: 'Скорость', name: 'speedStat', value: '???'},
        {label: 'PP', name: 'maxPP', value: '???'},
        {label: 'Регенерация PP', name: 'ppRegen', value: '???'},
    ];


    const diffs = craftStore.craftStatRange[currentStats?.emotion] || []
    for (const resultElement of result) {
        if (createdCreature.value) {
            resultElement.value = createdCreature.value[resultElement.name]
            if (resultElement.value > currentStats[resultElement.name]) {
                resultElement.color = 'positive'
            } else if (resultElement.value < currentStats[resultElement.name]) {
                resultElement.color = 'negative'
            }
        } else if (allShardsSelected.value && isKnownCreature.value) {
            if (diffs[resultElement.name]) {
                resultElement.value = (currentStats[resultElement.name] - diffs[resultElement.name]) + ' - ' + (currentStats[resultElement.name] + diffs[resultElement.name])
            } else {
                resultElement.value = currentStats[resultElement.name]
            }
        }
    }

    return result;
});

const creatureImage = computed(() => {
    if (createdCreature.value) {
        return 'assets/creatures/basic/' + createdCreature.value.number + '.png';
    }
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

function getBaseCreature(element, shape, emotion) {
    return creaturesLib[element + '-' + shape + '-' + emotion]
}

</script>

<template>
    <q-card class="craft-preview-panel text-muted-foreground">
        <!-- Область превью существа -->
        <q-card-section class="preview-section">
            <div class="preview-container">
                <!-- Состояние 1: Пустое состояние -->
                <!-- Состояние 2: Частичное заполнение -->
                <div v-if="!createdCreature && (isEmptyState || isPartialState)" class="empty-preview">
                    <q-icon name="help_outline" size="xl"/>
                </div>

                <!-- Состояние 3: Все осколки - известное существо -->
                <div v-else-if="createdCreature || isKnownCreature" class="full-preview">
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
                        <q-item-label class="text-bold" :class="{
                            'text-primary': stat.color === 'positive',
                            'text-negative': stat.color === 'negative'
                        }">
                            {{ stat.value }}
                            <q-tooltip 
                                anchor="center left"
                                self="center right"
                                :offset="[10, 10]"
                            >
                                <span v-if="stat.color === 'positive'">
                                    Выше среднего
                                </span>
                                <span v-else-if="stat.color === 'negative'">
                                    Ниже среднего
                                </span>
                                <span v-else>
                                    Среднее
                                </span>
                            </q-tooltip>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
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