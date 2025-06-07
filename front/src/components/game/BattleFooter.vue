<script setup>
import BattleLog from "./BattleLog.vue";
import {computed, ref, watch} from "vue";
import {useBattleLogStore} from "../../store/battleLog.js";


const scrollAreaRef = ref(null)

const battleLogStore = useBattleLogStore()

const battleLog = computed(() => battleLogStore.battleLog)

watch(battleLog, (newValue) => {
    try {
        if (!scrollAreaRef.value) return

        const scrollElement = scrollAreaRef.value.getScrollTarget()
        if (!scrollElement) return

        // Вычисляем максимальную позицию скролла
        const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight + 300

        // Прокручиваем с анимацией
        scrollAreaRef.value.setScrollPosition('vertical', maxScroll, 300)
    } catch (error) {
        console.error('Error in scroll area:', error);
    }

}, {deep: true});
</script>

<template>
    <!-- Battle Log -->
    <q-toolbar class="bg-grey-2 text-grey-9" style="height: 200px; width: 300px;">
        <q-scroll-area style="height: 100%; width: 100%" ref="scrollAreaRef">
            <BattleLog/>
        </q-scroll-area>
    </q-toolbar>
</template>

<style scoped>

</style>