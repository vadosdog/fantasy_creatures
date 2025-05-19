export class QueueController {
    constructor(creatures) {
        this.creatures = creatures
        this.turnQueue = []; // Очередь ходов текущего раунда
        this.currentTurnIndex = 0; // Индекс текущего существа в очереди
        this.round = 1; // Текущий раунд
        this.skipActions = {}; // Информация о пропущенных ходах
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
            const aInitiative = this.getEffectiveInitiative(a);
            const bInitiative = this.getEffectiveInitiative(b);

            if (aInitiative === bInitiative) {
                // В случае ничьи - случайный выбор
                return Math.random() > 0.5 ? -1 : 1;
            }
            return bInitiative - aInitiative;
        });

        // Применяем изменения от пропущенных ходов
        this.turnQueue = this.applySkipActions(aliveCreatures);

        // Находим новую позицию
        this.currentTurnIndex = this.turnQueue.findIndex(c => !this.alreadyTurned.has(c));
    }

    // Получение эффективной инициативы с учетом бафов/дебафов
    getEffectiveInitiative(creature) {
        let initiative = creature.getInitiative();

        // Применяем модификаторы от пропусков хода в предыдущем раунде
        if (this.skipActions[creature.id]?.defensiveStance) {
            initiative *= 1.1; // +10% за защитную стойку
        } else if (this.skipActions[creature.id]?.delayedTurn) {
            initiative *= 0.9; // -10% за отложенный ход
        }

        return Math.floor(initiative);
    }

    // Применение изменений от пропущенных ходов
    applySkipActions(creatures) {
        const newQueue = [...creatures];

        for (const creature of creatures) {
            const skipAction = this.skipActions[creature.id];
            if (!skipAction || skipAction.defensiveStance) continue;

            if (skipAction.delayedTurn) {
                // Находим текущую позицию существа
                const currentIndex = newQueue.findIndex(c => c.id === creature.id);
                if (currentIndex === -1) continue;

                // Находим целевое существо, после которого нужно встать
                const targetIndex = newQueue.findIndex(c => c.id === skipAction.afterCreatureId);
                if (targetIndex === -1 || targetIndex <= currentIndex) continue;

                // Перемещаем существо
                const [movedCreature] = newQueue.splice(currentIndex, 1);
                newQueue.splice(targetIndex, 0, movedCreature);
            }
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

    endTurn() {
        this.alreadyTurned.add(this.currentCreature)
        this.updateTurnQueue()
        if (this.currentTurnIndex === -1) {
            return this.endRound()
        }
    }

    // Завершение раунда
    endRound() {
        this.round++;

        // Очищаем пропуски ходов из предыдущих раундов
        for (const creatureId in this.skipActions) {
            if (this.skipActions[creatureId].round < this.round - 1) {
                delete this.skipActions[creatureId];
            }
        }

        this.alreadyTurned = new Set()

        // Обновляем очередь для нового раунда
        this.updateTurnQueue();
    }

    // Обработка защитной стойки
    handleDefensiveStance() {

        // Записываем действие пропуска
        this.skipActions[this.currentCreature.id] = {
            defensiveStance: true,
            round: this.round
        };

        // Применяем баф защиты

        // Переходим к следующему существу
        this.nextTurn();
    }

    // Обработка отложенного хода
    handleDelayedTurn(currentCreature, targetCreature) {
        // Записываем действие пропуска
        this.skipActions[currentCreature.id] = {
            delayedTurn: true,
            afterCreatureId: targetCreature.id,
            round: this.round
        };

        // Пересчитываем очередь
        this.updateTurnQueue();

        // Переходим к следующему существу
        this.nextTurn();
    }
}