<script setup>

import {useGameStore} from "../../store/game.js";

const store = useGameStore()

const changeScene = (newScene) => {
    if (!store.scene) {
        return
    }

    store.scene.start(newScene);
}

</script>

<template>
    <div class="row q-gutter-sm">
        <q-btn
            flat
            label="Go to Battle"
            @click="changeScene('Battle')"
        />
        <q-btn
            flat
            label="Go to Test"
            @click="changeScene('BattleAutoTest')"
        />
    </div>
</template>

<style scoped>

</style>