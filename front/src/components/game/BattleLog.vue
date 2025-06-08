<script setup>
import {computed} from "vue";
import {useBattleLogStore} from "../../store/battleLog.js";
import EffectSpan from "./EffectSpan.vue";

const battleLogStore = useBattleLogStore()
const battleLog = computed(() => battleLogStore.battleLog)

function getColorClass(creature) {
    if (!creature) return '';
    return creature.direction === 'right' ? 'text-positive' : 'text-negative';
}
</script>

<template>
    <q-timeline color="secondary" v-if="battleLog">
        <q-timeline-entry
            v-for="log in battleLog"
            :key="`${log.round}-${log.turn}`"
            :subtitle="`Раунд ${log.round} · Ход ${log.turn}`"
        >
            <div v-for="(record, idx) in log.log" :key="idx">
                -
                <!-- Эффекты -->
                <template v-if="record.type === 'pushEffect'">
                    <span :class="getColorClass(record.target)">{{ record.target.name }}</span>
                    получает эффект: <EffectSpan :effect="record.effect"/>
                </template>

                <template v-else-if="record.type === 'endOfEffect'">
                    Эффект <EffectSpan :effect="record.effect"/>
                    спадает с <span :class="getColorClass(record.target)">{{ record.target.name }}</span>
                </template>

                <template v-else-if="record.type === 'roundEffect'">
                    <span :class="getColorClass(record.target)">{{ record.target.name }}</span>
                    <span v-if="record.effect.damage < 0" class="text-negative">
                        теряет {{ -record.effect.damage }} HP
                    </span>
                    <span v-else class="text-positive">
                        восстанавливает {{ record.effect.damage }} HP
                    </span>
                    (<EffectSpan :effect="{effect: record.effect.type}"/>)
                </template>

                <!-- Атаки -->
                <template v-else-if="record.type === 'attack'">
                    <span :class="getColorClass(record.actor)">{{ record.actor.name }}</span>
                    применяет <span class="text-weight-bold">«{{ record.attack.name }}»</span> на
                    <span :class="getColorClass(record.target)">{{ record.target.name }}</span>

                    <template v-if="record.success">
                        <span v-if="record.isCrit" class="text-negative"> · КРИТ!</span>
                        <span class="text-negative"> · Урон: {{ -record.damage }}</span>
                    </template>
                    <span v-else class="text-italic"> · Промах</span>
                </template>

                <!-- Лечение -->
                <template v-else-if="record.type === 'treat'">
                    <span :class="getColorClass(record.actor)">{{ record.actor.name }}</span>
                    применяет <span class="text-positive text-weight-bold">«{{ record.attack.name }}»</span> на
                    <span :class="getColorClass(record.target)">{{ record.target.name }}</span>

                    <template v-if="record.success">
                        <span v-if="record.isCrit" class="text-positive"> · КРИТ!</span>
                        <span class="text-positive"> · +{{ record.damage }} HP</span>
                    </template>
                    <span v-else class="text-italic"> · Неудача</span>
                </template>

                <!-- Действия -->
                <template v-else-if="record.type === 'defense'">
                    <span :class="getColorClass(record.actor)">{{ record.actor.name }}</span>
                    <span class="text-warning"> концентрируется на защите</span>
                </template>

                <template v-else-if="record.type === 'delayTurn'">
                    <span :class="getColorClass(record.actor)">{{ record.actor.name }}</span>
                    <span class="text-info"> откладывает ход</span>
                </template>

                <template v-else-if="record.type === 'move'">
                    <span :class="getColorClass(record.actor)">{{ record.actor.name }}</span>
                    <span class="text-info"> перемещается</span>
                </template>
                <!-- Выбывание из боя -->
                <template v-else-if="record.type === 'defeated'">
                    <span :class="getColorClass(record.target)">{{ record.target.name }}</span>
                    <span class="text-negative text-weight-bold"> не может продолжать бой!</span>
                </template>
            </div>
        </q-timeline-entry>
    </q-timeline>
</template>

<style scoped>
.text-positive {
    color: #4CAF50;
}
.text-negative {
    color: #F44336;
}
.text-warning {
    color: #FFC107;
}
.text-info {
    color: #29B6F6;
}
.text-italic {
    font-style: italic;
}
</style>