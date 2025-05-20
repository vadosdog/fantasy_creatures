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
            const aInitiative = a.getInitiative();
            const bInitiative = b.getInitiative();

            if (aInitiative === bInitiative) {
                // В случае ничьи - случайный выбор
                return Math.random() > 0.5 ? -1 : 1;
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
    }
}