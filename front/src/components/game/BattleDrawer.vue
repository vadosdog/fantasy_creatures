<script setup>

import CreatureCard from "./CreatureCard.vue";
import {computed, ref} from "vue";
import {useBattleStore} from "../../store/battle.js";
import {useGlobalStore} from "../../store/global.js";
import EffectSpan from "./EffectSpan.vue";

const battleStore = useBattleStore()
const globalStore = useGlobalStore()

const activeCreature = computed(() => battleStore.activeCreature)
const selectedActionId = computed(() => {
    return battleStore.selectedActionId
})


function getActionTypeIcon(action) {
    if (action.range === 0) {
        return '🛡️'
    }

    return {"melee": '🗡️', 'ranged': '🏹', 'treat': '❤'}[action.actionType]
}


function getElementIcon(element) { //TODO унести в какое нибудь единое место
    const elementIcon = {icon: '', color: ''}
    switch (element) {
        case 'fire':
            elementIcon.icon = 'whatshot'
            elementIcon.color = 'red-9'
            break;
        case 'water':
            elementIcon.icon = 'water_drop'
            elementIcon.color = 'blue-10'
            break;
        case 'grass':
            elementIcon.icon = 'grass'
            elementIcon.color = 'green-9'
            break;
    }

    return elementIcon
}


function getRoleIcon(role) {
    switch (role) {
        case 'tank':
            return 'shield'
        case 'dd':
            return 'rocket'
        case 'support':
            return 'emergency'
    }

    return undefined
}

function getFormIcon(form) {
    switch (form) {
        case 'beast':
            return 'pets'
        case 'bird':
            return 'flutter_dash'
        case 'reptile':
            return 'smart_toy'
    }

    return undefined
}

function getActionIcon(action) {
    if (action.element) {
        return getElementIcon(action.element)
    }
    if (action.role) {
        return {
            color: 'red',
            icon: getRoleIcon(action.role)
        }
    }
    return {
        color: 'accent',
        icon: getFormIcon(action.form)
    }
}

const confirmSkip = ref(false)
const confirmDelay = ref(false)

function openDialog() {
    globalStore.setDialogVisible(true);
}

function closeDialog() {
    globalStore.setDialogVisible(false);
}

</script>

<template>
    <q-dialog v-model="confirmSkip" persistent class="text-foreground" @show="openDialog" @hide="closeDialog">
        <q-card class="bg-card border backdrop-blur-md">
            <q-card-section class="row items-center">
                <q-avatar icon="shield" class="bg-primary text-background"/>
                <span class="q-ml-sm text-foreground">Вы уверены, что хотите принять защитную стойку?</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Сражаться!" class="text-muted-foreground" v-close-popup/>
                <q-btn flat label="Защищаться!"
                       class="bg-primary-gradient text-background mystical-glow"
                       v-close-popup
                       @click="() => battleStore.selectAction('skip')"
                       icon="shield"/>
            </q-card-actions>
        </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDelay" persistent class="text-foreground" @show="openDialog" @hide="closeDialog">
        <q-card class="bg-card border backdrop-blur-md">
            <q-card-section class="row items-center">
                <q-avatar icon="shield" class="bg-primary text-background"/>
                <span class="q-ml-sm text-foreground">Пока недоступно. Иди сражайся!</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Сражаться!" class="text-muted-foreground" v-close-popup/>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <!-- Header Card -->
    <q-card class="bg-card border backdrop-blur-md text-foreground q-mb-md">
        <q-card-section>
            <div class="text-h6">Ваш ход</div>
        </q-card-section>
    </q-card>

    <CreatureCard
        v-if="activeCreature && activeCreature.id"
        :creature="activeCreature"
        :key="activeCreature.id"
    />

    <!-- Actions Panel -->
    <q-card
        v-if="activeCreature && activeCreature.id"
        class="bg-card border"
    >
        <q-card-section class="row">
            <q-btn
                v-for="action in activeCreature.actions"
                class="col-12 q-mb-sm action-button text-foreground"
                :class="{
          'action-button-unselected': selectedActionId !== action.id,
          'action-button-selected': selectedActionId === action.id,
        }"
                no-caps
                align="left"
                :disable="action.currentCooldown > 0 || action.pp > activeCreature.pp"
                @click="() => battleStore.selectAction(action.id)"
            >
                <!-- Cooldown Knob -->
                <q-knob
                    show-value
                    font-size="5px"
                    class="text-foreground q-ma-xs absolute-right"
                    :model-value="action.cooldown - action.currentCooldown"
                    :max="action.cooldown"
                    :thickness="0.25"
                    :color="action.currentCooldown > 0 ? 'destructive' : 'foreground'"
                    track-color="muted"
                    size="md"
                >
                    <q-icon flat round :color="getActionIcon(action).color"
                            :name="getActionIcon(action).icon" size="sm"/>
                </q-knob>

                <!-- Action Details -->
                <div class="col-12 text-left text-foreground">
                    {{ getActionTypeIcon(action) }} ️{{ action.name }}
                </div>
                <div class="col-12 text-left text-foreground" v-if="action.range > 1">
                    📏 {{ action.range }}
                </div>
                <div class="col-12 text-left">
          <span :class="{'text-destructive': action.pp > activeCreature.pp}">
            PP: {{ action.pp }}
          </span>
                    <span v-if="action.cooldown > 0"
                          :class="{'text-destructive': action.currentCooldown > 0}">
            CD: {{ action.currentCooldown }} / {{ action.cooldown }}
          </span>
                </div>
                <div class="col-12 text-left text-foreground">
                    🎯 {{ action.hitChance * 100 }}%
                    <span v-if="action.critChance > 0">💢 {{ action.critChance * 100 }}%</span>
                    💥 {{ action.baseDamage }}
                </div>
                <div class="col-12 text-left text-foreground" v-if="action.effects.length">
                    <q-separator class="bg-border"/>
                    <div v-for="effect in action.effects">
                        <EffectSpan :effect="effect"/>
                        <span v-if="effect.duration > 1" class="q-pl-xs">x{{ effect.duration }}</span>
                        🎲 {{ effect.chance * 100 }}%
                    </div>
                </div>
            </q-btn>

            <!-- Action Buttons -->
            <q-btn class="col-6 secondary-button" icon="fast_forward" label="Отложить"
                   @click="confirmDelay = true "/>
            <q-btn class="secondary-button"
                   icon="shield" label="Защита" @click="confirmSkip = true "/>
        </q-card-section>
    </q-card>
</template>

<style scoped>
/* Card Design */
.bg-card {
    background: rgba(12, 16, 23, 0.8);
    backdrop-filter: blur(12px);
}

/* Action Buttons */
.action-button {
    transition: all 0.3s ease;
    text-align: left;
    
}

.action-button-unselected {
    background: hsl(var(--secondary));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
}

.action-button-unselected:hover {
    box-shadow: 0 0 15px rgba(102, 199, 255, 0.3);
}

.action-button-selected {
    background: linear-gradient(to right, hsl(var(--primary)), hsl(280, 60%, 50%));
    color: hsl(var(--background));
    border: none;
}

.secondary-button {
    background: hsl(var(--secondary));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
}

/* Gradients & Effects */
.bg-primary-gradient {
    background: linear-gradient(to right, hsl(var(--primary)), hsl(280, 60%, 50%));
}

.mystical-glow {
    box-shadow: 0 0 20px rgba(139, 69, 193, 0.4),
    0 0 40px rgba(59, 130, 246, 0.3),
    0 0 60px rgba(139, 69, 193, 0.2);
}

.mystical-glow:hover {
    box-shadow: 0 0 30px rgba(139, 69, 193, 0.6),
    0 0 60px rgba(59, 130, 246, 0.4),
    0 0 90px rgba(139, 69, 193, 0.3);
}

/* Text Styles */
.text-foreground {
    color: hsl(var(--foreground));
}

.text-muted-foreground {
    color: hsl(var(--muted-foreground));
}

.text-destructive {
    color: hsl(var(--destructive));
}
</style>