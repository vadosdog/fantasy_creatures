import {CreatureAPI} from "./Creature.js";

export class QueueController {
    constructor(creatures) {
        this.creatures = creatures
        this.turnQueue = []; // Очередь ходов текущего раунда
        this.currentTurnIndex = 0; // Индекс текущего существа в очереди
        this.round = 1; // Текущий раунд
        this.delayedCreatures = []; // Массив ID юнитов, отложивших ход (в обратном порядке откладывания)
        this.alreadyTurned = new Set()
        this.currentCreature = null

        this.updateTurnQueue()

        // первый ход
        this.currentCreature = this.turnQueue[this.currentTurnIndex] || null
    }

    updateTurnQueue() {
        // Фильтруем мертвых существ
        const aliveCreatures = this.creatures.filter(creature => creature.health > 0);

        // Сортируем по инициативе
        aliveCreatures.sort((a, b) => {
            const aInitiative = CreatureAPI.getInitiative(a);
            const bInitiative = CreatureAPI.getInitiative(b);

            if (aInitiative === bInitiative) {
                if (a.direction !== b.direction) {
                    return a.direction === 'left' ? 1 : -1;
                }
                return a.id - b.id;
            }
            return bInitiative - aInitiative;
        });

        // Применяем отложенные ходы
        this.turnQueue = this.applyDelayActions(aliveCreatures);

        // Находим следующее существо, которое еще не ходило
        this.currentTurnIndex = this.turnQueue.findIndex(c => !this.alreadyTurned.has(c));
    }

    // Применяем отложенные ходы: удаляем отложивших из очереди, добавляем в конец в порядке откладывания
    applyDelayActions(creatures) {
        const queueWithoutDelayed = creatures.filter(c => !this.delayedCreatures.includes(c.id));

        // Находим отложивших в порядке откладывания
        const delayedCreaturesInOrder = this.delayedCreatures
            .map(id => this.creatures.find(c => c.id === id))
            .filter(Boolean); // Убираем undefined

        return [...queueWithoutDelayed, ...delayedCreaturesInOrder];
    }

    nextTurn() {
        this.currentCreature = this.turnQueue[this.currentTurnIndex];
    }

    endTurn(isDelayTurn = false) {
        if (!isDelayTurn) {
            this.alreadyTurned.add(this.currentCreature);
        } else {
            // Добавляем в список отложивших (если ещё не добавлен)
            if (!this.delayedCreatures.includes(this.currentCreature.id)) {
                this.delayedCreatures.unshift(this.currentCreature.id);
            }
        }

        this.updateTurnQueue();

        if (this.currentTurnIndex === -1) {
            this.endRound();
        }
    }

    endRound() {
        this.round++;
        this.delayedCreatures = []; // Очищаем отложенные ходы
        this.alreadyTurned = new Set();
        this.updateTurnQueue();
    }

    getNextQueue() {
        return this.turnQueue.slice(this.currentTurnIndex + 1);
    }

    // Отложить ход: текущий юнит откладывает ход
    handleDelayedTurn() {
        if (this.canDelayTurn()) {
            // Мы не передаём afterCreature — просто откладываем
            this.endTurn(true); // true = это отложенный ход
        }
    }

    // Можно ли отложить ход?
    canDelayTurn() {
        // Проверяем, есть ли текущий юнит
        if (!this.currentCreature) return false;

        const creatureId = this.currentCreature.id;

        // 1. Уже откладывал ход в этом раунде?
        if (this.delayedCreatures.includes(creatureId)) {
            return false;
        }

        // 2. Является ли последним в очереди?
        const currentIndex = this.turnQueue.findIndex(c => c.id === creatureId);
        if (currentIndex === -1) return false;

        // Если после него никого нет — он последний
        const isLastInQueue = currentIndex === this.turnQueue.length - 1;
        if (isLastInQueue) {
            return false;
        }

        return true;
    }
    // Остальной код без изменений
    isBuff(effect) {
        return ['empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense', 'taunt'].includes(effect)
    }

    getQueueData() {
        return this.turnQueue.map(creature => ({
            id: creature.id,
            name: creature.name,
            texture: creature.texture,
            health: creature.health,
            maxHealth: creature.maxHealth || 100,
            pp: creature.pp || 0,
            maxPP: creature.maxPP || 100,
            effects: creature.effects,
            buffs: creature.effects.filter(e => this.isBuff(e.effect)) || [],
            debuffs: creature.effects.filter(e => !this.isBuff(e.effect)) || [],
            direction: creature.direction,
            isActive: creature.id === this.currentCreature?.id,
            attackStat: creature.attackStat,
            defenseStat: creature.defenseStat,
            willStat: creature.willStat,
            initiativeStat: creature.initiativeStat,
            maxHealthStat: creature.maxHealthStat,
            level: creature.level,
            emotion: creature.emotion,
            shape: creature.shape,
            element: creature.element,
        }));
    }
}