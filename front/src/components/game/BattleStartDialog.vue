<script setup>
import {ref, computed, onMounted} from 'vue'
import {useGameStore} from "../../store/game.js";
import {QLinearProgress, QScrollArea} from "quasar";
import BattleStartDialogCreature from "./BattleStartDialogCreature.vue";

const props = defineProps({
    enemyCreatures: {
        type: Array,
        default: [],
    }
})

const gameStore = useGameStore()

// Состояние компонента
const selectedCreatureIds = ref([])

// Получаем существ игрока из хранилища
const playerCreatures = computed(() => gameStore.creatures)

// Выбранные существа
const selectedCreatures = computed(() =>
    playerCreatures.value.filter(c => selectedCreatureIds.value.includes(c.id))
)

// Рассчитываем суммарную силу игрока
const playerTotalPower = computed(() => {
    return selectedCreatures.value.reduce((sum, creature) =>
        sum + creature.attackStat + creature.defenseStat + creature.maxHealthStat, 0)
})

// Рассчитываем суммарную силу противника
const enemyTotalPower = computed(() => {
    return props.enemyCreatures.reduce((sum, creature) =>
        sum + creature.attackStat + creature.defenseStat + creature.maxHealthStat, 0)
})

// Баланс сил (0-1)
const powerBalance = computed(() => {
    if (!enemyTotalPower.value) return 0.5
    const total = playerTotalPower.value + enemyTotalPower.value
    return playerTotalPower.value / total
})

// Переключение выбора существа
const toggleCreatureSelection = (creature) => {
    const index = selectedCreatureIds.value.indexOf(creature.id)
    if (index > -1) {
        selectedCreatureIds.value.splice(index, 1)
    } else {
        selectedCreatureIds.value.push(creature.id)
    }
}

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


// Фильтры
const selectedElement = ref({label: 'Любой', value: null});
const selectedShape = ref({label: 'Любой', value: null});
const selectedEmotion = ref({label: 'Любой', value: null});
const searchQuery = ref('');

const filteredCreatures = computed(() => {
    return playerCreatures.value.filter(creature => {
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


</script>

<template>
    <q-dialog persistent maximized full-width full-height>
        <q-card class="">
            <q-card-section class="bg-primary text-white">
                <div class="text-h6">Подготовка к бою</div>
            </q-card-section>

            <q-card-section class="q-pa-none " style="height: calc(100% - 64px)">
                <div class="row " style="height: 100%">
                    <!-- Колонка 1: Существа игрока -->
                    <div class="col-3 q-pa-sm column">
                        <div>
                            <div class="text-center text-weight-bold q-mb-sm">Ваши существа</div>
                            <div class="q-pb-sm">
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
                        </div>
                        <div class="col">
                            <QScrollArea
                                ref="scrollArea"
                                style="width: 100%; height: 100%"
                                horizontal
                            >
                                <q-list bordered>
                                    <BattleStartDialogCreature
                                        v-for="(creature, index) in filteredCreatures"
                                        :key="creature.id"
                                        :creature="creature"
                                        :active="selectedCreatureIds.includes(creature.id)"
                                        @click="toggleCreatureSelection(creature)"
                                    />
                                </q-list>
                            </QScrollArea>
                        </div>
                    </div>

                    <!-- Колонка 2: Выбранные существа -->
                    <div class="col-3 q-pa-sm scroll column">
                        <div class="text-center text-weight-bold q-mb-sm">Выбранные существа</div>
                        <div class="col">
                            <QScrollArea
                                ref="scrollArea"
                                style="width: 100%; height: 100%"
                                horizontal
                            >
                                <q-list bordered>
                                    <BattleStartDialogCreature
                                        v-for="creature in selectedCreatures"
                                        :key="creature.id"
                                        :creature="creature"
                                        :active="true"
                                        @click="toggleCreatureSelection(creature)"
                                    />
                                </q-list>
                            </QScrollArea>
                        </div>
                    </div>

                    <!-- Колонка 3: Соотношение сил -->
                    <div class="col-3 q-pa-sm column">
                        <div class="text-center text-weight-bold q-mb-md">Соотношение сил</div>

                        <div class="column items-center justify-center ">
                            <div class="text-h4 q-mb-xl">⚔️</div>

                            <q-linear-progress
                                stripe
                                size="25px"
                                :value="powerBalance"
                                color="green"
                                track-color="red"
                                class="q-mb-md"
                            />

                            <div class="text-center">
                                <div class="text-h6">Игрок: {{ playerTotalPower }}</div>
                                <div class="text-h6 q-mt-sm">Противник: {{ enemyTotalPower }}</div>
                            </div>
                        </div>
                        <div class="text-center q-mt-md">

                            <q-btn flat label="Отмена" color="negative" v-close-popup/>
                            <q-btn
                                flat
                                label="Начать бой"
                                color="positive"
                                :disable="selectedCreatures.length === 0"
                                @click="$emit('battle-start', selectedCreatureIds)"
                            />

                        </div>
                    </div>

                    <!-- Колонка 4: Существа противника -->
                    <div class="col-3 q-pa-sm scroll column">
                        <div class="text-center text-weight-bold q-mb-sm">Противник</div>
                        <div class="col">
                            <QScrollArea
                                ref="scrollArea"
                                style="width: 100%; height: 100%"
                                horizontal
                            >
                                <q-list bordered>
                                    <BattleStartDialogCreature
                                        v-for="(creature, index) in enemyCreatures"
                                        :key="creature.id"
                                        :creature="creature"
                                        :active="false"
                                    />
                                </q-list>
                            </QScrollArea>
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>


<style scoped>
</style>