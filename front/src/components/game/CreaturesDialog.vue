<script setup>
import {computed, ref, watch} from 'vue';
import {useGameStore} from "../../store/game.js";
import EffectSpan from "./EffectSpan.vue";

defineProps({
    modelValue: Boolean
});

defineEmits(['update:modelValue']);

// Фильтры
const selectedElement = ref({label: 'Любой', value: null});
const selectedShape = ref({label: 'Любой', value: null});
const selectedEmotion = ref({label: 'Любой', value: null});
const searchQuery = ref('');

// Опции фильтров
const elementOptions = [
    {label: 'Любой', value: null},
    {label: 'Огонь', value: 'fire'},
    {label: 'Вода', value: 'water'},
    {label: 'Трава', value: 'grass'},
];

const shapeOptions = [
    {label: 'Любой', value: null},
    {label: 'Зверь', value: 'beast'},
    {label: 'Птица', value: 'bird'},
    {label: 'Рептилия', value: 'reptile'},
];

const emotionOptions = [
    {label: 'Любой', value: null},
    {label: 'Ярость', value: 'rage'},
    {label: 'Азарт', value: 'passion'},
    {label: 'Надежда', value: 'hope'},
];

const gameStore = useGameStore()

// Фильтрация существ
const filteredCreatures = computed(() => {
    return gameStore.creatures.filter(creature => {
        // Фильтр по стихии
        if (
            selectedElement.value &&
            selectedElement.value.value &&
            creature.element !== selectedElement.value.value
        ) {
            return false;
        }

        // Фильтр по форме
        if (
            selectedShape.value &&
            selectedShape.value.value &&
            creature.shape !== selectedShape.value.value
        ) {
            return false;
        }

        // Фильтр по эмоции
        if (
            selectedEmotion.value &&
            selectedEmotion.value.value &&
            creature.emotion !== selectedEmotion.value.value
        ) {
            return false;
        }

        // Поиск по названию
        if (
            searchQuery.value &&
            !creature.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
            !creature.number.toString().includes(searchQuery.value.toLowerCase())
        ) {
            return false;
        }

        return true;
    });
});

const creatureImage = (creature) => {
    if (!creature) {
        return '';
    }
    return 'assets/creatures/basic/' + creature.number + '.png';
}

const selectedCreature = ref(null)

const selectCreature = (creature) => {
    if (selectedCreature.value?.id === creature.id) {
        selectedCreature.value = null
    } else {
        selectedCreature.value = creature
    }
}

// Сброс фильтров при выборе существа
watch(selectedCreature, (newVal) => {
    if (newVal) {
        // Сохраняем текущие значения фильтров
        prevFilters.value = {
            element: {...selectedElement.value},
            shape: {...selectedShape.value},
            emotion: {...selectedEmotion.value},
            search: searchQuery.value
        };

        // Сбрасываем фильтры
        selectedElement.value = {label: 'Любой', value: null};
        selectedShape.value = {label: 'Любой', value: null};
        selectedEmotion.value = {label: 'Любой', value: null};
        searchQuery.value = '';
    } else {
        // Восстанавливаем фильтры
        if (prevFilters.value) {
            selectedElement.value = prevFilters.value.element;
            selectedShape.value = prevFilters.value.shape;
            selectedEmotion.value = prevFilters.value.emotion;
            searchQuery.value = prevFilters.value.search;
        }
    }
});

// Для восстановления фильтров после выхода из детального просмотра
const prevFilters = ref(null);

function getActionIcon(action) {
    if (action.element) {
        return getElementIcon(action.element)
    }
    if (action.emotion) {
        return {
            color: 'red',
            icon: getEmotionIcon(action.emotion)
        }
    }
    return {
        color: 'accent',
        icon: getShapeIcon(action.shape)
    }
}


function getElementIcon(element) { //TODO унести в какое нибудь единое место
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


function getActionTypeIcon(action) {
    if (action.range === 0) {
        return '🛡️'
    }

    return {"melee": '🗡️', 'ranged': '🏹', 'treat': '❤'}[action.actionType]
}

function maxLevel(creature) {
    // в теории может быть разные для разных существ
    return Math.min(30, 5 + Math.floor((creature.experience || 0) / 600))
}

</script>

<template>
    <q-dialog
        :model-value="modelValue"
        @update:model-value="val => $emit('update:modelValue', val)"
        class="text-primary-foreground"
    >
        <q-card class="flex column" style=" max-width: 80vw; width: 800px">
            <q-toolbar>
                <!-- Кнопка "Назад" в режиме детального просмотра -->
                <q-btn
                    v-if="selectedCreature"
                    icon="arrow_back"
                    flat
                    round
                    dense
                    @click="selectedCreature = null"
                />
                <q-space/>
                <q-btn flat round dense icon="close" v-close-popup/>
            </q-toolbar>
            <!-- Панель фильтров (видна только когда не выбрано существо) -->
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
                        label="Поиск существ"
                        dense
                        outlined
                        class="q-mt-sm"
                    >
                        <template v-slot:append>
                            <q-icon name="search"/>
                        </template>
                    </q-input>
                </div>
            </q-card-section>

            <!-- Горизонтальный скролл существ (виден только при выборе существа) -->
            <q-card-section v-if="selectedCreature" class="q-pa-sm" style="height: 120px;">
                <q-scroll-area horizontal style="height: 100px; white-space: nowrap;">
                    <div class="row no-wrap q-gutter-sm">
                        <div
                            v-for="(creature, index) in gameStore.creatures"
                            :key="index"
                            class="inline-block cursor-pointer"
                            :class="{'selected-mini': selectedCreature?.id === creature.id}"
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

            <q-card-section style="max-height: 80vh; min-height: 600px" class="scroll">
                <!-- Сетка существ (когда не выбрано существо) -->
                <div v-if="!selectedCreature" class="row q-col-gutter-sm">
                    <div
                        v-for="(creature, index) in filteredCreatures"
                        :key="index"
                        class="col-xs-4 cursor-pointer"
                        @click="selectCreature(creature)"
                    >
                        <q-card class="">
                            <q-img :src="creatureImage(creature)" no-native-menu/>
                            <q-badge class="absolute-bottom-right text-subtitle2" :label="creature.name"/>
                        </q-card>
                    </div>
                </div>

                <!-- Детали существа (когда выбрано) -->
                <div v-else class="row q-col-gutter-md">
                    <!-- Левая колонка: изображение и кнопки -->
                    <div class="col-xs-4">
                        <q-card>
                            <q-img :src="creatureImage(selectedCreature)" no-native-menu/>
                        </q-card>

                        <div class="q-mt-md">
                            <q-btn
                                v-for="action in selectedCreature.actions"
                                class="col-12 q-mb-sm action-button text-foreground"
                                no-caps
                                align="left"
                            >
                                <q-icon flat round :color="getActionIcon(action).color"
                                        :name="getActionIcon(action).icon" size="sm"
                                        class="text-foreground q-ma-xs absolute-right"/>

                                <!-- Action Details -->
                                <div class="col-12 text-left text-foreground">
                                    {{ getActionTypeIcon(action) }} ️{{ action.name }}
                                </div>
                                <div class="col-12 text-left text-foreground" v-if="action.range > 1">
                                    📏 {{ action.range }}
                                </div>
                                <div class="col-12 text-left">
                                    <span>
                                        PP: {{ action.pp }}
                                    </span>
                                </div>
                                <div class="col-12 text-left text-foreground">
                                    🎯 {{ action.hitChance * 100 }}%
                                    <span v-if="action.critChance > 0">💢 {{ action.critChance * 100 }}%</span>
                                    💥 {{ action.baseDamage }}
                                </div>
                                <div class="col-12 text-left text-foreground" v-if="action.effects.length">
                                    <q-separator class="bg-border"/>
                                    <div v-for="effect in action.effects">
                                        <EffectSpan :effect="effect"/>
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
                                        <q-item-section>Уровень / Максимум
                                            <QIcon name="help" size="xs" class="text-grey">
                                                <QTooltip>Пояснение термина</QTooltip>
                                            </QIcon>
                                        </q-item-section>
                                        <q-item-section side>{{ selectedCreature.level }} /
                                            {{ maxLevel(selectedCreature) }}
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Эхо Битв (ЭБ)</q-item-section>
                                        <q-item-section side>{{ selectedCreature.experience || 0 }}
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Сила Пробуждения (СП)</q-item-section>
                                        <q-item-section side>{{ selectedCreature.manual_points || 0 }}
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Опыт</q-item-section>
                                        <q-item-section side>{{ selectedCreature.experience || 0 }}
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Стихия</q-item-section>
                                        <q-item-section side>
                                            <q-badge :label="selectedCreature.element" color="primary"/>
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Форма</q-item-section>
                                        <q-item-section side>
                                            <q-badge :label="selectedCreature.shape" color="secondary"/>
                                        </q-item-section>
                                    </q-item>
                                    <q-item>
                                        <q-item-section>Эмоция</q-item-section>
                                        <q-item-section side>
                                            <q-badge :label="selectedCreature.emotion" color="accent"/>
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
                        <p>Это могучее существо обладает невероятной силой и выносливостью. Его способности позволяют
                            ему доминировать в бою и защищать своих союзников от любых угроз.</p>
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

/* Action Buttons */
.action-button {
    transition: all 0.3s ease;
    text-align: left;
    background: hsl(var(--secondary));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
}
</style>