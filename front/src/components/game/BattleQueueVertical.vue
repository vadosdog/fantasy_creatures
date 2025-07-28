<script setup>
import {ref, computed, watch, nextTick} from 'vue'
import {useBattleStore} from "../../store/battle.js";
import {QScrollArea, QIcon, QLinearProgress, useQuasar} from 'quasar'
import {useGameStore} from "../../store/game.js";
import CreatureCard from "./CreatureCard.vue";
import EffectSpan from "./EffectSpan.vue";

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
    const itemWidth = items[0].$el.offsetHeight +
        parseInt(getComputedStyle(items[0].$el).marginTop) +
        parseInt(getComputedStyle(items[0].$el).marginBottom)

    // Рассчитываем желаемую позицию скролла
    // Чтобы активное существо было вторым на экране (смещение на 1 элемент слева)
    const targetPosition = Math.max(0, (activeIndex - 1) * itemWidth)

    // Устанавливаем позицию скролла с плавной анимацией
    scrollArea.value.setScrollPosition('vertical', targetPosition, 300)
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
        <q-list bordered>
            <q-item
                v-for="(creature, index) in processedQueue"
                :key="creature.id"
                :ref="el => creatureItems[index] = el"
                class="creature-item"
                :class="{
                    'active-creature': creature.isActive,
                    'dead-creature': creature.health <= 0,
                    'bg-yellow-2': hoveredCreatureId === creature.id,
                }"

                @mouseenter="hoverCreature(creature)"
                @mouseleave="clearHoverCreature"
                clickable
                v-ripple
            >
                <q-item-section avatar>
                    <q-avatar size="40px">
                        <q-img
                            :src="'./assets/creatures/basic/' + creature.texture + '.png'"
                            :alt="creature.name"
                            class="creature-image"
                            :class="{mirror: creature.direction === 'right'}"
                        />
                    </q-avatar>
                </q-item-section>

                <q-item-section>
                    <q-item-label>
                        <q-badge rounded :color="creature.direction === 'left' ? 'red' : 'green'" />
                        {{ creature.name }}
                    </q-item-label>
                    <q-item-label caption>
                        <div class="health-bar">
                            <QLinearProgress
                                :value="creature.health / creature.maxHealth"
                                color="positive"
                                track-color="dark-red"
                            />
                        </div>
                        <div class="status-indicators q-mt-sm" v-if="creature.effects.length">
                            <effect-span
                                v-for="effect in creature.effects"
                                type="badge"
                                :effect="effect"/>
                        </div>
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </QScrollArea>
</template>

<style scoped >
.active-creature {
    z-index: 10;
    filter: drop-shadow(0 0 8px rgba(255, 217, 0, 0.8));
}

.dead-creature {
    opacity: 0;
    transform: translateY(100px) scale(0.5);
    transition: all 0.8s ease;
}

.creature-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 5px;
    border: 2px solid transparent;
    transition: border-color 0.3s ease;
}

.health-bar {
    height: 4px;
    margin-top: 2px;
}

.mirror {
    transform: scaleX(-1);
}
</style>