<script setup>
import BattleLog from "./BattleLog.vue";
import {computed, ref, watch} from "vue";
import {useBattleLogStore} from "../../store/battleLog.js";
// import BattleQueue from "./BattleQueue.vue";


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
    <div class="q-pa-md">
        <div class="row no-wrap shadow-1" style="height: 200px;">
            <QToolbar class="col-4 bg-grey-2 text-grey-9">
                <QScrollArea style="height: 100%; width: 100%" ref="scrollAreaRef">
                    <BattleLog/>
                </QScrollArea>
            </QToolbar>
            <!-- Battle Log -->
            <q-toolbar class="col-8 bg-grey-9">
<!--                <BattleQueue/>-->

            </q-toolbar>
        </div>
    </div>
    <!-- Battle Log -->
    
</template>

<style scoped>

</style>