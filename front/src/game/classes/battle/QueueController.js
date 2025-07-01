import {CreatureAPI} from "./Creature.js";

export class QueueController {
    constructor(creatures) {
        this.creatures = creatures
        this.turnQueue = []; // Очередь ходов текущего раунда
        this.currentTurnIndex = 0; // Индекс текущего существа в очереди
        this.round = 1; // Текущий раунд
        this.delayActions = {}; // Информация о пропущенных ходах
        this.alreadyTurned = new Set()
        this.currentCreature = null

        this.updateTurnQueue()

        // первый ход
        this.currentCreature = this.turnQueue[this.currentTurnIndex] || null
    }

    updateTurnQueue() {
        // Фильтруем мертвых существ
        const aliveCreatures = this.creatures.filter(creature => creature.health > 0);

        // Сортируем по инициативе (с учетом бафов/дебафов)
        aliveCreatures.sort((a, b) => {
            const aInitiative = CreatureAPI.getInitiative(a);
            const bInitiative = CreatureAPI.getInitiative(b);

            if (aInitiative === bInitiative) {
                // В случае ничьи - в пользу игрока
                if (a.direction !== b.direction) {
                    return a.direction === 'left' ? 1 : -1
                }

                // Или по ИД
                return a.id - b.id

                // Старая логика, меняет постоянно существ с равной инициативой
                // return a.direction !== b.direction ? -1 : 1;
            }
            return bInitiative - aInitiative;
        });

        // Применяем изменения от пропущенных ходов
        this.turnQueue = this.applyDelayActions(aliveCreatures);

        // Находим новую позицию
        this.currentTurnIndex = this.turnQueue.findIndex(c => !this.alreadyTurned.has(c));
    }

    // Применение изменений от пропущенных ходов
    applyDelayActions(creatures) {
        const newQueue = [...creatures];

        for (const creature of creatures) {
            const delayAction = this.delayActions[creature.id];
            if (!delayAction) continue;

            // Находим текущую позицию существа
            const currentIndex = newQueue.findIndex(c => c.id === creature.id);
            if (currentIndex === -1) continue;

            // Находим целевое существо, после которого нужно встать
            const targetIndex = newQueue.findIndex(c => c.id === delayAction.afterCreature.id);
            if (targetIndex === -1 || targetIndex <= currentIndex) continue;

            // Перемещаем существо
            const [movedCreature] = newQueue.splice(currentIndex, 1);
            newQueue.splice(targetIndex, 0, movedCreature);
        }

        return newQueue;
    }

    // Переход к следующему ходу
    nextTurn() {
        // Получаем текущее существо
        this.currentCreature = this.turnQueue[this.currentTurnIndex];

        // Обновляем UI
        // this.updateUI(currentCreature);
    }

    endTurn(isDelayTurn = false) {
        if (!isDelayTurn) {
            this.alreadyTurned.add(this.currentCreature)
        }
        this.updateTurnQueue()
        if (this.currentTurnIndex === -1) {
            return this.endRound()
        }
    }

    // Завершение раунда
    endRound() {
        this.round++;

        // Очищаем пропуски ходов
        this.delayActions = {}

        this.alreadyTurned = new Set()

        // Обновляем очередь для нового раунда
        this.updateTurnQueue();
    }

    getNextQueue() {
        return this.turnQueue.slice(this.currentTurnIndex + 1)
    }

    handleDelayedTurn(afterCreature) {
        this.delayActions[this.currentCreature.id] = {
            creature: this.currentCreature,
            afterCreature,
        }
    }

    canDelayTurn() {
        return this.delayActions[this.currentCreature.id] === undefined
    }// ... существующий код ...

    isBuff(effect) {
        return ['empower', 'haste', 'luck', 'regen', 'thorns', 'aegis', 'defense'].includes(effect)
    }

    getQueueData() {
        return this.turnQueue.map(creature => ({
            id: creature.id,
            name: creature.name,
            texture: creature.texture,
            health: creature.health,
            maxHealth: creature.maxHealth || 100, // Добавляем если нет
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
            form: creature.form,
            element: creature.element,
        }));
    }
}