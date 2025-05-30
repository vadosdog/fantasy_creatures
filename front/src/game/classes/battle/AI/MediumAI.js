import {CombatHandler} from "../CombatHandler.js";

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

// Веса действий по ролям
const ROLE_WEIGHTS = {
    tank: {
        attack: 1.0,
        treat: 15, // тк у танков по умолчанию нет лечилок, без большого приоритета защиты не будут использованы никогда
        move: 0.8,
        skip: 0.3
    },
    dd: {
        attack: 1.5,
        treat: 5,
        move: 1.0,
        skip: 0.2
    },
    support: {
        attack: 0.8,
        treat: 1.8,
        move: 1.0,
        skip: 0.4
    }
};

export class MediumAI {
    store;
    activeCreature;

    getAction(store) {
        this.store = store;
        this.activeCreature = store.activeCreature;

        const enemies = store.creatures.filter(c => c.health > 0 && c.direction !== this.activeCreature.direction);
        const allies = store.creatures.filter(c => c.health > 0 && c.direction === this.activeCreature.direction && c.id !== this.activeCreature.id);

        let availableActions = [];

        // Оценка действий        
        // 1. Действия навыков
        this.activeCreature.getActions().forEach(action => {
            if (action.pp > this.activeCreature.pp || action.currentCooldown > 0) {
                return;
            }

            if (action.actionType === 'melee' || action.actionType === 'ranged') {
                const attackAction = this.getAttackTarget(action, enemies);
                if (attackAction) availableActions.push(attackAction);
            } else if (action.actionType === 'treat') {
                const treatAction = this.getTreatTarget(action, [...allies, this.activeCreature]);
                if (treatAction) availableActions.push(treatAction);
            }
        });

        // 2. Перемещение
        const moveAction = this.getMoveTarget(enemies, allies);
        if (moveAction) availableActions.push(moveAction);

        // 3. Защита и пропуск хода
        availableActions.push({
            action: 'defense',
            weight: ROLE_WEIGHTS[this.activeCreature.role].skip,
            ppCost: 0
        });

        // 4. Учет PP
        availableActions = availableActions.map(action => {
            const ppModifier = this.getPpModifier(action.ppCost);
            return {
                ...action,
                weight: action.weight * ppModifier
            };
        });

        // Выбор лучшего действия
        return this.chooseAction(availableActions);
    }

    getPpModifier(ppCost) {
        const ppRatio = this.activeCreature.pp / this.activeCreature.getMaxPP();

        // Для дорогих навыков при низком PP
        if (ppCost > 5 && ppRatio < 0.3) return 0.4;

        // Для дешевых навыков
        if (ppCost <= 2) return 1.2;

        // Стандартный модификатор
        return Math.min(1.0, 0.7 + ppRatio * 0.6);
    }

    getEffectWeight(effect, target) {
        const effectWeight = EFFECT_WEIGHTS[effect.effect] || {};
        let weight = effectWeight.base || 1.0;

        if (effect.duration > 1) {
            weight += (effectWeight.perTurn || 0.1) * (effect.duration - 1);
        }

        if (target.hasEffect(effect.effect)) {
            weight *= 0.6; // Уменьшаем вес если эффект уже есть
        }

        weight *= CombatHandler.getPushEffectChance(this.activeCreature, target, effect);
        return weight;
    }

    getAttackTarget(attack, enemies) {
        const role = this.activeCreature.role;

        let bestTarget = null;
        let bestScore = -Infinity;
        const rangeLimit = attack.actionType === 'melee' ?
            this.activeCreature.getSpeed() :
            attack.range;


        enemies.forEach(enemy => {
            const path = this.store.findPath(this.activeCreature.position, enemy.position, attack.actionType === 'melee');
            const distance = path.length - 1;

            let score = CombatHandler.getAttackDamage(
                this.activeCreature,
                enemy,
                attack,
                false,
                true
            ) * CombatHandler.getHitChance(this.activeCreature, enemy, attack);

            // Приоритет целей
            score *= 1.0 + (1.0 - enemy.health / enemy.getMaxHealth()); // Раненым целям
            if (enemy.role === 'support') {
                score *= 1.4; // Приоритет саппортов
            }
            if (enemy.role === 'dd') {
                score *= 1.2; // Приоритет ДД
            }

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

        if (!bestTarget) {
            return null
        }

        let weight = bestScore
        if (bestTarget.distance <= rangeLimit) {
            weight *= ROLE_WEIGHTS[role].attack // докидываем за действие атаки
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
            weight *= ROLE_WEIGHTS[role].move // докидываем за действие движения
            return {
                weight: weight,
                action: 'move',
                targets: bestTarget.path[Math.min(this.activeCreature.getSpeed() - 1, bestTarget.path.length - 2)],
            };

        }
    }

    getTreatTarget(treat, allies) {
        let bestTarget = null;
        let bestScore = -Infinity;
        const limit = treat.range;
        const role = this.activeCreature.role;

        allies.forEach(ally => {
            if (limit === 0 && ally.id !== this.activeCreature.id) {
                return
            }
            const path = this.store.findPath(this.activeCreature.position, ally.position);
            const distance = path.length - 1;

            let score = 0; //не знаю надо побалансить

            if (treat.baseDamage > 0) { // Лечение
                const healNeeded = ally.getMaxHealth() - ally.health;
                score += healNeeded * (ally.role === 'tank' ? 1.5 : 1) * (ally.role === 'dd' ? 1.3 : 1);
            }


            treat.effects.forEach(effect => score += this.getEffectWeight(effect, ally)) // докидываем веса за эффекты


            // Увеличение при низком здоровье
            if (ally.health < ally.getMaxHealth() * 0.7) {
                score *= 1.4;
            }

            if (score > bestScore) {
                bestScore = score;
                bestTarget = {
                    ally,
                    path,
                    distance
                };
            }
        });

        if (!bestTarget) {
            return
        }
        if (bestTarget.distance <= limit) {
            return {
                weight: bestScore * ROLE_WEIGHTS[role].treat,
                action: 'treat',
                actionObject: treat,
                targets: bestTarget.ally.position,
            };
        } else {
            bestTarget.path = this.store.findPath(this.activeCreature.position, bestTarget.ally.position, true)

            return {
                weight: bestScore * ROLE_WEIGHTS[role].move,
                action: 'move',
                targets: bestTarget.path[Math.min(this.activeCreature.getSpeed() - 1, bestTarget.path.length - 2)],
            };

        }
    }

    getMoveTarget(enemies, allies) {
        return undefined
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
            // При таком подходе он просто дойдет до врага и остановится
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

    chooseAction(availableActions, enemiesCount) {
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

        // Костылька, если остался один враг и его нельзя атаковать то двигаемся к нему
        if (enemiesCount === 1 && !attackAction) {
            moveAction.weight *= 2
        }

        const actionsWithWeight = [];

        if (this.activeCreature.role === 'tank') {
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