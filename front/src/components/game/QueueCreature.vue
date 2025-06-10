<script setup>

import {computed} from "vue";

const props = defineProps({
    creature: Object
});

const borderColor = computed(() => props.creature.direction === 'left'
    ? '#1976D2'  // Синий для левых
    : '#C10015')
</script>

<template>
    <div
        class="creature-item"
        :class="{
      'active-creature': creature.isActive,
      'dead-creature': creature.health <= 0
    }"
        :style="{
      borderColor: borderColor,
      transform: `scale(${creature.isActive ? 1.15 : 1})`
    }"
    >
        <div class="creature-image-container">
            <img
                :src="creature.texture"
                :alt="creature.name"
                class="creature-image"
            />
            <div class="status-indicators">
                <q-icon
                    v-for="(buff, index) in creature.buffs"
                    :key="'buff-' + index"
                    :name="buff.icon"
                    size="10px"
                    color="positive"
                    class="status-icon"
                />
                <q-icon
                    v-for="(debuff, index) in creature.debuffs"
                    :key="'debuff-' + index"
                    :name="debuff.icon"
                    size="10px"
                    color="negative"
                    class="status-icon"
                />
            </div>
        </div>

        <div class="health-bar">
            <q-linear-progress
                :value="creature.health / creature.maxHealth"
                color="negative"
                track-color="dark-red"
                stripe
            />
        </div>

        <div class="pp-bar">
            <q-linear-progress
                :value="(creature.pp || 0) / (creature.maxPP || 1)"
                color="info"
                track-color="dark-blue"
            />
        </div>

        <div class="creature-name text-caption">
            {{ creature.name }}
        </div>
    </div>
</template>

<style scoped>
.creature-item {
    position: relative;
    width: 70px;
    margin: 0 5px;
    transition: all 0.4s ease;
    opacity: 1;
    transform-origin: center;
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

.active-creature .creature-image {
    border-color: currentColor;
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
</style>