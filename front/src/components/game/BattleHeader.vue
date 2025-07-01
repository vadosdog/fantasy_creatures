<script setup>

import {useGameStore} from "../../store/game.js";

const store = useGameStore()

</script>

<template>
    <div class="row q-gutter-sm">
        <q-btn
            flat
            label="Battle"
            @click="store.changeScene('Battle')"
        />
        <q-btn
            flat
            label="Test"
            @click="store.changeScene('BattleAutoTest')"
        />
        <q-btn
            flat
            label="Craft"
            @click="store.changeScene('Craft')"
        />
    </div>
</template>

<style scoped>

</style>