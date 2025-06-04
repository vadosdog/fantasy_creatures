<script setup>

import CreatureCard from "./CreatureCard.vue";
import {computed} from "vue";
import {useBattleStore} from "../../store/battle.js";

const store = useBattleStore()

const activeCreature = computed(() => store.activeCreature)
</script>

<template>
    <q-card class="bg-blue-1 text-blue-9 q-mb-md">
        <q-card-section>
            <div class="text-h6">Ваш ход</div>
        </q-card-section>
    </q-card>
    <CreatureCard
        v-if="activeCreature && activeCreature.id"
        :creature="activeCreature"
        :key="activeCreature.id"
    />
</template>

<style scoped>

</style>