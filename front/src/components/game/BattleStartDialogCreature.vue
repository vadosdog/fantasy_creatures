<script setup>

import CreatureCard from "./CreatureCard.vue";

defineProps({
    creature: {
        type: Object,
        default: {
            name: 'LOH',
            emotion: 'rage',
            shape: 'beast',
            element: 'fire',
            effects: [],
            level: 1
        },
        required: true
    },
    active: false,
    direction: 'left'
})

</script>

<template>
    <q-item
        :key="creature.id"
        class="creature-item cursor-pointer border-2"
        :class="{
            'border-transparent': !active,
            'border-primary': active,
        }"
        v-ripple
        clickable
    >
        <q-tooltip
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
            :delay="1000"
            style="width: 300px"
        >
            <CreatureCard
                :creature="creature"
                :key="creature.id"
                :showHealth="false"
                :stats-verbose="true"
            />
        </q-tooltip>
        <q-item-section avatar>
            <q-avatar size="40px">
                <q-img
                    :src="'/assets/creatures/basic/' + creature.number + '.png'"
                    :alt="creature.name"
                    class="creature-image"
                    :class="{mirror: direction === 'right'}"
                />
            </q-avatar>
        </q-item-section>

        <q-item-section>
            <q-item-label>
                {{ creature.name }}
            </q-item-label>
            <q-item-section>
                <div>
                    <q-badge class="q-mr-sm" color="grey">Ур. {{ creature.level }}</q-badge>
                    <q-badge class="q-mr-sm" color="primary">{{ creature.element }}</q-badge>
                    <q-badge class="q-mr-sm" color="secondary">{{ creature.shape }}</q-badge>
                    <q-badge class="q-mr-sm" color="accent">{{ creature.emotion }}</q-badge>
                </div>
            </q-item-section>
            <q-item-label caption>
                ⚔️ <span>{{ creature.attackStat }}</span>
                · 🛡️ <span>{{ creature.defenseStat }}</span>
                · ✨ <span>{{ creature.willStat }}</span>
                · 💡 <span>{{ creature.initiativeStat }}</span>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<style scoped>
.mirror {
    transform: scaleX(-1);
}
</style>