<script setup>
import CreatureCard from "./CreatureCard.vue";
import EffectSpan from "./EffectSpan.vue";
import { computed, ref } from "vue";
import { useBattleStore } from "../../store/battle.js";
import { useGlobalStore } from "../../store/global.js";

// Импортируем хелперы
import {
  getElementIcon as getElementIconPath,
  getEmotionIcon as getEmotionIconPath,
  getShapeIcon as getShapeIconPath
} from "../../game/classes/iconHelper.js";

const battleStore = useBattleStore();
const globalStore = useGlobalStore();

const activeCreature = computed(() => battleStore.activeCreature);
const selectedActionId = computed(() => battleStore.selectedActionId);

// Тип действия — оставляем эмодзи
function getActionTypeIcon(action) {
  if (action.range === 0) {
    return '🛡️';
  }
  return { melee: '🗡️', ranged: '🏹', treat: '❤' }[action.actionType];
}

// Получаем иконку действия: элемент → эмоция → форма
function getActionIcon(action) {
  if (action.element) {
    const src = getElementIconPath(action.element);
    return {
      type: 'element',
      src,
      color: 'red-9'
    };
  }
  if (action.emotion) {
    const src = getEmotionIconPath(action.emotion);
    return {
      type: 'emotion',
      src,
      color: 'red-9'
    };
  }
  if (action.shape) {
    const src = getShapeIconPath(action.shape);
    return {
      type: 'shape',
      src,
      color: 'accent'
    };
  }
  return null;
}

const confirmSkip = ref(false);
const confirmDelay = ref(false);

function openDialog() {
  globalStore.setDialogVisible(true);
}

function closeDialog() {
  globalStore.setDialogVisible(false);
}
</script>

<template>
  <!-- Диалог "Защита" -->
  <q-dialog v-model="confirmSkip" persistent class="text-foreground" @show="openDialog" @hide="closeDialog">
    <q-card class="bg-card border backdrop-blur-md">
      <q-card-section class="row items-center">
        <!-- Заменяем иконку щита на PNG, если нужно, но пока оставим как есть -->
        <q-avatar icon="shield" class="bg-primary text-background"/>
        <span class="q-ml-sm text-foreground">Вы уверены, что хотите принять защитную стойку?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Сражаться!" class="text-muted-foreground" v-close-popup/>
        <q-btn
            flat
            label="Защищаться!"
            class="bg-primary-gradient text-background mystical-glow"
            v-close-popup
            @click="() => battleStore.selectAction('skip')"
            icon="shield"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Диалог "Отложить" -->
  <q-dialog v-model="confirmDelay" persistent class="text-foreground" @show="openDialog" @hide="closeDialog">
    <q-card class="bg-card border backdrop-blur-md">
      <q-card-section class="row items-center">
        <q-avatar icon="hourglass_empty" class="bg-primary text-background"/>
        <span class="q-ml-sm text-foreground">Пока недоступно. Иди сражайся!</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Сражаться!" class="text-muted-foreground" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Карточка существа -->
  <CreatureCard
      v-if="activeCreature && activeCreature.id"
      :creature="activeCreature"
      :key="activeCreature.id"
      :show-health="true"
  />

  <!-- Панель действий -->
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
        <!-- Круговой индикатор с иконкой -->
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
          <!-- Подставляем PNG, если иконка из хелпера -->
          <template v-if="getActionIcon(action)?.src">
            <q-avatar size="sm">
              <img :src="getActionIcon(action).src" alt="" />
            </q-avatar>
          </template>
          <!-- Если не из хелпера — оставляем иконку (например, для actionType) -->
          <q-icon
              v-else
              name="help"
              color="accent"
              size="sm"
          />
        </q-knob>

        <!-- Название действия -->
        <div class="col-12 text-left text-foreground">
          {{ getActionTypeIcon(action) }} {{ action.name }}
        </div>

        <!-- Дальность -->
        <div class="col-12 text-left text-foreground" v-if="action.range > 1">
          📏 {{ action.range }}
        </div>

        <!-- Стоимость PP и CD -->
        <div class="col-12 text-left">
          <span :class="{ 'text-destructive': action.pp > activeCreature.pp }">
            PP: {{ action.pp }}
          </span>
          <span
              v-if="action.cooldown > 0"
              :class="{ 'text-destructive': action.currentCooldown > 0 }"
              class="q-ml-sm"
          >
            CD: {{ action.currentCooldown }} / {{ action.cooldown }}
          </span>
        </div>

        <!-- Шанс попадания, крит, урон -->
        <div class="col-12 text-left text-foreground">
          🎯 {{ action.hitChance * 100 }}%
          <span v-if="action.critChance > 0">💢 {{ action.critChance * 100 }}%</span>
          💥 {{ action.baseDamage }}
        </div>

        <!-- Эффекты действия -->
        <div class="col-12 text-left text-foreground" v-if="action.effects.length">
          <q-separator class="bg-border" />
          <div v-for="effect in action.effects" :key="effect.effect">
            <EffectSpan :effect="effect" />
            <span v-if="effect.duration > 1" class="q-pl-xs">x{{ effect.duration }}</span>
            🎲 {{ effect.chance * 100 }}%
          </div>
        </div>
      </q-btn>

      <!-- Кнопки действий -->
      <q-btn
          class="col-6 secondary-button"
          icon="fast_forward"
          label="Отложить"
          @click="confirmDelay = true"
      />
      <q-btn
          class="secondary-button"
          icon="shield"
          label="Защита"
          @click="confirmSkip = true"
      />
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