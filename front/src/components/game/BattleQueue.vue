<script setup>
import {ref, computed, watch, nextTick} from 'vue'
import {useBattleStore} from "../../store/battle.js";
import {QScrollArea, QIcon, QLinearProgress, useQuasar} from 'quasar'
import {useGameStore} from "../../store/game.js";
import CreatureCard from "./CreatureCard.vue";

const battleStore = useBattleStore();
const gameStore = useGameStore()
const queueData = computed(() => battleStore.queueData)
const activeCreatureId = computed(() => battleStore.activeCreatureId)
const hoveredCreatureId = computed(() => gameStore.hoveredCreatureId)
const hoverTimer = ref(null);

// Обновляем флаг isActive для существ
const processedQueue = computed(() => {
    return queueData.value.filter(c => c.health > 0).map(creature => ({
        ...creature,
        isActive: creature.id === activeCreatureId.value
    }))
})

// Цвет рамки в зависимости от команды
const borderColor = (creature) => {
    return creature.direction === 'left'
        ? '#C10015'  // Красный для левых (врагов)
        : '#21ba45'; // Зеленый для правых (игрок)
}

// Refs для управления скроллом
const scrollArea = ref(null)
const creatureItems = ref([])

// Прокрутка к активному существу
const scrollToActiveCreature = async () => {
    await nextTick()

    if (!scrollArea.value || processedQueue.value.length === 0) return

    const scrollTarget = scrollArea.value.getScrollTarget()
    if (!scrollTarget) return

    // Находим индекс активного существа
    const activeIndex = processedQueue.value.findIndex(c => c.isActive)
    if (activeIndex === -1) return

    // Получаем все элементы существ
    const items = [...creatureItems.value].filter(el => el)

    if (items.length === 0) return

    // Рассчитываем ширину одного элемента (карточки существа)
    const itemWidth = items[0].offsetWidth +
        parseInt(getComputedStyle(items[0]).marginLeft) +
        parseInt(getComputedStyle(items[0]).marginRight)

    // Рассчитываем желаемую позицию скролла
    // Чтобы активное существо было вторым на экране (смещение на 1 элемент слева)
    const targetPosition = Math.max(0, (activeIndex - 1) * itemWidth)

    // Устанавливаем позицию скролла с плавной анимацией
    scrollArea.value.setScrollPosition('horizontal', targetPosition, 300)
}

// Следим за изменениями активного существа
watch(activeCreatureId, scrollToActiveCreature)

// Инициализация при монтировании
watch(processedQueue, scrollToActiveCreature, {immediate: true})


const hoverCreature = (creature) => {
    gameStore.setHoveredCreature(creature.id);
};

const clearHoverCreature = () => {
    gameStore.setHoveredCreature(null);
};
</script>

<template>
    <QScrollArea
        ref="scrollArea"
        style="width: 100%; height: 100%"
        class="q-pa-sm"
        horizontal
    >
        <TransitionGroup
            name="queue"
            tag="div"
            class="queue-list"
        >
            <div
                v-for="(creature, index) in processedQueue"
                :key="creature.id"
                :ref="el => creatureItems[index] = el"
                class="creature-item"
                :class="{
                    'active-creature': creature.isActive,
                    'dead-creature': creature.health <= 0,
                    'bg-yellow-2': hoveredCreatureId === creature.id,
                }"
                :style="{
                    borderColor: borderColor(creature),
                    transform: `scale(${creature.isActive ? 1.15 : 1})`
                }"

                @mouseenter="hoverCreature(creature)"
                @mouseleave="clearHoverCreature"
            >
                <q-tooltip
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[10, 10]"
                    :delay="1000"
                >
                    <CreatureCard
                        :creature="creature"
                        :key="creature.id"
                    />
                </q-tooltip>
                <div class="creature-image-container">
                    <q-img
                        :src="creature.texture ? '/assets/battle/creatures/basic/' + creature.texture + '.png' : 'https://img.league17.ru/pub/mnst/norm/full/502.png'"
                        :alt="creature.name"
                        class="creature-image"
                        :class="{mirror: creature.direction === 'left'}"
                    />
                    <div class="status-indicators">
                        <QIcon
                            v-for="(buff, index) in creature.effects"
                            :key="'buff-' + index"
                            :name="buff.icon"
                            size="10px"
                            color="positive"
                            class="status-icon"
                        />
                        <QIcon
                            v-for="(debuff, index) in creature.effects"
                            :key="'debuff-' + index"
                            :name="debuff.icon"
                            size="10px"
                            color="negative"
                            class="status-icon"
                        />
                    </div>
                </div>

                <div class="health-bar">
                    <QLinearProgress
                        :value="creature.health / creature.maxHealth"
                        color="negative"
                        track-color="dark-red"
                        stripe
                    />
                </div>

                <div class="pp-bar">
                    <QLinearProgress
                        :value="(creature.pp || 0) / (creature.maxPP || 1)"
                        color="info"
                        track-color="dark-blue"
                    />
                </div>

                <div class="creature-name text-caption">
                    {{ creature.name }}
                </div>
            </div>
        </TransitionGroup>
    </QScrollArea>
</template>

<style scoped>
.battle-queue-container {
    display: flex;
    align-items: center;
    position: relative;
    height: 120px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
}

.queue-container {
    flex-grow: 1;
    overflow: hidden;
}

.queue-list {
    display: inline-flex; /* Важно для горизонтального скролла */
    flex-wrap: nowrap;
    padding: 10px 0;
    white-space: nowrap;
}

.creature-item {
    position: relative;
    width: 70px;
    margin: 0 10px;
    transition: all 0.4s ease;
    opacity: 1;
    transform-origin: center;
    border: 2px solid;
    flex-shrink: 0; /* Предотвращаем сжатие элементов */
}

.active-creature {
    z-index: 10;
    filter: drop-shadow(0 0 8px rgba(255, 217, 0, 0.8));
}

.dead-creature {
    opacity: 0;
    transform: translateY(100px) scale(0.5);
    transition: all 0.8s ease;
}

.creature-image-container {
    position: relative;
    height: 60px;
}

.creature-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 5px;
    border: 2px solid transparent;
    transition: border-color 0.3s ease;
}

.status-indicators {
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 2px;
}

.status-icon {
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    padding: 2px;
}

.health-bar, .pp-bar {
    height: 4px;
    margin-top: 2px;
}

.pp-bar {
    height: 2px;
}

.creature-name {
    text-align: center;
    margin-top: 4px;
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Анимации для TransitionGroup */
.queue-move {
    transition: all 0.5s ease;
}

.queue-enter-active,
.queue-leave-active {
    transition: all 0.8s ease;
    position: absolute;
}

.queue-enter-from,
.queue-leave-to {
    opacity: 0;
    transform: translateY(100px);
}

.mirror {
    transform: scaleX(-1);
}
</style>