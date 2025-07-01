<script setup>
import {ref, computed} from 'vue';
import {useGameStore} from "../../store/game.js";
import {useCraftStore} from "../../store/craft.js";

// Фильтры
const selectedElement = ref({label: 'Любой', value: null});
const selectedRarity = ref({label: 'Любой', value: null});
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

const rarityOptions = [
    {label: 'Любой', value: null},
    {label: 'Обычный', value: 'common'},
    {label: 'Редкий', value: 'rare'},
    {label: 'Легендарный', value: 'legendary'}
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
const craftStore = useCraftStore()

// Фильтрация осколков
const filteredShards = computed(() => {
    return gameStore.inventoryShards.filter(shard => {
        // Фильтр по стихии
        if (
            selectedElement.value
            && selectedElement.value.value
            && shard.shardType !== 'element'
            && shard.code !== selectedElement.value.value
        ) {
            return false;
        }

        // Фильтр по редкости
        if (selectedRarity.value && selectedRarity.value.value && shard.rarity !== selectedRarity.value.value) {
            return false;
        }

        // Фильтр по форме
        if (
            selectedShape.value
            && selectedShape.value.value
            && shard.shardType !== 'shape'
            && shard.code !== selectedShape.value.value
        ) {
            return false;
        }

        // Фильтр по эмоции
        if (
            selectedEmotion.value
            && selectedEmotion.value.value
            && shard.shardType !== 'emotion'
            && shard.code !== selectedEmotion.value.value
        ) {
            return false;
        }

        // Поиск по названию
        if (searchQuery.value &&
            !shard.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
            return false;
        }

        return true;
    });
});

// Статистика
const totalShards = computed(() => gameStore.inventoryShards.length);
const commonCount = computed(() => gameStore.inventoryShards.filter(s => s.rarity === 'common').length);
const rareCount = computed(() => gameStore.inventoryShards.filter(s => s.rarity === 'rare').length);
const legendaryCount = computed(() => gameStore.inventoryShards.filter(s => s.rarity === 'legendary').length);

// Выбор осколка
const emit = defineEmits(['select-shard']);

const selectShard = (shard) => {
     if (selectedShards.value.some(s => s?.id === shard?.id)) {
        craftStore.selectShard(shard.shardType, null)
    } else {
        craftStore.selectShard(shard.shardType, Object.assign({}, shard))
    }
};

const selectedShards = computed(() => craftStore.selectedShards)
</script>

<template>
    <div class="column full-height select-none text-muted-foreground">
        <!-- Панель фильтров -->
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
                    v-model="selectedRarity"
                    :options="rarityOptions"
                    label="Редкость"
                    dense
                    outlined
                    class="col"
                />
            </div>

            <div class="row q-gutter-sm q-mt-sm">
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
                label="Поиск осколков"
                dense
                outlined
                class="q-mt-sm"
            >
                <template v-slot:append>
                    <q-icon name="search"/>
                </template>
            </q-input>
        </div>

        <!-- Сетка осколков -->
        <q-scroll-area class="col q-pa-sm">
            <div class="row q-col-gutter-sm">
                <div
                    v-for="(shard, index) in filteredShards"
                    :key="index"
                    class="col-xs-4"
                >
                    <q-card @click="selectShard(shard)"
                            class="cursor-pointer q-ma-sm"
                            :class="{
        'shadow-xl ring-4 ring-primary': selectedShards.some(s => s?.id === shard?.id)
    }"
                    >
                        <q-img :src="shard.img" no-native-menu>
                            <q-tooltip>
                                {{ shard.name }}
                            </q-tooltip>
                        </q-img>
                        <q-badge class="absolute-bottom-right text-subtitle2" :label="`${shard.count} шт`"/>
                    </q-card>
                </div>
            </div>
        </q-scroll-area>

        <!-- Статусная строка -->
        <div class="q-pa-sm">
            <div class="row justify-between">
                <div>Всего: {{ totalShards }}</div>
                <div>Обычн: {{ commonCount }}</div>
                <div>Редк: {{ rareCount }}</div>
                <div>Легенд: {{ legendaryCount }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.full-height {
    height: 100%;
}
</style>