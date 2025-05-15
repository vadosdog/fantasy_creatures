<script setup>
import {ref, toRaw} from "vue";
import {useGameStore} from "../store/game.js";


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

const store = useGameStore()

const changeScene = (newScene) => {
    if (!store.scene) {
        return
    }

    store.scene.start(newScene);
}
</script>

<template>

    <nav>
        <RouterLink to="/">Go to Home</RouterLink>
        <RouterLink to="/game">Go to Game</RouterLink>
    </nav>
    <main>
        <RouterView/>
    </main>
    <div>
        <div>
            <button class="button" @click="changeScene('CraftGameCrucibleOfSouls')">CraftGameCrucibleOfSouls</button>
            <button class="button" @click="changeScene('Battle')">Go to Battle</button>
            <button class="button" @click="changeScene('ExplorationLevel')">ExplorationLevel</button>
        </div>
    </div>
</template>

<style scoped>

</style>