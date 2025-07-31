<script setup>
import {computed} from 'vue';
import {useGameStore} from "../../store/game.js";
import {useCraftStore} from "../../store/craft.js";

const gameStore = useGameStore();
const craftStore = useCraftStore();

// Группировка осколков по типам
const shardGroups = computed(() => {
    return {
        element: gameStore.inventoryShards.filter(s => s.shardType === 'element'),
        shape: gameStore.inventoryShards.filter(s => s.shardType === 'shape'),
        emotion: gameStore.inventoryShards.filter(s => s.shardType === 'emotion'),
    };
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
        craftStore.selectShard(shard.shardType, null);
    } else {
        craftStore.selectShard(shard.shardType, Object.assign({}, shard));
    }
};

const selectedShards = computed(() => craftStore.selectedShards);

// Названия групп
const groupTitles = {
    element: "Стихия",
    shape: "Форма",
    emotion: "Эмоция"
};
</script>

<template>
    <div class="column full-height select-none text-muted-foreground">
        <!-- Кнопка выхода -->
        <div class="q-pa-md">
            <q-list bordered separator>
                <q-item clickable v-ripple to="world">
                    <q-item-section>Выйти</q-item-section>
                </q-item>
            </q-list>
        </div>

        <!-- Секции осколков -->
        <q-scroll-area class="col q-pa-sm">
            <div class="q-gutter-y-md">
                <div v-for="(shards, type) in shardGroups" :key="type" class="q-mb-md">
                    <div class="text-subtitle1 q-mb-xs">{{ groupTitles[type] }}</div>

                    <div v-if="shards.length === 0" class="text-center q-py-sm text-caption">
                        Нет осколков
                    </div>

                    <div class="row q-col-gutter-sm q-px-xs">
                        <div
                            v-for="(shard, index) in shards"
                            :key="index"
                            class="col-xs-4"
                        >
                            <q-card
                                @click="selectShard(shard)"
                                class="cursor-pointer"
                                :class="{
                  'shadow-xl ring-4 ring-primary': selectedShards.some(s => s?.id === shard?.id)
                }"
                            >
                                <q-img :src="shard.img" no-native-menu>
                                    <q-tooltip>
                                        {{ shard.name }}
                                    </q-tooltip>
                                </q-img>
                                <q-badge class="absolute-bottom-right text-subtitle2" :label="`${shard.amount} шт`"/>
                            </q-card>
                        </div>
                    </div>
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