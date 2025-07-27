<script setup>
import {useGameStore} from "../../store/game.js";
import {computed, ref} from "vue";
import {useBattleStore} from "../../store/battle.js";
import {useRouter} from "vue-router";
import BattleStartDialog from "./BattleStartDialog.vue";
import {getEnemiesByConfig} from "../../game/classes/battle/CreateBattle.js";
import {Notify, QScrollArea} from "quasar";
import BattleStartDialogCreature from "./BattleStartDialogCreature.vue";

const router = useRouter()

const gameStore = useGameStore()
const options = computed(() => gameStore.currentLocation.options)
const isInDialog = computed(() => !!gameStore.currentDialogNpc)
const battleStore = useBattleStore()

const selectedCreatureId = computed(() => gameStore.selectedLibraryCreatureId)

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

const selectCreature = (id) => {
    gameStore.selectLibraryCreatureId(id)
}

</script>

<template>
    <div class="flex flex-col h-full">
        <div class="text-accent-foreground" style="max-width: 350px">
            <q-list bordered separator>
                <q-item clickable v-ripple
                        to="world">
                    <q-item-section>Выйти</q-item-section>
                </q-item>
            </q-list>
        </div>
        <!-- Заголовок -->
        <div class="font-oldstandardtt q-px-md q-pt-md text-primary-foreground">
            Ваши существа
        </div>

        <!-- Основной контейнер с фильтрами и списком -->
        <div class="flex flex-col flex-grow q-pa-md text-accent-foreground">
            <!-- Фильтры -->
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

            <!-- Контейнер для списка существ -->
            <div v-if="filteredCreatures.length" class="flex-grow min-h-0">
                <QScrollArea class="h-full">
                    <q-list bordered class="bg-transparent">
                        <BattleStartDialogCreature
                            v-for="(creature, index) in filteredCreatures"
                            :key="creature.id"
                            :creature="creature"
                            :active="selectedCreatureId === creature.id"
                            @click="selectCreature(creature.id)"
                            direction="right"
                        />
                    </q-list>
                </QScrollArea>
            </div>

            <!-- Сообщение, если существ нет -->
            <div v-else class="flex items-center justify-center h-full">
                У вас нет существ...
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Дополнительные стили не требуются */
</style>