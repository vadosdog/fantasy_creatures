<script setup>
import {ref, computed, onMounted} from "vue";
import WorldLeftDrawer from "../components/game/WorldLeftDrawer.vue";
import WorldRightDrawer from "../components/game/WorldRightDrawer.vue";
import {useGameStore} from "../store/game.js";
import LibraryLeftDrawer from "../components/game/LibraryLeftDrawer.vue";
import LibraryRightDrawer from "../components/game/LibraryRightDrawer.vue";
import EffectSpan from "../components/game/EffectSpan.vue";
import {creaturesLib, getActionsByLevel} from "../database/creaturesLib.js";
import {Notify} from "quasar";

const emit = defineEmits(['current-active-scene', 'update-footer', 'update-left-drawer', 'update-right-drawer', 'update-header']);

onMounted(() => {
    emit('update-footer', null)
    emit('update-header', null)
    emit('update-left-drawer', LibraryLeftDrawer)
    emit('update-right-drawer', LibraryRightDrawer)

});


const gameStore = useGameStore()

const selectedCreature = computed(() => gameStore.creatures.find(creature => creature.id === gameStore.selectedLibraryCreatureId));

const selectedSkills = computed(() => selectedCreature.value.actions.map(({id}) => id)); // Выбранные навыки

// Характеристики для прокачки
const stats = computed(() => {
    const levelModifier = Math.pow(2, (selectedCreature.value.level - 1) / 7.5);
    return [
        {
            key: 'maxHealthStat',
            label: 'Здоровье',
            description: 'Максимальное количество HP',
            baseValue: Math.round(selectedCreature.value.baseMaxHealthStat * levelModifier),
            manualValue: selectedCreature.value.manualMaxHealthStat || 0,
            totalValue: Math.round(selectedCreature.value.baseMaxHealthStat * levelModifier) + (selectedCreature.value.manualMaxHealthStat || 0),
            canUpgrade: true
        },
        {
            key: 'attackStat',
            label: 'Атака',
            description: 'Сила физических атак',
            baseValue: Math.round(selectedCreature.value.baseAttackStat * levelModifier),
            manualValue: selectedCreature.value.manualAttackStat || 0,
            totalValue: Math.round(selectedCreature.value.baseAttackStat * levelModifier) + (selectedCreature.value.manualAttackStat || 0),
            canUpgrade: true
        },
        {
            key: 'defenseStat',
            label: 'Защита',
            description: 'Снижение получаемого урона',
            baseValue: Math.round(selectedCreature.value.baseDefenseStat * levelModifier),
            manualValue: selectedCreature.value.manualDefenseStat || 0,
            totalValue: Math.round(selectedCreature.value.baseDefenseStat * levelModifier) + (selectedCreature.value.manualDefenseStat || 0),
            canUpgrade: true
        },
        {
            key: 'willStat',
            label: 'Воля',
            description: 'Устойчивость к эффектам',
            baseValue: Math.round(selectedCreature.value.baseWillStat * levelModifier),
            manualValue: selectedCreature.value.manualWillStat || 0,
            totalValue: Math.round(selectedCreature.value.baseWillStat * levelModifier) + (selectedCreature.value.manualWillStat || 0),
            canUpgrade: true
        },
        {
            key: 'initiativeStat',
            label: 'Инициатива',
            description: 'Порядок хода в бою',
            baseValue: Math.round(selectedCreature.value.baseInitiativeStat * levelModifier),
            manualValue: selectedCreature.value.manualInitiativeStat || 0,
            totalValue: Math.round(selectedCreature.value.baseInitiativeStat * levelModifier) + (selectedCreature.value.manualInitiativeStat || 0),
            canUpgrade: true
        },
        {
            key: 'speedStat',
            label: 'Скорость',
            description: 'Количество действий за ход',
            baseValue: selectedCreature.value.baseSpeedStat,
            manualValue: 0,
            totalValue: selectedCreature.value.speedStat,
            canUpgrade: false
        },
        {
            key: 'maxPP',
            label: 'Макс. PP',
            description: 'Максимальный запас энергии',
            baseValue: Math.round(selectedCreature.value.baseMaxPP * levelModifier),
            manualValue: selectedCreature.value.manualMaxPP || 0,
            totalValue: Math.round(selectedCreature.value.baseMaxPP * levelModifier) + (selectedCreature.value.manualMaxPP || 0),
            canUpgrade: true
        },
        {
            key: 'ppRegen',
            label: 'Регенерация PP',
            description: 'Восстановление энергии за ход',
            baseValue: Math.round(selectedCreature.value.basePpRegen * levelModifier),
            manualValue: selectedCreature.value.manualPpRegen || 0,
            totalValue: Math.round(selectedCreature.value.basePpRegen * levelModifier) + (selectedCreature.value.manualPpRegen || 0),
            canUpgrade: true
        }
    ]
});

// Колонки для таблицы характеристик
const statColumns = ref([
    {name: 'name', align: 'left', width: '40%'},
    {name: 'value', align: 'left', width: '50%'},
    {name: 'actions', align: 'right', width: '10%'}
]);

// Проверка возможности прокачки
function canUpgrade(stat) {
    return (
        stat.canUpgrade &&
        (selectedCreature.value.manualPoints || 0) > 0 &&
        stat.manualValue < 100
    );
}

// Прокачка характеристики
function upgradeStat(statKey) {
    gameStore.upgradeStat(selectedCreature.value, statKey);
}

function recalc() {
    gameStore.recalcStats(selectedCreature.value.id);
}

// Доступные навыки (заглушка)
const availableSkills = computed(() => getActionsByLevel(
    selectedCreature.value.element,
    selectedCreature.value.shape,
    selectedCreature.value.emotion,
    selectedCreature.value.level
));

const levelCost = computed(() => 50 + 10 * Math.floor(selectedCreature.value.level / 3))

// Методы
function levelUp() {
    if (selectedCreature.value.level >= maxLevel.value) {
        return Notify.create({
            message: 'Необходимо больше учавствовать в битвах',
            color: 'negative', // красный цвет
            icon: 'error',
            position: 'top-right',
            timeout: 3000, // исчезнет через 3 секунды
            closeBtn: true // кнопка закрытия
        })
    }

    if (!gameStore.hasInventoryItem('memory_shard', levelCost.value)) {
        return Notify.create({
            message: 'Необходимо больше осколков памяти',
            color: 'negative', // красный цвет
            icon: 'error',
            position: 'top-right',
            timeout: 3000, // исчезнет через 3 секунды
            closeBtn: true // кнопка закрытия
        })
    }

    return gameStore.creatureLevelUp(selectedCreature.value?.id)
}

function toggleSkill(skill) {
    return gameStore.toggleSkill(selectedCreature.value?.id, skill)
}

// Вспомогательные функции из CreaturesDialog.vue
function creatureImage(creature) {
    if (!creature) return '';
    return 'assets/creatures/basic/' + creature.number + '.png';
}

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

const evolutionGroups = Object.values(creaturesLib).sort((a, b) => a.number - b.number).map((creature) => {
    const inventoryCreatures = gameStore.creatures.filter(c => c.number === creature.number)
    const maxCreature = inventoryCreatures.reduce((aC, bC) => {
        if (!aC) {
            return bC
        }
        if (aC.level > bC.level) {
            return aC
        } else {
            return bC
        }
    }, null)

    return {
        id: creature.number,
        creatures: [
            gameStore.knownCreatures.includes(creature.number) ? creature : null,
            null,
            null,
            null
        ],
        components: {element: creature.element, shape: creature.shape, emotion: creature.emotion},
        count: inventoryCreatures.length,
        maxCreature: maxCreature,
    }
})

// Вычисление свойств для каждой группы
evolutionGroups.forEach(group => {
    // Фильтруем известных существ
    const knownCreatures = group.creatures.filter(c => c !== null);

    // Последнее известное существо
    group.lastKnown = knownCreatures.length > 0
        ? knownCreatures[knownCreatures.length - 1]
        : null;

    // Известные существа, кроме последнего
    group.knownExceptLast = knownCreatures.length > 1
        ? knownCreatures.slice(0, -1)
        : [];

    // Количество неизвестных существ
    group.unknownCount = group.creatures.filter(c => c === null).length;
});

// Выбор группы
function selectCreature(id) {
    gameStore.selectLibraryCreatureId(id);
}

const nextLevelExperience = computed(() => {
    // в теории может быть разные для разных существ
    return (selectedCreature.value.level - 4) * 600
})

const maxLevel = computed(() => {
    // в теории может быть разные для разных существ
    return Math.min(9, 5 + Math.floor((selectedCreature.value?.experience || 0) / 600)) //TODO пока ограничивает на 9, тк нет эволюции
})

const memoryShards = computed(() => gameStore.inventory.find((i) => i.id === 'memory_shard')?.amount || 0)


function getActionTypeIcon(action) {
    if (action.range === 0) {
        return '🛡️'
    }

    return {"melee": '🗡️', 'ranged': '🏹', 'treat': '❤'}[action.actionType]
}

function getActionTypeLabel(action) {
    if (action.range === 0) {
        return 'Эффект на себя'
    }

    return {"melee": 'Ближняя атака', 'ranged': 'Дистанционная атака', 'treat': 'Лечение/Бафы'}[action.actionType]
}

const levelUpButtonLabel = computed(() => selectedCreature.value.level < maxLevel.value ? 'Повысить: '+ levelCost.value + ' ОП' : (selectedCreature.value.level === 9 ? 'MAX' : `Требуется ${nextLevelExperience.value} ЭБ`))

</script>
<template>
    <q-page class="text-accent-foreground">
        <div v-if="selectedCreature">
            <q-btn
                icon="arrow_back"
                flat
                round
                dense
                @click="() => selectCreature(null)"
                class="q-ma-md absolute-top-left z-50"
            />
            <!-- Шапка с основными данными -->
            <q-card class="q-mb-md q-pl-md q-pr-md">
                <q-card-section class="row">
                    <q-img
                        :src="creatureImage(selectedCreature)"
                        style="transform: scaleX(-1);"
                        class="q-pr-md col-3"
                    />

                    <div class="col-3">
                        <div>
                            <div class="text-h4">{{ selectedCreature.name }}</div>
                            <div class="text-subtitle1">№{{ selectedCreature.number }}</div>
                        </div>

                        <div class="row items-center justify-between">
                            <div>
                                <div>Уровень: <strong>{{ selectedCreature.level }} / {{ maxLevel }}</strong></div>
                                <div>Эхо Битв (ЭБ): {{ selectedCreature.experience || 0 }}</div>
                                <div>Сила Пробуждения (СП): {{ selectedCreature.manualPoints || 0 }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="text-h6 q-mb-md">Уровень</div>

                        <q-badge color="primary absolute-top-right q-ma-md">
                            Осколки Памяти (ОП): {{ memoryShards }}
                        </q-badge>

                        <div class="row items-center q-gutter-md">
                            <div class="text-h5">{{ selectedCreature.level }}</div>

                            <q-space/>

                            <q-btn
                                :label="levelUpButtonLabel"
                                color="primary"
                                icon="arrow_upward"
                                @click="levelUp"
                            />
                        </div>
                    </div>
                </q-card-section>

            </q-card>

            <!-- Повышение уровня -->

            <!-- Прокачка характеристик -->
            <q-card class="q-mb-md">
                <q-card-section>
                    <div class="text-h6 q-mb-md">Характеристики</div>

                    <q-badge color="primary absolute-top-right q-ma-md">
                        Сила Пробуждения (СП): {{ selectedCreature.manualPoints || 0 }}
                    </q-badge>

                    <!-- Таблица характеристик -->
                    <div class="stats-list">
                        <div
                            v-for="stat in stats"
                            :key="stat.key"
                            class="stat-item row items-center"
                        >
                            <div class="col-7 stat-name">
                                <div class="text-weight-medium">{{ stat.label }}</div>
                                <div class="text-caption text-grey">{{ stat.description }}</div>
                            </div>

                            <div class="col-3 stat-values">
                                <div class="formula">
                                    <span v-if="stat.manualValue">{{ stat.baseValue }}</span>
                                    <span v-if="stat.manualValue" class="operator">+</span>
                                    <span v-if="stat.manualValue" class="manual-value">{{ stat.manualValue }}</span>
                                    <span class="operator" v-if="stat.manualValue">=</span>
                                    <span class="total-value">{{ stat.totalValue }}</span>
                                </div>
                            </div>

                            <div class="col-2 stat-actions text-right">
                                <q-btn
                                    v-if="canUpgrade(stat)"
                                    icon="add"
                                    size="xs"
                                    color="positive"
                                    round
                                    @click="upgradeStat(stat.key)"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="q-ma-md">
                        Временная кнопка для тестов. Если это будет в бою, напиши разрабам :)
                        <q-btn size="xs" @click="recalc()">Пересчитать</q-btn>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Выбор навыков -->
            <q-card>
                <q-card-section>
                    <div class="text-h6 q-mb-md">Навыки</div>
                    <div class="text-caption q-mb-md">
                        Выбрано: {{ selectedSkills.length }}/4
                        <q-badge v-if="selectedSkills.length === 4" color="red" class="q-ml-sm">
                            Максимум
                        </q-badge>
                    </div>

                    <div class="row q-col-gutter-md">
                        <div
                            v-for="skill in availableSkills"
                            :key="skill.id"
                            class="col-6"
                        >
                            <q-card
                                :class="['skill-card', { 'selected-skill': selectedSkills.includes(skill.id) }]"
                                @click="toggleSkill(skill)"
                            >
                                <q-card-section>
                                    <div class="row items-center">
                                        <q-icon
                                            :name="getActionIcon(skill).icon"
                                            :color="getActionIcon(skill).color"
                                            size="md"
                                            class="q-mr-sm"
                                        />

                                        <div class="text-subtitle1">{{ skill.name }}</div>
                                    </div>

                                    <!-- Блок PP и CD -->
                                    <div class="row q-mt-xs">
                                        <div class="col">
                                            <span
                                                :class="{'text-destructive': skill.pp > 0 && selectedCreature?.pp < skill.pp}">
                                              Стоимость PP: {{ skill.pp }}
                                            </span>
                                        </div>
                                        <div class="col text-right" v-if="skill.cooldown > 0">
                                            <span :class="{'text-destructive': skill.currentCooldown > 0}">
                                              Перезарядка (CD): {{ skill.currentCooldown || 0 }}/{{ skill.cooldown }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Иконка типа действия -->
                                    <div class="q-mt-xs">
                                        {{ getActionTypeIcon(skill) }}{{ getActionTypeLabel(skill) }}
                                        <span v-if="skill.range > 1" class="q-ml-xs">
                                            📏 Дальность {{ skill.range }}
                                          </span>
                                    </div>

                                    <!-- Урон, точность и крит -->
                                    <div class="row q-mt-xs text-caption">
                                        <div class="col">
                                            <div>🎯 Шанс попадания {{ (skill.hitChance * 100).toFixed(0) }}%</div>
                                            <div v-if="skill.critChance > 0">
                                                💢 Шанс критического урона {{ (skill.critChance * 100).toFixed(0) }}%
                                            </div>
                                        </div>
                                        <div class="col text-right">
                                            <div>💥 Базовый урон {{ skill.baseDamage }}</div>
                                        </div>
                                    </div>

                                    <!-- Эффекты -->
                                    <div class="q-mt-sm" v-if="skill.effects.length">
                                        <q-separator class="bg-border q-mb-sm"/>
                                        <div class="row">
                                            <q-chip
                                                v-for="effect in skill.effects"
                                                :key="effect.type"
                                                size="sm"
                                                class="q-mr-xs q-mb-xs"
                                            >
                                                <EffectSpan :effect="effect"/>
                                                <span v-if="effect.duration > 1" class="q-pl-xs">x{{
                                                        effect.duration
                                                    }}</span>
                                                <span class="q-pl-xs">🎲 Шанс {{
                                                        (effect.chance * 100).toFixed(0)
                                                    }}%</span>
                                            </q-chip>
                                        </div>
                                    </div>

                                    <!-- Дополнительная информация -->
                                    <div class="q-mt-sm text-caption" v-if="skill.description">
                                        {{ skill.description }}
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
        <div v-else class="q-pa-md">
            <!-- Заголовок -->
            <div class="text-h4 q-mb-md text-foreground">Коллекция существ</div>

            <!-- Сетка групп существ -->
            <div class="row q-col-gutter-lg">
                <div
                    v-for="(group, index) in evolutionGroups"
                    :key="index"
                    class="col-xs-6 col-sm-4 col-md-3"
                >
                    <q-card
                        class="evolution-group-card cursor-pointer"
                        @click="group.maxCreature && selectCreature(group.maxCreature.id)"
                    >
                        <div class="relative-position" style="height: 200px">
                            <!-- Предыдущие известные эволюции -->
                            <div
                                v-for="(creature, i) in group.knownExceptLast"
                                :key="i"
                                class="absolute-left"
                                :style="{
                left: `${10 + i * 5}%`,
                top: `${20 + i * 5}%`,
                zIndex: 10 - i,
                opacity: 0.7 - i * 0.2,
                transform: `scale(${0.7 - i * 0.1})`
              }"
                            >
                                <q-img
                                    :src="creatureImage(creature)"
                                    style="width: 80px; height: 80px"
                                />
                            </div>

                            <!-- Главное существо группы -->
                            <div v-if="group.lastKnown" class="absolute-center" style="z-index: 20">
                                <q-img
                                    :src="creatureImage(group.lastKnown)"
                                    style="width: 120px; height: 120px"
                                />
                            </div>
                            <div v-else class="absolute-center" style="z-index: 20">
                                <div class="unknown-creature">
                                    <q-icon name="help" size="xl"/>
                                </div>
                            </div>

                            <!-- Следующие неизвестные эволюции -->
                            <div
                                v-for="(_, i) in group.unknownCount"
                                :key="'unknown-'+i"
                                class="absolute-right"
                                :style="{
                right: `${10 + i * 5}%`,
                top: `${20 + i * 5}%`,
                zIndex: 15 - i,
                opacity: 0.5,
                transform: `scale(${0.6 - i * 0.1})`
              }"
                            >
                                <div class="unknown-creature">
                                    <q-icon name="help" size="lg"/>
                                </div>
                            </div>

                            <!-- Информация о группе -->
                            <div class="absolute-bottom-left q-pa-sm" style="z-index: 30">
                                <div class="row q-gutter-xs">
                                    <q-badge :label="group.components.element" color="red"/>
                                    <q-badge :label="group.components.shape" color="blue"/>
                                    <q-badge :label="group.components.emotion" color="green"/>
                                </div>
                            </div>

                            <!-- Количество и уровень -->
                            <q-badge class="absolute-bottom-right text-subtitle2">
                                <div v-if="group.count > 0" class="text-subtitle1">
                                    <q-icon name="person"/>
                                    {{ group.count }}
                                    <span class="q-ml-sm">Lv. {{ group.maxCreature?.level }}</span>
                                </div>
                                <div v-else class="text-caption">Нету</div>

                            </q-badge>
                        </div>
                    </q-card>
                </div>
            </div>
        </div>
    </q-page>

</template>
<style scoped>
.location-name {
    @apply absolute;
    @apply bg-primary;
    @apply font-oldstandardtt;
    @apply text-primary-foreground;

    font-size: 20px;
    border-radius: 4px;
    padding: 2px 16px;
    top: 16px;
    left: 16px;
}

.skill-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.skill-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.selected-skill {
    border: 2px solid #1976d2;
    background-color: rgba(25, 118, 210, 0.05);
}

.q-table td {
    padding: 12px 8px;
}

.evolution-group-card {
    transition: all 0.3s ease;
    height: 220px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.evolution-group-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-color: hsl(var(--primary));
}

.unknown-creature {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    border: 2px dashed rgba(255, 255, 255, 0.3);
}

.stats-table {
    border-collapse: separate;
    border-spacing: 0 8px;
}

.stats-table::before {
    display: none;
}

.stat-name {
    padding: 8px 16px;
    vertical-align: top;
}

.stat-values {
    padding: 8px 16px;
    vertical-align: middle;
}

.stat-actions {
    padding: 8px 16px;
    vertical-align: middle;
}

.formula {
    font-family: monospace;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
    text-align: right;
}

.operator {
    margin: 0 4px;
    color: #aaa;
}

.manual-value {
    color: #4caf50;
    font-weight: bold;
}

.total-value {
    font-weight: bold;
    margin-left: 4px;
}
</style>