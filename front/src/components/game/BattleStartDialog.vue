<script setup>
import {ref, computed, onMounted} from 'vue'
import {useGameStore} from "../../store/game.js";
import QueueCreature from "./QueueCreature.vue";
import EffectSpan from "./EffectSpan.vue";
import {QLinearProgress, QScrollArea} from "quasar";
import CreatureCard from "./CreatureCard.vue";
import BattleStartDialogCreature from "./BattleStartDialogCreature.vue";

const gameStore = useGameStore()

// Состояние компонента
const selectedCreatureIds = ref([])

// Получаем существ игрока из хранилища
const playerCreatures = computed(() => gameStore.creatures)

// Выбранные существа
const selectedCreatures = computed(() =>
    playerCreatures.value.filter(c => selectedCreatureIds.value.includes(c.id))
)

// Генерируем существ противника
const enemyCreatures = ref([])

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

// Переключение выбора существа
const toggleCreatureSelection = (creature) => {
    console.log(creature)
    const index = selectedCreatureIds.value.indexOf(creature.id)
    if (index > -1) {
        selectedCreatureIds.value.splice(index, 1)
    } else {
        selectedCreatureIds.value.push(creature.id)
    }
}

// Генерация существ противника
const generateEnemyCreatures = () => {
    // В реальном приложении будет более сложная логика
    enemyCreatures.value = [{
        id: 'enemy-1',
        name: "Водяной дракон",
        number: "007",
        element: "water",
        shape: "dragon",
        emotion: "calm",
        level: 5,
        maxHealthStat: 220,
        attackStat: 85,
        defenseStat: 92,
        willStat: 60,
        initiativeStat: 55,
        actions: []
    }]
}

// Начать бой
const startBattle = () => {
    gameStore.startBattle({
        playerCreatures: selectedCreatures.value,
        enemyCreatures: enemyCreatures.value
    })
}

onMounted(generateEnemyCreatures)
</script>

<template>
    <q-dialog persistent maximized>
        <q-card class="full-height">
            <q-card-section class="bg-primary text-white">
                <div class="text-h6">Подготовка к бою</div>
            </q-card-section>

            <q-card-section class="q-pa-none full-height">
                <div class="row full-height">
                    <!-- Колонка 1: Существа игрока -->
                    <div class="col-3 q-pa-sm">
                        <div class="text-center text-weight-bold q-mb-sm">Ваши существа</div>
                        <QScrollArea
                            ref="scrollArea"
                            style="width: 100%; height: 100%"
                            horizontal
                        >
                            <q-list bordered>
                                <BattleStartDialogCreature
                                    v-for="(creature, index) in playerCreatures"
                                    :key="creature.id"
                                    :creature="creature"
                                    :active="selectedCreatureIds.includes(creature.id)"
                                    @click="toggleCreatureSelection(creature)"
                                />
                            </q-list>
                        </QScrollArea>
                    </div>

                    <!-- Колонка 2: Выбранные существа -->
                    <div class="col-3 q-pa-sm scroll column">
                        <div class="text-center text-weight-bold q-mb-sm">Выбранные существа</div>
                        <div
                            v-for="creature in selectedCreatures"
                            :key="creature.id"
                            class="q-mb-sm creature-card"
                            @click="toggleCreatureSelection(creature)"
                        >
                            <QueueCreature :creature="creature"/>
                        </div>
                    </div>

                    <!-- Колонка 3: Соотношение сил -->
                    <div class="col-3 q-pa-sm column">
                        <div class="text-center text-weight-bold q-mb-md">Соотношение сил</div>

                        <div class="column items-center justify-center full-height">
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
                    </div>

                    <!-- Колонка 4: Существа противника -->
                    <div class="col-3 q-pa-sm scroll column">
                        <div class="text-center text-weight-bold q-mb-sm">Противник</div>
                        <div
                            v-for="creature in enemyCreatures"
                            :key="creature.id"
                            class="q-mb-sm creature-card"
                        >
                            <QueueCreature :creature="creature"/>
                        </div>
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right" class="bg-grey-2">
                <q-btn flat label="Отмена" color="negative" v-close-popup/>
                <q-btn
                    flat
                    label="Начать бой"
                    color="positive"
                    :disable="selectedCreatures.length === 0"
                    @click="startBattle"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>


<style scoped>
</style>