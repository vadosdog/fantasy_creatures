<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {useGameStore} from '../store/game.js';
import WorldLeftDrawer from "../components/game/WorldLeftDrawer.vue";
import WorldRightDrawer from "../components/game/WorldRightDrawer.vue";
import BattleStartDialog from "../components/game/BattleStartDialog.vue";
import {getElementIcon, getEmotionIcon, getShapeIcon} from "../game/classes/iconHelper.js";

const emit = defineEmits([
    'current-active-scene',
    'update-footer',
    'update-left-drawer',
    'update-right-drawer',
    'update-header'
]);

const gameStore = useGameStore();

// Вычисляемые свойства
const locationName = computed(() => gameStore.currentLocation.name);
const locationImage = computed(() => './assets/locations/' + gameStore.currentLocation.id + '.png');
const locationDescription = computed(() => gameStore.currentLocation.description);
const dialog = computed(() => gameStore.currentDialog);

const exploration = computed(() => gameStore.currentLocation.exploration);
const explorationEnabled = computed(() => gameStore.explorationEnabled);

// Таймер
let explorationTimer = null;

const startExplorationTimer = () => {
    if (explorationTimer) clearTimeout(explorationTimer);

    // const randomDelay = Math.floor(Math.random() * 10000) + 1000; // 1-10 секунд
    const randomDelay = 1000

    explorationTimer = setTimeout(() => {
        if (explorationEnabled.value) {
            const variant = weightedRandomChoice(exploration.value.variants)
            openStartBattleDialog(variant.config)
            toggleExploration()
        }
    }, randomDelay);
};

function weightedRandomChoice(items) {
    if (!items || items.length === 0) return null;

    items = items.filter(i => !i.disabled)

    // Суммируем все веса (chance)
    const totalWeight = items.reduce((sum, item) => sum + (item.chance || 0), 0);

    // Если все веса нулевые — возвращаем случайный элемент
    if (totalWeight === 0) {
        return items[Math.floor(Math.random() * items.length)];
    }

    // Генерируем случайное число от 0 до totalWeight
    const random = Math.random() * totalWeight;

    // Идём по массиву, накапливаем веса, пока не достигнем случайной точки
    let cumulativeWeight = 0;
    for (const item of items) {
        cumulativeWeight += item.chance || 0;
        if (random < cumulativeWeight) {
            return item;
        }
    }

    // На всякий случай (из-за погрешности float) — возвращаем последний элемент
    return items[items.length - 1];
}

const stopExplorationTimer = () => {
    if (explorationTimer) {
        clearTimeout(explorationTimer);
        explorationTimer = null;
    }
};

// Запуск/остановка таймера при включении/выключении исследования
watch(explorationEnabled, (enabled) => {
    if (enabled) {
        startExplorationTimer();
    } else {
        stopExplorationTimer();
    }
});

// Сброс таймера при смене локации
watch(
    () => gameStore.currentLocation.id,
    () => {
        stopExplorationTimer();
    }
);

onMounted(() => {
    emit('update-footer', null);
    emit('update-header', null);
    emit('update-left-drawer', WorldLeftDrawer);
    emit('update-right-drawer', WorldRightDrawer);

    // Если исследование уже включено (например, после HMR), запустим таймер
    if (explorationEnabled.value) {
        startExplorationTimer();
    }
});

onUnmounted(() => {
    stopExplorationTimer();
});

function toggleExploration() {
    gameStore.toggleExploration();
}

const explorationTooltip = ref(false)
const battleStartDialogOpen = ref(false);
const battleStartConfig = ref({})

function openStartBattleDialog(config) {
    config = Object.assign({}, config)
    config.playerCountLimit = exploration.value.playerCountLimit
    config.playerLevelLimit = exploration.value.playerLevelLimit

    config.dominantElement = exploration.value.dominantElement
    config.dominantShape = exploration.value.dominantShape
    config.dominantEmotion = exploration.value.dominantEmotion
    battleStartDialogOpen.value = true
    battleStartConfig.value = config
}
</script>

<template>
    <BattleStartDialog v-if="exploration" v-model="battleStartDialogOpen" :config="battleStartConfig"/>
    <q-dialog v-model="explorationTooltip" class="text-background" v-if="exploration">
        <q-card>
            <q-card-section>
                <div class="text-h6">Ограничения исследования</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                Вы чувствуете, что хрупкое эхо выдержит до <b>{{
                    exploration.playerCountLimit
                }}</b> существ уровня не выше
                <b>{{ exploration.playerLevelLimit }}</b>.
                <div v-if="exploration.dominantElement
                    || exploration.dominantShape
                    || exploration.dominantEmotion"
                >
                    Во снах преобладают:
                    <template v-if="exploration.dominantElement"><q-avatar size="xs"><img :src="getElementIcon(exploration.dominantElement.element)" alt=""/></q-avatar></template>
                    <template v-if="exploration.dominantEmotion"><q-avatar size="xs"><img :src="getEmotionIcon(exploration.dominantEmotion.emotion)" alt=""/></q-avatar></template>
                    <template v-if="exploration.dominantShape"><q-avatar size="xs"><img :src="getShapeIcon(exploration.dominantShape.shape)" alt=""/></q-avatar></template>
                </div>
                <div v-if="exploration.creature_types && exploration.creature_types.length">
                    Кроме того, эхо этой локации откликается только на существ с осколками:
                    <b>{{ exploration.creature_types.join(', ') }}</b>.
                </div>
            </q-card-section>
            <q-card-section>
                <q-markup-table>
                    <thead>
                    <tr>
                        <th class="text-left">Шанс</th>
                        <th class="text-left">Тип</th>
                        <th class="text-left">Кошмары</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="variant in exploration.variants">
                        <td class="text-left">{{ variant.chance * 100 }}%</td>
                        <td class="text-left">{{ {battle: 'Битва'}[variant.type] }}
                            <template v-if="variant.disabled"><br>(Заблокировано)</template>
                        </td>
                        <td class="text-left">
                            <template v-if="variant.type === 'battle'">
                                Cуществ: <span v-if="variant.config.enemyCount[0] === variant.config.enemyCount[1]">
                                    {{ variant.config.enemyCount[0] }}
                                </span>
                                <span v-else>
                                    {{ variant.config.enemyCount[0] }} - {{ variant.config.enemyCount[1] }}
                                </span>,<br>
                                Уровень: <span v-if="variant.config.enemyLevel[0] === variant.config.enemyLevel[1]">
                                    {{ variant.config.enemyLevel[0] }}
                                </span>
                                <span v-else>
                                    {{ variant.config.enemyLevel[0] }} - {{ variant.config.enemyLevel[1] }}
                                </span>
                            </template>
                        </td>
                    </tr>
                    </tbody>
                </q-markup-table>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Понял" color="primary" v-close-popup/>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-page>
        <q-img :src="locationImage"
               fit="cover">
            <img :src="dialog.image" v-if="dialog" class="absolute-top-right" style="height: 100%"/>
            <div class="absolute-bottom text-subtitle1 text-center">
                <div>
                    <template v-if="dialog">{{ dialog.phrase }}</template>
                    <template v-else-if="explorationEnabled">
                        Вы чувствуете Эхо — застывшие в материи обрывки снов богов. Концентрируясь на этих вибрациях
                        прошлого, вы начинаете поиск ценных осколков памяти... Но будьте готовы: некоторые воспоминания
                        могут оказаться Кошмарами.
                    </template>
                    <template v-else>{{ locationDescription }}</template>
                </div>
                <div v-if="dialog">
                    <q-btn
                        v-for="option in dialog.options"
                        size="md" outline no-caps
                        class="font-neucha text-sx border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 q-ma-sm"
                        :class="{
                            'font-neucha': option.type === 'phrase',
                            'font-scada': option.type !== 'phrase',
                        }"
                        @click="gameStore.selectDialogOption(option)"
                    >
                        <q-icon v-if="option.icon" :name="option.icon" class="mr-2"/>
                        {{ option.label }}
                    </q-btn>
                </div>
            </div>

            <!-- Вращающаяся лупа (только при активном исследовании) -->
            <div
                v-if="explorationEnabled"
                class="absolute-center background-none"
                style="background: none !important;"
            >
                <q-circular-progress
                    show-value
                    indeterminate
                    size="75px"
                    :thickness="0.6"
                    color="primary"
                    center-color="grey-8"
                >
                    <q-icon name="search"/>
                </q-circular-progress>
            </div>
        </q-img>

        <!-- Имя локации -->
        <div class="location-name absolute-top-left q-ma-md">
            {{ dialog ? dialog.name : locationName }}
        </div>

        <!-- UI исследования -->
        <div class="absolute-top-right q-ma-md flex flex-col items-end gap-2">
            <!-- Статус: доступно ли исследование -->
            <div v-if="exploration" class="text-white text-sm font-scada">
                {{ explorationEnabled ? 'Идет Исследование Эха Снов' : 'Доступно исследование' }}
                <q-icon size="xs" name="help" style="cursor: pointer" @click="explorationTooltip = true"/>
            </div>

            <!-- Кнопка включения/выключения исследования -->
            <q-btn
                v-if="exploration"
                :label="explorationEnabled ? 'Завершить исследование' : 'Исследовать Эхо Снов'"
                color="accent"
                unelevated
                no-caps
                size="md"
                class="font-scada min-w-40 q-py-xs"
                @click="toggleExploration"
            />
        </div>
    </q-page>
</template>

<style scoped>
.location-name {
    @apply bg-primary font-oldstandardtt text-primary-foreground;
    font-size: 20px;
    border-radius: 4px;
    padding: 2px 16px;
}

/* Анимация вращения лупы */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>