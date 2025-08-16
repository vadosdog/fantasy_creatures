<script setup>
import {ref, computed, onMounted} from 'vue'
import {useGameStore} from "../../store/game.js";
import {Notify, QLinearProgress, QScrollArea} from "quasar";
import BattleStartDialogCreature from "./BattleStartDialogCreature.vue";
import {useBattleStore} from "../../store/battle.js";
import {useRouter} from "vue-router";
import {getEnemiesByConfig} from "../../game/classes/battle/CreateBattle.js";

const props = defineProps({
    config: {
        type: Object,
        default: {}
        /* может быть двух видов. по хорошему привести к одному. но пусть пока будет так
        {
                    count: 1,
                    levelLimit: 5,
                }
                
                {
                        enemyCount: [2, 3],
                        enemyLevel: [1, 3],
                        playerCountLimit: 3,
                        playerLevelLimit: 5,
                        dominantElement: {element: "grass", chance: 0.8},
                        dominantShape: {shape: "beast", chance: 0.6},
                        dominantEmotion: {emotion: "rage", chance: 0.7},
                        composition: [ // пресеты конкретных юнитов, все поля необязательные
                            {
                                count: [1, 1],
                                element: "water",
                                shape: "beast",
                                emotion: "rage",
                                rarity: "legendary"
                            },
                            {
                                count: [3, 3],
                                element: "water",
                                shape: "beast",
                                rarity: "rare"
                            },
                        ],
                    }

*/
    },
    modelValue: Boolean
})

const emits = defineEmits(['update:modelValue']);
const router = useRouter();

const gameStore = useGameStore()
const battleStore = useBattleStore()

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
    return enemyCreatures.value.reduce((sum, creature) =>
        sum + creature.attackStat + creature.defenseStat + creature.maxHealthStat, 0)
})

// Баланс сил (0-1)
const powerBalance = computed(() => {
    if (!enemyTotalPower.value) return 0.5
    const total = playerTotalPower.value + enemyTotalPower.value
    return playerTotalPower.value / total
})

const playerLevelLimit = computed(() => {
    return props.config.playerLevelLimit || props.config.levelLimit || 30;
})

const playerCountLimit = computed(() => {
    return props.config.playerCountLimit || props.config.count || 6;
})

const enemyCreatures = ref([])

function calcEnemies() {
    enemyCreatures.value = getEnemiesByConfig(props.config, gameStore)
}

// Переключение выбора существа
const toggleCreatureSelection = (creature) => {
    const index = selectedCreatureIds.value.indexOf(creature.id)
    if (index > -1) {
        selectedCreatureIds.value.splice(index, 1)
    } else {
        if (selectedCreatures.value.length >= playerCountLimit.value) {
            Notify.create({
                message: 'Ограничение активных существ в ритуале: ' + playerCountLimit.value,
                color: 'negative', // красный цвет
                icon: 'error',
                position: 'top-right',
                timeout: 3000, // исчезнет через 3 секунды
                closeBtn: true // кнопка закрытия
            })
            return false
        } else if (creature.level > playerLevelLimit.value) {
            Notify.create({
                message: 'Ограничение на уровень существ в ритуале: ' + playerLevelLimit.value,
                color: 'negative', // красный цвет
                icon: 'error',
                position: 'top-right',
                timeout: 3000, // исчезнет через 3 секунды
                closeBtn: true // кнопка закрытия
            })
            return false
        } else {
            selectedCreatureIds.value.push(creature.id)
        }
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
    }).sort((a, b) => b.level - a.level);
});


function handleBattleStart(battleData) {
    const playerCreatures = gameStore.creatures.filter(creature => battleData.includes(creature.id));
    // Здесь будет логика инициализации боя
    battleStore.startBattle({
        leftTeam: playerCreatures,
        rightTeam: enemyCreatures.value,
    })
    emits('update:modelValue', false)
    gameStore.setState('battle')
    gameStore.changeScene('Battle')
    router.push('/game')
}


</script>

<template>
    <q-dialog
        :model-value="modelValue"
        @update:model-value="val => $emit('update:modelValue', val)"
        persistent maximized full-width full-height class="text-dark"
        @show="calcEnemies"
    >
        <q-card class="">
            <q-card-section class="bg-primary text-white q-py-sm q-px-md row items-center">
                <q-btn flat round icon="arrow_back" v-close-popup dense/>
                <div class="text-h6 q-ml-sm">Подготовка к бою</div>
            </q-card-section>

            <q-card-section class="q-pa-none " style="height: calc(100% - 64px)">
                <div class="row " style="height: 100%">
                    <!-- Колонка 1: Существа игрока -->
                    <div class="col-3 q-pa-sm column">
                        <div>
                            <div class="text-center text-weight-bold q-mb-sm">Ваши Эхоны</div>
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
                                v-if="playerCreatures.length > 0"
                            >
                                <q-list bordered>
                                    <BattleStartDialogCreature
                                        v-for="(creature, index) in filteredCreatures"
                                        :key="creature.id"
                                        :creature="creature"
                                        :active="selectedCreatureIds.includes(creature.id)"
                                        @click="toggleCreatureSelection(creature)"
                                        direction="right"
                                    />
                                </q-list>
                            </QScrollArea>
                            <div v-else class="flex column text-center q-pa-md text-grey">
                                <span>У вас нет ни одного Эхона.</span>
                                <span class="q-mt-sm">Создайте их в <strong>Кузне Осколков</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- Колонка 2: Выбранные существа -->
                    <div class="col-3 q-pa-sm scroll column">
                        <div class="text-center text-weight-bold q-mb-sm">Выбранные существа</div>
                        <div class="text-center-g-md-sm">
                            Вы чувствуете, что хрупкое эхо выдержит до <b>{{ playerCountLimit }}</b> существ уровня не выше
                            <b>{{ playerLevelLimit }}</b>.
                        </div>
                        <div class="col">
                            <QScrollArea
                                ref="scrollArea"
                                style="width: 100%; height: 100%"
                                horizontal
                                v-if="selectedCreatures.length"
                            >
                                <q-list bordered>
                                    <BattleStartDialogCreature
                                        v-for="creature in selectedCreatures"
                                        :key="creature.id"
                                        :creature="creature"
                                        :active="true"
                                        @click="toggleCreatureSelection(creature)"
                                        direction="right"
                                    />
                                </q-list>
                            </QScrollArea>
                            <div v-else class="flex column text-center q-pa-md text-grey">
                                <span>Оцените команду противника</span>
                                <span class="q-mt-sm">и выберите своих существ</span>
                            </div>
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
                                @click="handleBattleStart(selectedCreatureIds)"
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
                                        direction="left"
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