<script setup>
import {ref, computed, onMounted} from 'vue';
import CreatureList from './CreatureList.vue';
import ResourceItem from './ResourceItem.vue';
import {useGameStore} from "../../store/game.js";
import {useRouter} from "vue-router";
import {useBattleStore} from "../../store/battle.js";

const gameStore = useGameStore()
const battleStore = useBattleStore()
const router = useRouter()


const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    battleData: {
        type: Object,
        required: true,
        default: () => ({
            outcome: 'victory',
            player: {
                survivors: [
                    {id: '1', name: 'Пирохват', level: 5, number: '001', count: 3}
                ],
                fallen: [
                    {id: '2', name: 'Аквастрайк', level: 3, number: '007', count: 5}
                ]
            },
            enemy: {
                survivors: [
                    {id: 'e1', name: 'Каменный голем', level: 7, number: '045', count: 2}
                ],
                fallen: [
                    {id: 'e2', name: 'Лесной дух', level: 4, number: '023', count: 8}
                ]
            },
            rewards: {
                experience: {
                    '1': 120,
                    '2': 80
                },
                resources: [
                    {
                        id: 'gold', amount: 1500,
                    },
                    {
                        id: 'memory_shard', amount: 1500,
                    },
                    {
                        id: 'craft_shard_fire_common', amount: 1500,
                    },
                    {
                        id: 'craft_shard_water_common', amount: 1500,
                    },
                ],
                // trophies: ['Редкий артефакт', 'Знак отличия']
            }
        })
    }
});

const showRewardsAnimation = ref(false);
const resourceIcons = {
    gold: 'assets/icons/gold.png',
    crystals: 'assets/icons/crystal.png',
    wood: 'assets/icons/wood.png',
    ore: 'assets/icons/ore.png'
};

const isVictory = computed(() => props.battleData.outcome === 'victory');
const resultTitle = computed(() => isVictory.value ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ');
const resultSubtitle = computed(() =>
    isVictory.value ? 'Ваша армия одержала славную победу!' : 'Ваши силы потерпели поражение в этом сражении'
);
const resultTitleClass = computed(() =>
    isVictory.value
        ? 'text-[var(--primary)]'
        : 'text-[var(--destructive)]'
);

const playerCreatures = computed(() => props.battleData.playerCreatures);
const enemyCreatures = computed(() => props.battleData.enemyCreatures);

onMounted(() => {
    // Анимация наград через 0.5с
    setTimeout(() => {
        showRewardsAnimation.value = true;
        setTimeout(() => showRewardsAnimation.value = false, 2000);
    }, 500);
});

// Действия
function exitBattle() {
    router.push('/world')
    applyRewards()
}

function restartBattle() {
    //TODO когда нибудь починить
    emit('update:modelValue', false)
    battleStore.resetBattle()
    applyRewards()
}

function showStatistics() {
    // Показать статистику
}

function showBattlefield() {
    // Показать поле битвы
}

function applyRewards() {
    if (props.battleData.rewards.resources) {
        for (const resource of props.battleData.rewards.resources) {
            gameStore.addInventoryItem(resource)
        }
    }
    
    if (props.battleData.rewards.experience) {
        for (const id of Object.keys(props.battleData.rewards.experience)) {
            gameStore.addCreatureExperience(id, props.battleData.rewards.experience[id])
        }
    }
}

</script>

<template>
    <q-dialog
        persistent
        maximized
        transition-show="fade-in"
        transition-hide="fade-out"
    >
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
            <!-- Основное окно -->
            <div
                class="battle-result-container w-full max-w-4xl bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-2xl">

                <!-- Заголовок с анимацией -->
                <div class="text-center mb-8 relative overflow-hidden py-6">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)/20] to-transparent animate-pulse"></div>
                    <div
                        class="text-4xl font-bold mb-2 tracking-wider"
                        :class="resultTitleClass"
                    >
                        {{ resultTitle }}
                    </div>
                    <div class="text-xl text-[var(--muted-foreground)] italic">
                        {{ resultSubtitle }}
                    </div>
                </div>

                <!-- Статусы армий -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <!-- Армия игрока -->
                    <div class="player-column p-5 rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
                        <div class="text-center text-2xl font-bold mb-4 text-[var(--primary)]">Ваша армия</div>

                        <div class="mb-4">
                            <CreatureList :creatures="playerCreatures" :experience="battleData.rewards.experience"/>
                        </div>
                    </div>

                    <!-- Армия противника -->
                    <div class="enemy-column p-5 rounded-lg border border-[var(--border)] bg-[var(--secondary)]">
                        <div class="text-center text-2xl font-bold mb-4 text-[var(--accent)]">Армия противника</div>

                        <div class="mb-4">
                            <div v-if="enemyCreatures.length === 0"
                                 class="text-[var(--accent)] italic text-center py-3">
                                Все враги уничтожены
                            </div>
                            <CreatureList :creatures="enemyCreatures"/>
                        </div>
                    </div>
                </div>

                <!-- Награды -->
                <div
                    v-if="isVictory"
                    class="mt-6 p-5 rounded-lg border border-[var(--border)] bg-[var(--popover)]"
                    :class="{'animate-pulse': showRewardsAnimation}"
                >
                    <div class="text-center text-2xl font-bold mb-5 text-[var(--primary)]">Награды</div>

                    <!-- Ресурсы -->
                    <div class="mb-6" v-if="battleData.rewards.resources">
                        <div class="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
                            <q-icon name="paid" size="sm" color="accent"/>
                            <span>Ресурсы</span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <ResourceItem
                                v-for="(resource) in battleData.rewards.resources"
                                :type="resource.id"
                                :amount="resource.amount"
                            />
                        </div>
                    </div>

                    <!-- Трофеи -->
                    <div v-if="battleData.rewards.trophies && battleData.rewards.trophies.length">
                        <div class="text-lg font-semibold mb-3 text-center flex items-center justify-center gap-2">
                            <q-icon name="workspace_premium" size="sm" color="yellow"/>
                            <span>Особые трофеи</span>
                        </div>
                        <div class="flex flex-wrap justify-center gap-3">
                            <q-chip
                                v-for="(trophy, index) in battleData.rewards.trophies"
                                :key="index"
                                color="primary"
                                text-color="white"
                                icon="star"
                            >
                                {{ trophy }}
                            </q-chip>
                        </div>
                    </div>
                </div>

                <!-- Кнопки действий -->
                <div class="mt-8 flex flex-wrap justify-center gap-4">
                    <q-btn
                        label="Выйти из боя"
                        color="primary"
                        icon="exit_to_app"
                        class="px-5 py-2 text-base min-w-[180px]"
                        @click="exitBattle"
                    />

<!--                    <q-btn-->
<!--                        label="Повторить бой"-->
<!--                        color="secondary"-->
<!--                        icon="replay"-->
<!--                        class="px-5 py-2 text-base min-w-[180px]"-->
<!--                        @click="restartBattle"-->
<!--                    />-->

<!--                    <q-btn-->
<!--                        label="Статистика"-->
<!--                        color="accent"-->
<!--                        icon="analytics"-->
<!--                        class="px-5 py-2 text-base min-w-[180px]"-->
<!--                        @click="showStatistics"-->
<!--                    />-->

<!--                    <q-btn-->
<!--                        label="Поле битвы"-->
<!--                        color="muted"-->
<!--                        icon="map"-->
<!--                        class="px-5 py-2 text-base min-w-[180px]"-->
<!--                        @click="showBattlefield"-->
<!--                    />-->
                </div>
            </div>
        </div>
    </q-dialog>
</template>

<style scoped>
.battle-result-container {
    background: linear-gradient(
        145deg,
        var(--card) 0%,
        var(--popover) 100%
    );
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border);
}

/* Анимации */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.player-column, .enemy-column {
    animation: fadeIn 0.6s ease-out forwards;
}

.q-dialog__inner--minimized > div {
    animation: none !important;
}
.mirror {
    transform: scaleX(-1);
}
</style>