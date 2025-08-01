import {CombatHandler} from "../CombatHandler.js";
import {CreatureAPI} from "../Creature.js";

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

const EMOTION_WEIGHTS = {
    rage: {      // Танки
        attack: 1.8,    // Высокий приоритет атаки
        treat: 1.2,     // Умеренный приоритет бафов
        move: 1.5,      // Высокий приоритет позиционирования
        skip: 0.1,
        defense: 0.8    // Приоритет защиты
    },
    passion: {   // ДД
        attack: 2.5,    // Максимальный приоритет атаки
        treat: 0.3,     // Очень низкий приоритет лечения
        move: 0.8,      // Низкий приоритет движения
        skip: 0.05,
        defense: 0.8    // Низкий приоритет защиты
    },
    hope: {      // Саппорты
        attack: 0.7,    // Низкий приоритет атаки
        treat: 2.2,     // Высокий приоритет лечения/бафов
        move: 1.4,      // Высокий приоритет позиционирования
        skip: 0.3,
        defense: 0.8    // Умеренный приоритет защиты
    }
};

export class HardAI {
    store;
    activeCreature;
    movablePositions;
    distancesFromActive;
    actionsData;
    activeCreatureSpeed;

    getAction(store) {
        this.store = store;
        this.activeCreature = store.activeCreature;
        this.movablePositions = store.getMoveablePositions(this.activeCreature);
        this.adjacentEnemies = store.getAdjacentEnemies(this.activeCreature.position, this.activeCreature.direction);
        this.activeCreatureSpeed = CreatureAPI.getSpeed(this.activeCreature)
        this.maxHealths = {}
        for (const creature of store.creatures) {
            this.maxHealths[creature.id] = CreatureAPI.getMaxHealth(creature)
        }


        const enemies = store.creatures.filter(c => c.health > 0 && c.direction !== this.activeCreature.direction);
        const allies = store.creatures.filter(c => c.health > 0 && c.direction === this.activeCreature.direction && c.id !== this.activeCreature.id);
        
        
        // Предварительно вычисляем карту расстояний
        this.distancesFromActive = store.getDistancesFrom(this.activeCreature);
        this.actionsData = CombatHandler.getActionData(this.activeCreature, store.creatures, this.activeCreature.actions, this.distancesFromActive)

        let availableActions = [];

        // Оценка действий        
        // 1. Действия навыков
        this.activeCreature.actions.forEach(action => {
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
            weight: EMOTION_WEIGHTS[this.activeCreature.emotion].skip, // Увеличиваем вес защиты
            ppCost: 0
        });

        // 4. Учет PP
        // availableActions = availableActions.map(action => {
        //     const ppModifier = this.getPpModifier(action.ppCost || 0);
        //     return {
        //         ...action,
        //         weight: action.weight * ppModifier
        //     };
        // });

        // Выбор лучшего действия
        return this.chooseAction(availableActions, enemies.length);
    }

    getEffectWeight(effect, target, action) {
        const effectWeight = EFFECT_WEIGHTS[effect.effect] || {};
        let weight = effectWeight.base || 1.0;

        if (effect.duration > 1) {
            weight += (effectWeight.perTurn || 0.1) * (effect.duration - 1);
        }

        if (CreatureAPI.hasEffect(target, effect.effect)) {
            weight *= 0.6; // Уменьшаем вес если эффект уже есть
        }

        weight *= effect.chance + (this.actionsData?.[target.id]?.[action.id]?.pushEffectChanceMod ?? 0);
        return weight;
    }

    getAttackTarget(attack, enemies) {
        const emotion = this.activeCreature.emotion;
        const speed = this.activeCreatureSpeed;
        let bestTarget = null;
        let bestScore = -Infinity;

        // Проверка блокировки дальних атак
        if (attack.actionType === 'ranged' && this.adjacentEnemies.length > 0) {
            return null; // Дальняя атака заблокирована
        }

        // 1. Поиск лучшей цели (главная цель)
        const mainTarget = this.selectMainTarget(enemies, attack);

        // 2. Проверка возможности атаковать главную цель
        if (mainTarget) {
            const pathToMain = this.store.findPath(this.activeCreature.position, mainTarget.position);
            const distanceToMain = pathToMain.length - 1;
            
            const range = attack.actionType === 'ranged' ? attack.range : speed

            if (distanceToMain <= range) {
                // Можем атаковать главную цель сразу
                return this.createAttackAction(mainTarget, attack, emotion);
            }
        }

        // 3. Поиск промежуточных целей
        let bestIntermediateTarget = null;
        let bestIntermediateScore = -Infinity;

        enemies.forEach(enemy => {
            // Пропускаем главную цель - ее уже проверяли
            if (mainTarget && enemy.id === mainTarget.id) return;

            const path = this.store.findPath(this.activeCreature.position, enemy.position);
            const distance = path.length - 1;

            // Проверяем возможность атаковать цель
            if (distance > attack.range) return;

            // Рассчитываем оценку цели
            let score = this.calculateAttackScore(enemy, attack);

            // Бонус за приближение к главной цели
            if (mainTarget) {
                const currentDistToMain = this.store.getDistance(this.activeCreature.position, mainTarget.position);
                const newDistToMain = this.store.getDistance(enemy.position, mainTarget.position);

                // Значительное улучшение позиции (+50% бонус)
                if (newDistToMain < currentDistToMain - speed / 2) {
                    score *= 1.5;
                }
            }

            if (score > bestIntermediateScore) {
                bestIntermediateScore = score;
                bestIntermediateTarget = enemy;
            }
        });

        // 4. Возвращаем лучший вариант
        if (bestIntermediateTarget) {
            return this.createAttackAction(bestIntermediateTarget, attack, emotion);
        }

        // 5. Если ничего не найдено, двигаемся к главной цели
        if (mainTarget) {
            const path = this.store.findPath(this.activeCreature.position, mainTarget.position);
            const movePosition = path[Math.min(speed - 1, path.length - 2)];

            return {
                weight: 70 * EMOTION_WEIGHTS[emotion].move,
                action: 'move',
                targets: movePosition
            };
        }

        return null;
    }

    // Новые вспомогательные методы
    selectMainTarget(enemies, attack) {
        let bestTarget = null;
        let bestScore = -Infinity;

        enemies.forEach(enemy => {
            const score = this.calculateAttackScore(enemy, attack);
            if (score > bestScore) {
                bestScore = score;
                bestTarget = enemy;
            }
        });

        return bestTarget;
    }

    calculateAttackScore(enemy, attack) {
        let score = this.actionsData[enemy.id][attack.id].hitChance
            * this.actionsData[enemy.id][attack.id].attackDamage;

        // Приоритет целей
        score *= 1.0 + (1.0 - enemy.health / (this.maxHealths[enemy.id] || 1));

        // Приоритет по ролям (эмоциям)
        if (enemy.emotion === 'hope') score *= 1.8;
        if (enemy.emotion === 'passion') score *= 1.5;

        // Бонус за эффекты
        attack.effects.forEach(effect => {
            score += this.getEffectWeight(effect, enemy, attack);
        });

        return score;
    }

    createAttackAction(target, attack, emotion) {
        return {
            weight: 100 * EMOTION_WEIGHTS[emotion].attack,
            action: 'attack',
            actionObject: attack,
            targets: target.position,
            ppCost: attack.pp
        };
    }


    getTreatTarget(treat, allies) {
        let bestTarget = null;
        let bestScore = -Infinity;
        const limit = treat.range;
        const emotion = this.activeCreature.emotion;

        allies.forEach(ally => {
            const allyMaxHealth = this.maxHealths[ally.id] || 1
            if (limit === 0 && ally.id !== this.activeCreature.id) {
                return
            }
            const path = this.store.findPath(this.activeCreature.position, ally.position);
            const distance = path.length - 1;

            let score = 0;

            if (treat.baseDamage > 0) { // Лечение
                const healNeeded = allyMaxHealth - ally.health;
                score += healNeeded * (ally.emotion === 'rage' ? 1.5 : 1) * (ally.emotion === 'passion' ? 1.3 : 1);
            }

            treat.effects.forEach(effect => score += this.getEffectWeight(effect, ally, treat))

            // Увеличение при низком здоровье
            if (ally.health < allyMaxHealth * 0.7) {
                score *= 1.4;
            }

            // Уменьшение приоритета для себя при высоком здоровье
            if (ally.id === this.activeCreature.id && ally.health > allyMaxHealth * 0.8) {
                score *= 0.6;
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
                weight: bestScore * EMOTION_WEIGHTS[emotion].treat,
                action: 'treat',
                actionObject: treat,
                targets: bestTarget.ally.position,
                ppCost: treat.pp
            };
        } else {
            return {
                weight: bestScore * EMOTION_WEIGHTS[emotion].move,
                action: 'move',
                targets: bestTarget.path[Math.min(this.activeCreatureSpeed - 1, bestTarget.path.length - 2)],
                ppCost: 0
            };
        }
    }

    getMoveTarget(enemies, allies) {
        return;
        const speed = this.activeCreatureSpeed;
        const currentPos = this.activeCreature.position;
        const emotion = this.activeCreature.emotion;

        // Для танков: поиск позиции для блокировки нескольких врагов
        if (emotion === 'rage') {
            let bestPosition = null;
            let maxBlockScore = -Infinity;

            this.movablePositions.forEach(position => {
                // Оценка позиции по количеству блокируемых врагов
                const blockScore = enemies.reduce((score, enemy) => {
                    const dist = this.store.getDistance(position, enemy.position);
                    return score + (dist === 1 ? 1.5 : 0);
                }, 0);

                // Дополнительный бонус за защиту союзников
                const protectionScore = allies.filter(a =>
                    this.store.getDistance(position, a.position) === 1
                ).length * 1.2;

                // Штраф за опасные позиции
                const threatLevel = this.calculateThreatLevel(position, enemies);

                const totalScore = (blockScore + protectionScore) * EMOTION_WEIGHTS.rage.defense - threatLevel;
                if (totalScore > maxBlockScore) {
                    maxBlockScore = totalScore;
                    bestPosition = position;
                }
            });

            if (bestPosition && maxBlockScore > 1.5) {
                return {
                    weight: 50 + maxBlockScore * 20,
                    action: 'move',
                    targets: bestPosition
                };
            }
        }

        // Для ДД: отступление при угрозе
        if (emotion === 'passion' && this.adjacentEnemies.length > 0) {
            const safePositions = this.movablePositions
                .filter(pos => {
                    const adjEnemies = this.store.getAdjacentEnemies(pos, this.activeCreature.direction);
                    return adjEnemies.length === 0;
                })
                .sort((a, b) => {
                    // Сортировка по расстоянию до ближайшего врага
                    const minDistA = Math.min(...enemies.map(e => this.store.getDistance(a, e.position)));
                    const minDistB = Math.min(...enemies.map(e => this.store.getDistance(b, e.position)));
                    return minDistA - minDistB;
                });

            if (safePositions.length > 0) {
                return {
                    weight: 90 * EMOTION_WEIGHTS.passion.move,
                    action: 'move',
                    targets: safePositions[0]
                };
            }
        }

        // Для саппортов: движение к раненым союзникам
        if (emotion === 'hope') {
            let bestAlly = null;
            let minDistance = Infinity;

            allies.filter(ally => ally.health < (this.maxHealths[ally.id] || 1) * 0.7)
                .forEach(ally => {
                    const path = this.store.findPath(currentPos, ally.position);
                    if (path.length < minDistance) {
                        minDistance = path.length;
                        bestAlly = ally;
                    }
                });

            if (bestAlly) {
                const path = this.store.findPath(currentPos, bestAlly.position);
                return {
                    weight: 80 * EMOTION_WEIGHTS.hope.move,
                    action: 'move',
                    targets: path[Math.min(speed - 1, path.length - 2)]
                };
            }
        }

        // Общая логика: движение к ближайшему врагу
        let closestEnemy = null;
        let minDist = Infinity;

        enemies.forEach(enemy => {
            const dist = this.store.getDistance(currentPos, enemy.position);
            if (dist < minDist) {
                minDist = dist;
                closestEnemy = enemy;
            }
        });

        if (closestEnemy) {
            const path = this.store.findPath(currentPos, closestEnemy.position);
            return {
                weight: 40 * EMOTION_WEIGHTS[emotion].move,
                action: 'move',
                targets: path[Math.min(speed - 1, path.length - 2)]
            };
        }

        return null;
    }

    calculateThreatLevel(position, enemies) {
        return enemies.reduce((threat, enemy) => {
            const dist = this.store.getDistance(position, enemy.position);
            const damagePotential = enemy.attackPower * (1 - enemy.health / (this.maxHealths[enemy.id] || 1));
            return threat + damagePotential / (dist + 1);
        }, 0);
    }

    chooseAction(availableActions, enemiesCount) {
        // Если остался один враг - усилить агрессию
        if (enemiesCount === 1) {
            availableActions.forEach(action => {
                if (action.action === 'attack') action.weight *= 1.5;
                if (action.action === 'move') action.weight *= 1.3;
            });
        }

        // Критическое здоровье - усилить защиту
        const healthRatio = this.activeCreature.health / (this.maxHealths[this.activeCreature.id] || 1);
        if (healthRatio < 0.3) {
            availableActions.forEach(action => {
                if (action.action === 'defense') action.weight *= 2.0;
                if (action.action === 'treat') action.weight *= 1.8;
                if (action.action === 'attack') action.weight *= 0.6;
            });
        }

        // Выбор действия с максимальным весом
        let bestAction = availableActions[0];
        for (let i = 1; i < availableActions.length; i++) {
            if (availableActions[i].weight > bestAction.weight) {
                bestAction = availableActions[i];
            }
        }

        return bestAction || {action: 'skip'};
    }
}