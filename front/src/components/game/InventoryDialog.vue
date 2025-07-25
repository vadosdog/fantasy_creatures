<script setup>
import {computed, ref} from 'vue';
import {useGameStore} from "../../store/game.js";

defineProps({
    modelValue: Boolean
});

defineEmits(['update:modelValue']);

const inventoryTabModel = ref('shards');
const inventoryTabs = ref([
    {label: 'Осколки', name: 'shards'},
    {label: 'Ресурсы', name: 'resources'},
]);

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
const resources = computed(() => gameStore.inventoryResources)

// Статистика
const totalShards = computed(() => gameStore.inventoryShards.length);
const commonCount = computed(() => gameStore.inventoryShards.filter(s => s.rarity === 'common').length);
const rareCount = computed(() => gameStore.inventoryShards.filter(s => s.rarity === 'rare').length);
const legendaryCount = computed(() => gameStore.inventoryShards.filter(s => s.rarity === 'legendary').length);
</script>

<template>
    <q-dialog
        :model-value="modelValue"
        @update:model-value="val => $emit('update:modelValue', val)"
        class="text-primary-foreground"
    >
        <q-card class="flex column" style="width: 600px">
            <q-toolbar>
                <q-tabs
                    v-model="inventoryTabModel"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                    no-caps
                >
                    <q-tab
                        v-for="tab in inventoryTabs"
                        :key="tab.name"
                        :label="tab.label"
                        :name="tab.name"
                    />
                </q-tabs>
                <q-space/>
                <q-btn flat round dense icon="close" v-close-popup/>
            </q-toolbar>

            <q-tab-panels
                v-model="inventoryTabModel"
                animated
            >
                <q-tab-panel name="shards" class="column no-padding">
                    <q-card-section class="q-pb-none">
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

                    </q-card-section>
                    <q-card-section style="max-height: 50vh; min-height: 30vh" class="scroll">
                        <!-- Сетка осколков -->
                        <div class="row q-col-gutter-sm">
                            <div
                                v-for="(shard, index) in filteredShards"
                                :key="index"
                                class="col-xs-2"
                            >
                                <q-card class="">
                                    <q-img :src="shard.img" no-native-menu/>
                                    <q-badge class="absolute-bottom-right text-subtitle2"
                                             :label="`${shard.amount} шт`"/>
                                    <q-tooltip>
                                        <b>{{ shard.name }}</b>
                                        <div v-if="shard.description">{{shard.description}}</div>
                                    </q-tooltip>
                                </q-card>
                            </div>
                        </div>
                    </q-card-section>

                </q-tab-panel>
                <q-tab-panel name="resources" class="column no-padding">
                    <q-card-section style="max-height: 50vh; min-height: 30vh" class="scroll">
                        <!-- Сетка осколков -->
                        <div class="row q-col-gutter-sm">
                            <div
                                v-for="(item, index) in resources"
                                :key="index"
                                class="col-xs-2"
                            >
                                <q-card class="">
                                    <q-img :src="item.img" no-native-menu/>
                                    <q-badge class="absolute-bottom-right text-subtitle2"
                                             :label="`${item.amount} шт`"/>
                                    <q-tooltip>
                                        <b>{{ item.name }}</b>
                                        <div v-if="item.description">{{item.description}}</div>
                                    </q-tooltip>
                                </q-card>
                            </div>
                        </div>
                    </q-card-section>

                </q-tab-panel>
            </q-tab-panels>
            <q-card-section>
                <!-- Статусная строка -->
                <div class="row justify-between" v-if="inventoryTabModel === 'shards'">
                    <div>Всего: {{ totalShards }}</div>
                    <div>Обычн: {{ commonCount }}</div>
                    <div>Редк: {{ rareCount }}</div>
                    <div>Легенд: {{ legendaryCount }}</div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style scoped>

</style>