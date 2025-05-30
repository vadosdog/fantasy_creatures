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

const EFFECT_WEIGHTS = {
    defense: {base: 0.8, perTurn: 0.1, max: 1.1},
    luck: {base: 0.9, perTurn: 0.1, max: 1.2},
    thorns: {base: 1.3, perTurn: 0.15, max: 1.75},
    freeze: {base: 1.3, perTurn: 0.15, max: 1.75},
    regen: {base: 1.6, perTurn: 0.2, max: 2.2},
    fear: {base: 1.7, perTurn: 0.2, max: 2.3},
    aegis: {base: 1.8, perTurn: 0.25, max: 2.55},
    burn: {base: 2., perTurn: 0.25, max: 2.75},
    blind: {base: 2., perTurn: 0.25, max: 2.75},
    empower: {base: 2.5, perTurn: 0.3, max: 3.4},
    poison: {base: 2.8, perTurn: 0.35, max: 3.85},
    bleed: {base: 3, perTurn: 0.3, max: 3.9},
    madness: {base: 3.5, perTurn: 0.45, max: 4.85},
};


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
            // TODO можно добавить баланс, чтобы ИИ не тратил все PP до последнего
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

    getEffectWeight(effect, enemy) {
        const effectWeight = EFFECT_WEIGHTS[effect.effect] || {}
        let weight = effectWeight.base

        if (effect.duration > 1) {
            weight += effectWeight.perTurn * (effect.duration - 1);
        }
        
        if (enemy.hasEffect(effect.effect) > 1) {
            // если такой эффект уже есть, то вес меньше
            weight *= 0.8
        }
        
        weight *= CombatHandler.getPushEffectChance(this.activeCreature, enemy, effect)

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

            attack.effects.forEach(effect => score += this.getEffectWeight(effect, enemy)) // докидываем веса за эффекты

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


                treat.effects.forEach(effect => score *= this.getEffectWeight(effect, ally)) // докидываем веса за эффекты

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