import {CreatureAPI} from "../Creature.js";

export class EasyAI {
    store;
    activeCreature;

    getAction(store) {
        this.store = store;
        this.activeCreature = store.activeCreature;

        let enemies = [];
        let allies = [];
        let availableActions = [];

        // Разделение существ на союзников и врагов
        for (const creature of store.creatures) {
            if (creature.health <= 0) continue;
            if (creature.direction === this.activeCreature.direction) {
                allies.push(creature);
            } else {
                enemies.push(creature);
            }
        }

        // Оценка действий
        this.activeCreature.actions.forEach(action => {
            if (action.pp > this.activeCreature.pp || action.currentCooldown > 0) {
                //навык недоступен
                return
            }
            
            if (action.actionType === 'melee' || action.actionType === 'ranged') {
                availableActions.push(this.getAttackTarget(action, enemies));
            } else if (action.actionType === 'treat') {
                availableActions.push(this.getTreatTarget(action, allies));
            }
        });

        availableActions.push(this.getMoveTarget(enemies, allies));

        return this.chooseAction(availableActions.filter(a => !!a));
    }

    getAttackTarget(attack, enemies) {
        // Ищем ближайшего противника, если таких несколько, то того у кого меньше ХП
        let path = []
        let target = undefined

        if (enemies.length === 1) {
            target = enemies[0]
            path = this.store.findPath(this.activeCreature.position, target.position, attack.actionType === 'melee')
        } else {
            enemies.forEach((enemy, i) => {
                // для теста. позже убрать
                if (enemy.role === 'support') {
                    return
                }
                const newPath = this.store.findPath(this.activeCreature.position, enemy.position, attack.actionType === 'melee')
                if (
                    !target
                    || newPath.length < path.length
                    || enemy.health < target.health
                ) {
                    path = newPath
                    target = enemy
                }
            })
        }

        if (!target) {
            return undefined
        }
        
        const speed = CreatureAPI.getSpeed(this.activeCreature)

        // для ближних атак дальность ограничена шагом, для дальних атак дальность ограничена навыком
        let limit = attack.actionType === 'melee' ? speed : attack.range

        // Если можем атаковать, то выбираем атаку
        if ((path.length - 1) <= limit) {
            return {
                weight: 100 - path.length,
                action: 'attack',
                actionObject: attack,
                targets: target.position,
            }
        }
        // в противном случае идем к цели
        else {
            return {
                weight: 50 - path.length, // Двигаться заведомо менее приоритетно
                action: 'move',
                targets: path[Math.min(speed - 1, path.length - 2)],
            }
        }
    }

    getTreatTarget(treat, allies) {
        // Если у навыка есть лечение, то выбираем существо в радиусе действия, которому требуется лечение и меньше здоровья
        // Если лечения нет, то выбираем существо в радиусе действия, у которого нет бафа 
        // Если в радиусе действия помочь некому, то возвращаем действие движения к ближайшему по тем же приоритетам
        let path = []
        let target = undefined
        let minHealth = undefined
        let inRange = false

        // Если личика только на себя, то целью может быть только само существо
        if (treat.range === 0) {
            allies = [this.activeCreature]
        }

        allies.forEach((ally, i) => {
            const newPath = this.store.findPath(this.activeCreature.position, ally.position)


            // Если уже есть существо в радиусе действия, то смотрим только тех, кто так же в радиусе действия
            if (inRange && newPath.length - 1 >= treat.range) {
                return
            }

            // Если действие может лечить, то выбираем тех, кому лечение нужно
            if (treat.baseDamage > 0) {
                // Лечение не требуется
                if (ally.health >= CreatureAPI.getMaxHealth(ally)) {
                    return
                }


                // Если прошлое существо не в радиусе, а новое в радиусе, то дальше не проверяем
                if (inRange === (newPath.length - 1 <= treat.range)) {
                    // Если уже есть союзник с меньшим количеством здоровья
                    if (minHealth !== undefined && minHealth <= ally.health) {
                        return
                    }
                }
            } else {
                // Если действие не лечит, то выбираем тех, у кого нет нужного эффекта
                if (treat.effects.some(effect => CreatureAPI.hasEffect(ally, effect))) {
                    return
                }


                // Если прошлое существо не в радиусе, а новое в радиусе, то дальше не проверяем
                if (inRange === (newPath.length - 1 <= treat.range)) {
                    // Если уже есть союзник с БОЛЬШИМ количеством здоровья 
                    // Минус стратегии в том, что не понятно, кому добавлять эфекты, нужно выбирать самое сильное существо возможно
                    if (minHealth !== undefined && minHealth >= ally.health) {
                        return
                    }
                }
            }

            path = newPath
            target = ally
            minHealth = ally.health
            inRange = newPath.length - 1 < treat.range
        })

        if (!target) {
            return
        }

        // дальность ограничена навыком
        let limit = treat.range

        // Если можем, то выбираем действие
        if ((path.length - 1) <= limit) {
            return {
                weight: 100 - path.length,
                action: 'treat',
                actionObject: treat,
                targets: target.position,
            }
        }
        // в противном случае идем к цели
        else {
            return {
                weight: 50 - path.length, // Двигаться заведомо менее приоритетно
                action: 'move',
                targets: path[Math.min(this.activeCreature.getSpeed() - 1, path.length - 2)],
            }
        }
    }

    getMoveTarget() {
        return
    }

    chooseAction(availableActions) {
        let attackAction
        let treatAction
        let moveAction

        availableActions.forEach(action => {
            switch (action.action) {
                case 'attack':
                    if (!attackAction || attackAction.weight < action.weight) {
                        attackAction = action;
                    }
                    break;
                case 'treat':
                    if (!treatAction || treatAction.weight < action.weight) {
                        treatAction = action;
                    }
                    break;
                case 'move':
                    if (!moveAction || moveAction.weight < action.weight) {
                        moveAction = action;
                    }
                    break;
            }
        });

        const actionsWithWeight = []

        // TODO: Уточнить веса для разных ролей и ситуаций
        if (this.activeCreature.role === 'support') {
            if (attackAction) actionsWithWeight.push({...attackAction, weight: 30});
            if (treatAction) actionsWithWeight.push({...treatAction, weight: 60});
            if (moveAction) actionsWithWeight.push({...moveAction, weight: 10});
        } else {
            if (attackAction) actionsWithWeight.push({...attackAction, weight: 70});
            if (treatAction) actionsWithWeight.push({...treatAction, weight: 20});
            if (moveAction) actionsWithWeight.push({...moveAction, weight: 10});
        }

        // Если доступно только одно действие (кроме пропуска)
        if (actionsWithWeight.length === 1) {
            return actionsWithWeight[0];
        }

        // Нормализуем веса, чтобы сумма была 100
        const totalWeight = actionsWithWeight.reduce((sum, a) => sum + a.weight, 0);
        const normalizedActions = actionsWithWeight.map(a => {
            a.weight = a.weight / totalWeight * 100
            return a
        });

        // Генерируем случайное число от 0 до 100
        const random = Math.random() * 100;
        let cumulativeWeight = 0;

        // Выбираем действие на основе случайного числа
        for (const action of normalizedActions) {
            cumulativeWeight += action.weight;
            if (random <= cumulativeWeight) {
                return action;
            }
        }

        // На всякий случай возвращаем пропуск
        return {action: 'skip'};
    }
}