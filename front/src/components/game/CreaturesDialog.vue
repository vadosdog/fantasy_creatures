<script setup>
import { computed, ref, watch } from 'vue';
import { useGameStore } from '../../store/game.js';
import EffectSpan from './EffectSpan.vue';

// Импортируем хелпер
import {
    getElementIcon,
    getEmotionIcon,
    getShapeIcon
} from "../../game/classes/iconHelper.js";

defineProps({
    modelValue: Boolean
});
defineEmits(['update:modelValue']);

// Фильтры
const selectedElement = ref({ label: 'Любой', value: null });
const selectedShape = ref({ label: 'Любой', value: null });
const selectedEmotion = ref({ label: 'Любой', value: null });
const searchQuery = ref('');

// Опции фильтров
const elementOptions = [
    { label: 'Любой', value: null },
    { label: 'Огонь', value: 'fire' },
    { label: 'Вода', value: 'water' },
    { label: 'Трава', value: 'grass' },
];
const shapeOptions = [
    { label: 'Любой', value: null },
    { label: 'Зверь', value: 'beast' },
    { label: 'Птица', value: 'bird' },
    { label: 'Рептилия', value: 'reptile' },
];
const emotionOptions = [
    { label: 'Любой', value: null },
    { label: 'Ярость', value: 'rage' },
    { label: 'Азарт', value: 'passion' },
    { label: 'Надежда', value: 'hope' },
];

const gameStore = useGameStore();

// Фильтрация существ
const filteredCreatures = computed(() => {
    return gameStore.creatures.filter(creature => {
        if (selectedElement.value?.value && creature.element !== selectedElement.value.value) return false;
        if (selectedShape.value?.value && creature.shape !== selectedShape.value.value) return false;
        if (selectedEmotion.value?.value && creature.emotion !== selectedEmotion.value.value) return false;
        if (
            searchQuery.value &&
            !creature.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
            !creature.number.toString().includes(searchQuery.value.toLowerCase())
        ) return false;
        return true;
    });
});

// Путь к изображению существа
const creatureImage = (creature) => {
    if (!creature) return '';
    return `assets/creatures/basic/${creature.number}.png`;
};

const selectedCreature = ref(null);
const prevFilters = ref(null);

const selectCreature = (creature) => {
    if (selectedCreature.value?.id === creature.id) {
        selectedCreature.value = null;
    } else {
        selectedCreature.value = creature;
    }
};

// Сброс/восстановление фильтров при выборе существа
watch(selectedCreature, (newVal) => {
    if (newVal) {
        prevFilters.value = {
            element: { ...selectedElement.value },
            shape: { ...selectedShape.value },
            emotion: { ...selectedEmotion.value },
            search: searchQuery.value
        };
        selectedElement.value = { label: 'Любой', value: null };
        selectedShape.value = { label: 'Любой', value: null };
        selectedEmotion.value = { label: 'Любой', value: null };
        searchQuery.value = '';
    } else {
        if (prevFilters.value) {
            selectedElement.value = prevFilters.value.element;
            selectedShape.value = prevFilters.value.shape;
            selectedEmotion.value = prevFilters.value.emotion;
            searchQuery.value = prevFilters.value.search;
        }
    }
});

// Получение иконки действия (через PNG)
function getActionIcon(action) {
    if (action.element) {
        const src = getElementIcon(action.element);
        return src ? { type: 'element', src, color: 'primary' } : null;
    }
    if (action.emotion) {
        const src = getEmotionIcon(action.emotion);
        return src ? { type: 'emotion', src, color: 'red-9' } : null;
    }
    if (action.shape) {
        const src = getShapeIcon(action.shape);
        return src ? { type: 'shape', src, color: 'accent' } : null;
    }
    return null;
}

// Тип действия — эмодзи, не меняем
function getActionTypeIcon(action) {
    if (action.range === 0) return '🛡️';
    return { melee: '🗡️', ranged: '🏹', treat: '❤' }[action.actionType];
}
</script>

<template>
    <q-dialog
        :model-value="modelValue"
        @update:model-value="val => $emit('update:modelValue', val)"
        class="text-primary-foreground"
    >
        <q-card class="flex column" style="max-width: 80vw; width: 800px">
            <q-toolbar>
                <!-- Кнопка "Назад" -->
                <q-btn
                    v-if="selectedCreature"
                    icon="arrow_back"
                    flat
                    round
                    dense
                    @click="selectedCreature = null"
                />
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-toolbar>

            <!-- Панель фильтров -->
            <q-card-section v-if="!selectedCreature" class="q-pb-none">
                <div class="q-pa-sm">
                    <div class="row q-gutter-sm">
                        <q-select
                            v-model="selectedElement"
                            :options="elementOptions"
                            label="Стихия"
                            dense
                            outlined
                            class="col"
                        />
                        <q-select
                            v-model="selectedShape"
                            :options="shapeOptions"
                            label="Форма"
                            dense
                            outlined
                            class="col"
                        />
                        <q-select
                            v-model="selectedEmotion"
                            :options="emotionOptions"
                            label="Эмоция"
                            dense
                            outlined
                            class="col"
                        />
                    </div>
                    <q-input
                        v-model="searchQuery"
                        label="Поиск Эхонов"
                        dense
                        outlined
                        class="q-mt-sm"
                    >
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
            </q-card-section>

            <!-- Горизонтальный скролл существ -->
            <q-card-section v-if="selectedCreature" class="q-pa-sm" style="height: 120px;">
                <q-scroll-area horizontal style="height: 100px; white-space: nowrap;">
                    <div class="row no-wrap q-gutter-sm">
                        <div
                            v-for="(creature, index) in gameStore.creatures"
                            :key="index"
                            class="inline-block cursor-pointer"
                            :class="{ 'selected-mini': selectedCreature?.id === creature.id }"
                            @click="selectCreature(creature)"
                        >
                            <q-img
                                :src="creatureImage(creature)"
                                style="width: 80px; height: 80px;"
                            />
                        </div>
                    </div>
                </q-scroll-area>
            </q-card-section>

            <!-- Основной контент -->
            <q-card-section style="max-height: 80vh; min-height: 600px" class="scroll">
                <!-- Сетка существ -->
                <div v-if="!selectedCreature" class="row q-col-gutter-sm">
                    <div
                        v-for="(creature, index) in filteredCreatures"
                        :key="index"
                        class="col-xs-4 cursor-pointer"
                        @click="selectCreature(creature)"
                    >
                        <q-card>
                            <q-img :src="creatureImage(creature)" no-native-menu />
                            <q-badge class="absolute-bottom-right text-subtitle2" :label="creature.name" />
                        </q-card>
                    </div>
                </div>

                <!-- Детали существа -->
                <div v-else class="row q-col-gutter-md">
                    <!-- Левая колонка: изображение и действия -->
                    <div class="col-xs-4">
                        <q-card>
                            <q-img :src="creatureImage(selectedCreature)" no-native-menu />
                        </q-card>

                        <div class="q-mt-md">
                            <q-btn
                                v-for="action in selectedCreature.actions"
                                class="col-12 q-mb-sm action-button text-foreground"
                                no-caps
                                align="left"
                            >
                                <!-- Иконка действия — PNG -->
                                <q-avatar
                                    v-if="getActionIcon(action)?.src"
                                    size="sm"
                                    class="q-ma-xs absolute-right"
                                >
                                    <img :src="getActionIcon(action).src" alt="" />
                                </q-avatar>

                                <!-- Иконка действия — fallback (на случай ошибки) -->
                                <q-icon
                                    v-else
                                    :name="getActionIcon(action)?.icon || 'help'"
                                    :color="getActionIcon(action)?.color || 'grey'"
                                    size="sm"
                                    class="q-ma-xs absolute-right"
                                />

                                <!-- Название действия -->
                                <div class="col-12 text-left text-foreground">
                                    {{ getActionTypeIcon(action) }} {{ action.name }}
                                </div>

                                <!-- Дальность -->
                                <div v-if="action.range > 1" class="col-12 text-left text-foreground">
                                    📏 {{ action.range }}
                                </div>

                                <!-- Стоимость PP -->
                                <div class="col-12 text-left">
                                    <span>PP: {{ action.pp }}</span>
                                </div>

                                <!-- Характеристики -->
                                <div class="col-12 text-left text-foreground">
                                    🎯 {{ action.hitChance * 100 }}%
                                    <span v-if="action.critChance > 0">💢 {{ action.critChance * 100 }}%</span>
                                    💥 {{ action.baseDamage }}
                                </div>

                                <!-- Эффекты -->
                                <div v-if="action.effects.length" class="col-12 text-left text-foreground">
                                    <q-separator class="bg-border" />
                                    <div v-for="effect in action.effects" :key="effect.effect">
                                        <EffectSpan :effect="effect" />
                                        <span v-if="effect.duration > 1" class="q-pl-xs">x{{ effect.duration }}</span>
                                        🎲 {{ effect.chance * 100 }}%
                                    </div>
                                </div>
                            </q-btn>
                        </div>
                    </div>

                    <!-- Правая колонка: характеристики -->
                    <div class="col-xs-8">
                        <div class="text-h3 q-mb-md">{{ selectedCreature.name }}</div>

                        <div class="text-subtitle1 q-mb-sm">Основные характеристики:</div>
                        <div class="row q-col-gutter-sm">
                            <div class="col-6">
                                <q-list bordered dense>
                                    <q-item>
                                        <q-item-section>
                                            Уровень
                                            <q-icon name="help" size="xs" class="text-grey">
                                                <q-tooltip>Пояснение термина</q-tooltip>
                                            </q-icon>
                                        </q-item-section>
                                        <q-item-section side>{{ selectedCreature.level }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Эхо Битв (ЭБ)</q-item-section>
                                        <q-item-section side>{{ selectedCreature.experience || 0 }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Сила Пробуждения (СП)</q-item-section>
                                        <q-item-section side>{{ selectedCreature.manualPoints || 0 }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Стихия</q-item-section>
                                        <q-item-section side>
                                            <q-badge :label="selectedCreature.element" color="primary" />
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Форма</q-item-section>
                                        <q-item-section side>
                                            <q-badge :label="selectedCreature.shape" color="secondary" />
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Эмоция</q-item-section>
                                        <q-item-section side>
                                            <q-badge :label="selectedCreature.emotion" color="accent" />
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </div>
                            <div class="col-6">
                                <q-list bordered dense>
                                    <q-item>
                                        <q-item-section>Здоровье</q-item-section>
                                        <q-item-section side>{{ selectedCreature.maxHealthStat }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Атака</q-item-section>
                                        <q-item-section side>{{ selectedCreature.attackStat }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Защита</q-item-section>
                                        <q-item-section side>{{ selectedCreature.defenseStat }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Воля</q-item-section>
                                        <q-item-section side>{{ selectedCreature.willStat }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Инициатива</q-item-section>
                                        <q-item-section side>{{ selectedCreature.initiativeStat }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Скорость</q-item-section>
                                        <q-item-section side>{{ selectedCreature.speedStat }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>PP</q-item-section>
                                        <q-item-section side>{{ selectedCreature.maxPP }}</q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Регенерация PP</q-item-section>
                                        <q-item-section side>{{ selectedCreature.ppRegen }}</q-item-section>
                                    </q-item>
                                </q-list>
                            </div>
                        </div>

                        <div class="text-subtitle1 q-mt-md q-mb-sm">Описание:</div>
                        <p>Это могучее существо обладает невероятной силой и выносливостью. Его способности позволяют ему доминировать в бою и защищать своих союзников от любых угроз.</p>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style scoped>
.selected-mini {
    border: 3px solid hsl(var(--primary));
    border-radius: 4px;
    padding: 2px;
}

.action-button {
    transition: all 0.3s ease;
    text-align: left;
    background: hsl(var(--secondary));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
}
</style>