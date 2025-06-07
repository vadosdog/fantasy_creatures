<script setup>
import {computed} from "vue";
import {useBattleLogStore} from "../../store/battleLog.js";
import EffectSpan from "./EffectSpan.vue";

const battleLogStore = useBattleLogStore()

const battleLog = computed(() => battleLogStore.battleLog)
</script>

<template>
    <q-timeline color="secondary" v-if="battleLog">
        <q-timeline-entry
            v-for="log in battleLog"
            :subtitle="`Раунд ${log.round}. Ход ${log.turn}`"
        >
            <div v-for="record in log.log">
                <template v-if="record.type === 'pushEffect'">
                    Наложен эффект
                    <EffectSpan :effect="record.effect" v-if="record.effect"/>
                    на
                    <span :class="{
                                'text-positive': record.target.direction === 'right',
                                'text-negative': record.target.direction === 'left',
                            }">
                                {{ record.target.name || 'Unknown' }}
                            </span>
                </template>
                <template v-if="record.type === 'endOfEffect'">
                    Эффект
                    <EffectSpan :effect="record.effect" v-if="record.effect"/>
                    перестал действовать на
                    <span :class="{
                                'text-positive': record.target.direction === 'right',
                                'text-negative': record.target.direction === 'left',
                            }">
                                {{ record.target.name || 'Unknown' }}
                            </span>
                </template>
                <template v-if="record.type === 'roundEffect'">
                    Эффект
                    <EffectSpan :effect="{effect: record.effect.type}" v-if="record.effect"/>
                    <span :class="{
                                'text-positive': record.effect.damage > 0,
                                'text-negative': record.effect.damage < 0,
                            }" class="q-ml-xs q-mr-xs"
                    >
                                {{ record.effect.damage }}
                            </span>
                    <span :class="{
                                'text-positive': record.target.direction === 'right',
                                'text-negative': record.target.direction === 'left',
                            }">
                                {{ record.target.name || 'Unknown' }}
                            </span>
                </template>
                <template v-if="record.type === 'attack'">
                    <span :class="{
                                'text-positive': record.actor.direction === 'right',
                                'text-negative': record.actor.direction === 'left',
                            }">
                                {{ record.actor.name || 'Unknown' }}
                            </span>
                    {{ record.attack.name }} на
                    <span :class="{
                                'text-positive': record.target.direction === 'right',
                                'text-negative': record.target.direction === 'left',
                            }">
                                {{ record.target.name || 'Unknown' }}
                            </span>
                    <template v-if="record.success">
                        <span v-if="record.isCrit" class="text-negative">💢 Критический удар!</span>
                        <span class="text-negative">💥 {{ -record.damage }} HP</span>
                    </template>
                    <span v-else class="text-negative">Промах!</span>
                </template>
                <template v-if="record.type === 'defense'">
                    <span :class="{
                                'text-positive': record.actor.direction === 'right',
                                'text-negative': record.actor.direction === 'left',
                            }">
                                {{ record.actor.name || 'Unknown' }}
                            </span>
                    <QIcon name="shield" class="q-ml-xs"/> Защищается
                </template>
                <template v-if="record.type === 'treat'">
                    <span :class="{
                                'text-positive': record.actor.direction === 'right',
                                'text-negative': record.actor.direction === 'left',
                            }">
                                {{ record.actor.name || 'Unknown' }}
                            </span>
                    {{ record.attack.name }} на
                    <span :class="{
                                'text-positive': record.target.direction === 'right',
                                'text-negative': record.target.direction === 'left',
                            }">
                                {{ record.target.name || 'Unknown' }}
                            </span>
                    <template v-if="record.success">
                        <span v-if="record.isCrit" class="text-negative">💢 Критических успех!</span>
                        <span class="text-positive"><QIcon name="emergency" class="q-ml-xs"/> +{{ record.damage }} HP</span>
                    </template>
                    <span v-else class="text-negative">Промах!</span>
                </template>
                <template v-if="record.type === 'defense'">
                    <span :class="{
                                'text-positive': record.actor.direction === 'right',
                                'text-negative': record.actor.direction === 'left',
                            }">
                                {{ record.actor.name || 'Unknown' }}
                            </span>
                    <QIcon name="shield" class="q-ml-xs"/> Защищается
                </template>
                <template v-if="record.type === 'delayTurn'">
                    <span :class="{
                                'text-positive': record.actor.direction === 'right',
                                'text-negative': record.actor.direction === 'left',
                            }">
                                {{ record.actor.name || 'Unknown' }}
                            </span>
                    <QIcon name="fast_forward" class="q-ml-xs"/> Отложил ход
                </template>
                <template v-if="record.type === 'move'">
                    <span :class="{
                                'text-positive': record.actor.direction === 'right',
                                'text-negative': record.actor.direction === 'left',
                            }">
                                {{ record.actor.name || 'Unknown' }}
                            </span>
                    <QIcon name="fast_forward" class="q-ml-xs"/> Перемещение
                </template>
            </div>
        </q-timeline-entry>
        <!--                <q-timeline-entry-->
        <!--                    subtitle="February 22, 1986"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->

        <!--                <q-timeline-entry-->
        <!--                    title="Event Title"-->
        <!--                    subtitle="February 21, 1986"-->
        <!--                    icon="delete"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->

        <!--                <q-timeline-entry-->
        <!--                    title="Event Title"-->
        <!--                    subtitle="February 22, 1986"-->
        <!--                    avatar="https://cdn.quasar.dev/img/avatar2.jpg"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->

        <!--                <q-timeline-entry-->
        <!--                    title="Event Title"-->
        <!--                    subtitle="February 22, 1986"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->

        <!--                <q-timeline-entry-->
        <!--                    title="Event Title"-->
        <!--                    subtitle="February 22, 1986"-->
        <!--                    color="orange"-->
        <!--                    icon="done_all"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->

        <!--                <q-timeline-entry-->
        <!--                    title="Event Title"-->
        <!--                    subtitle="February 22, 1986"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->

        <!--                <q-timeline-entry-->
        <!--                    title="Event Title"-->
        <!--                    subtitle="February 22, 1986"-->
        <!--                >-->
        <!--                    <div>-->
        <!--                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.-->
        <!--                    </div>-->
        <!--                </q-timeline-entry>-->
    </q-timeline>
</template>

<style scoped>
/* При необходимости добавьте кастомные стили */
</style>