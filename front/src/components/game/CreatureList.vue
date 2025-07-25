

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    creatures: Array,
    experience: Object,
});

function creatureImage(creature) {
    return `assets/creatures/basic/${creature.number}.png`;
}
</script>

<template>
    <div class="creature-list">
        <div
            v-for="creature in creatures"
            :key="creature.id"
            class="creature-item flex items-center py-2 border-b border-[var(--border)/30]"
        >
            <img
                :src="creatureImage(creature)"
                class="w-12 h-12 mr-3 rounded-md border border-[var(--border)] object-cover"
            />

            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                    <div class="font-semibold truncate">{{ creature.name }}</div>
                    <div class="text-sm bg-[var(--muted)] px-2 py-1 rounded">
                        Lvl.{{ creature.level }}
                    </div>
                </div>

                <div class="flex justify-between items-center mt-1">

                    <div
                        v-if="experience && experience[creature.id]"
                        class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center"
                    >
                        <q-icon name="military_tech" size="0.8em" class="mr-1" />
                        +{{ experience[creature.id] }} XP
                    </div>

                    <div
                        v-if="creature.health === 0"
                        class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded"
                    >
                        Погиб
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.creature-item {
    animation: fadeIn 0.4s ease-out forwards;
    animation-delay: calc(var(--index) * 0.1s);
}
</style>