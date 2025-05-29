import {CombatHandler} from "../CombatHandler.js";
import {
    AegisEffect,
    BleedEffect,
    BlindEffect,
    BurnEffect,
    ChillEffect,
    CleanseEffect,
    ConfusionEffect,
    CurseEffect,
    DefenseEffect,
    EmpowerEffect,
    FearEffect,
    FreezeEffect,
    HasteEffect,
    LuckEffect,
    MadnessEffect,
    PoisonEffect,
    RegenEffect,
    ThornsEffect
} from "../Effects/BaseEffect.js";

export class MediumAI {
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
        this.activeCreature.getActions().forEach(action => {
            if (action.actionType === 'melee' || action.actionType === 'ranged') {
                availableActions.push(this.getAttackTarget(action, enemies));
            } else if (action.actionType === 'treat') {
                availableActions.push(this.getTreatTarget(action, allies));
            }
        });

        availableActions.push(this.getMoveTarget(enemies, allies));

        return this.chooseAction(availableActions.filter(a => !!a));
    }

    getDebuffWeight(effect, enemy) {
        let weight = CombatHandler.getPushEffectChance(this.activeCreature, enemy, effect)
        if (enemy.hasEffect(effect.effect) > 1) {
            // если такой эффект уже есть, то вес меньше
            weight *= 0.8
        }
        switch (effect.effect) {
            case 'freeze':
                weight *= 1.3
                break
            case 'bleed':
            case 'burn':
                weight *= 1.4
                break
            case 'poison':
                weight *= 1.2
                break
            case 'blind':
                weight *= 1.3
                break
            case 'fear':
                weight *= 1.25
                break
            case 'madness':
                switch (enemy.role) {
                    case 'dd':
                        weight = 0.5
                        break
                    default:
                        weight *= 1.2
                }
                break
            case 'chill':
            case 'curse':
            case 'confusion':
                weight *= 1.1
                break
        }
        return weight
    }

    getBuffWeight(effect, ally) {
        let weight = 1
        if (ally.hasEffect(effect.effect)) {
            // если такой эффект уже есть, то вес меньше
            weight *= 0.8
        }
        switch (effect.effect) {
            case 'empower':
            case 'madness':
            case 'regen':
            case 'luck':
                weight *= (ally.role === 'dd' ? 1.5 : 1) * (ally.role === 'tank' ? 1.2 : 1);
                break
            case 'haste':
                weight *= 1.3;
                break
            case 'thorns':
            case 'aegis':
            case 'defense':
                weight *= (ally.role === 'dd' ? 1.2 : (ally.role === 'tank' ? 1.3 : 0.8));
                break
            case 'cleanse':
                if (ally.hasDebuff()) {
                    weight *= 1.5
                } else {
                    weight *= 0.5
                }
        }

        return weight
    }

    getAttackTarget(attack, enemies) {
        let bestTarget = null;
        let bestScore = -Infinity;
        const limit = attack.actionType === 'melee' ? this.activeCreature.getSpeed() : attack.range;

        enemies.forEach(enemy => {
            const path = this.store.findPath(this.activeCreature.position, enemy.position, attack.actionType === 'melee');
            const distance = path.length - 1;

            const estimatedDamage = CombatHandler.getAttackDamage(this.activeCreature, enemy, attack, false, true)
                * CombatHandler.getHitChance(this.activeCreature, enemy, attack)
            let score = Math.min(30, estimatedDamage) *
                (1 / Math.max(1, distance)) *
                (2 - (enemy.health / enemy.getMaxHealth())) * // Больший вес раненым
                (enemy.role === 'support' ? 1.5 : 1) // Приоритет саппортам

            attack.effects.forEach(effect => score *= this.getDebuffWeight(effect, enemy)) // докидываем веса за эффекты

            if (score > bestScore) {
                bestScore = score;
                bestTarget = {
                    enemy,
                    path,
                    distance
                };
            }
        });

        let weight = bestScore
        if (bestTarget) {
            if (bestTarget.distance <= limit) {
                if (this.activeCreature.role !== 'support') {
                    weight *= 1.5
                }
                return {
                    weight: weight,
                    action: 'attack',
                    actionObject: attack,
                    targets: bestTarget.enemy.position,
                };
            } else {
                if (attack.actionType !== 'melee') {
                    bestTarget.path = this.store.findPath(this.activeCreature.position, bestTarget.enemy.position, true)
                }
                // Если не можем атаковать, двигаемся к лучшей цели
                weight *= 0.85
                if (this.activeCreature.role !== 'support') {
                    weight *= 1.5
                }
                return {
                    weight: weight,
                    action: 'move',
                    targets: bestTarget.path[Math.min(this.activeCreature.getSpeed() - 1, bestTarget.path.length - 2)],
                };

            }

        }


        return null;
    }

    getTreatTarget(treat, allies) {
        let bestTarget = null;
        let bestScore = -Infinity;
        const limit = treat.range;

        allies.forEach(ally => {
            if (limit === 0 && ally.id !== this.activeCreature.id) {
                return
            }
            const path = this.store.findPath(this.activeCreature.position, ally.position);
            const distance = path.length - 1;

            if (distance <= treat.range) {
                let score = 30;

                if (treat.baseDamage > 0) { // Лечение
                    if (ally.health >= ally.getMaxHealth()) return;

                    const healNeeded = ally.getMaxHealth() - ally.health;
                    score += healNeeded * (ally.role === 'tank' ? 1.5 : 1) * (ally.role === 'dd' ? 1.3 : 1);

                    if (ally.health > ally.getMaxHealth() * 0.8) {
                        score /= 2; // Меньше лечить почти здоровых
                    }
                }


                treat.effects.forEach(effect => score *= this.getBuffWeight(effect, ally)) // докидываем веса за эффекты

                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = {
                        ally,
                        path,
                        distance
                    };
                }
            }
        });

        if (bestTarget) {
            if (bestTarget.distance <= limit) {
                return {
                    weight: bestScore,
                    action: 'treat',
                    actionObject: treat,
                    targets: bestTarget.ally.position,
                };
            } else {
                bestTarget.path = this.store.findPath(this.activeCreature.position, bestTarget.ally.position, true)

                return {
                    weight: bestScore * 0.85,
                    action: 'move',
                    targets: bestTarget.path[Math.min(this.activeCreature.getSpeed() - 1, bestTarget.path.length - 2)],
                };

            }

        }

        return null;
    }

    getMoveTarget(enemies, allies) {
        // В getMoveTarget добавить:
        if (enemies.length === 1) {
            const enemy = enemies[0]
            const path = this.store
                .findPath(this.activeCreature.position, enemy.position, true)
            // Если враг и так стоит вплотную, то нет необходимости перемещаться
            if (path.length <= 2) {
                return
            }

            // Если остался 1 враг - двигаемся агрессивно
            return {
                weight: 80,
                action: 'move',
                targets: path[Math.min(this.activeCreature.getSpeed() - 1, path.length - 2)]
            };
        }
        // TODO: Реализовать более умное позиционирование (укрытия, фланги и т.д.)
        return undefined
        // Пока просто двигаемся к ближайшему врагу или союзнику, нуждающемуся в помощи
        let targetPos = null;
        let minDistance = Infinity;

        if (this.activeCreature.role === 'support') {
            // Для саппортов ищем раненых союзников
            allies.forEach(ally => {
                if (ally.health < ally.getMaxHealth() * 0.7) {
                    const path = this.store.findPath(this.activeCreature.position, ally.position);
                    if (path.length - 1 < minDistance) {
                        minDistance = path.length - 1;
                        targetPos = path[Math.min(this.activeCreature.getSpeed() - 1, path.length - 2)];
                    }
                }
            });
        }

        if (!targetPos) {
            // Иначе двигаемся к ближайшему врагу
            enemies.forEach(enemy => {
                const path = this.store.findPath(this.activeCreature.position, enemy.position);
                if (path.length - 1 < minDistance) {
                    minDistance = path.length - 1;
                    targetPos = path[Math.min(this.activeCreature.getSpeed() - 1, path.length - 2)];
                }
            });
        }

        return targetPos ? {
            weight: 30,
            action: 'move',
            targets: targetPos,
        } : null;
    }

    chooseAction(availableActions) {
        const role = this.activeCreature.role
        let attackAction;
        let treatAction;
        let moveAction;

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

        const actionsWithWeight = [];

        if (this.activeCreature.role === 'tank') {
            if (treatAction && this.activeCreature.health > this.activeCreature.getMaxHealth() * 0.7) {
                treatAction.weight = 5;
            }

            if (attackAction) actionsWithWeight.push({...attackAction,});
            if (treatAction) actionsWithWeight.push({...treatAction,});
            if (moveAction) actionsWithWeight.push({...moveAction});

        } else if (this.activeCreature.role === 'support') {
            if (attackAction) actionsWithWeight.push({...attackAction});
            if (treatAction) actionsWithWeight.push({...treatAction});
            if (moveAction) actionsWithWeight.push({...moveAction});
        } else {
            if (attackAction) actionsWithWeight.push({...attackAction});
            if (treatAction) actionsWithWeight.push({...treatAction});
            if (moveAction) actionsWithWeight.push({...moveAction});
        }

        // Добавляем пропуск хода с низким приоритетом
        actionsWithWeight.push({
            action: 'skip',
            weight: 5
        });

        if (actionsWithWeight.length === 0) {
            return {action: 'skip'};
        }

        // Нормализация весов
        const totalWeight = actionsWithWeight.reduce((sum, a) => sum + a.weight, 0);
        const random = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (const action of actionsWithWeight) {
            cumulativeWeight += action.weight;
            if (random <= cumulativeWeight) {
                return action;
            }
        }

        return {action: 'skip'};
    }
}