import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";
import {Creature, CreatureAction} from "../game/classes/battle/Creature.js";
import {QueueController} from "../game/classes/battle/QueueController.js";
import {BaseEffect} from "../game/classes/battle/Effects/BaseEffect.js";
import {EasyAI} from "../game/classes/battle/AI/EasyAI.js";
import {CombatHandler} from "../game/classes/battle/CombatHandler.js";
import {MediumAI} from "../game/classes/battle/AI/MediumAI.js";
import {
    getTeam,
    getTeam2,
    testBaseDamageDDvsTank,
    testEffects,
    testElementTeam,
    testTeam
} from "../database/CreaturesLib.js";

export const BATTLE_STATE_PLAYER_TURN = 'PLAYER_TURN'
export const BATTLE_STATE_ENGINE_TURN = 'ENGINE_TURN'
export const BATTLE_STATE_WAITING = 'WAITING'
export const BATTLE_STATE_BATTLE_OVER_WIN = 'BATTLE_OVER_WIN'
export const BATTLE_STATE_BATTLE_OVER_LOSE = 'BATTLE_OVER_LOSE'

export const useBattleStore = defineStore('battle', {
    state: () => ({
        // Количество ячеек горизонтально (учитывая два ряда)
        gridSizeX: 31,
        // Количество ячеек вертикально (каждый ряд)
        gridSizeY: 11,
        queue: null,
        round: 0,
        battleLog: [],
        speedAnims: 1,
        creatures: [
            // ...testElementTeam('fire', 2, 'left', player1),
            // ...testElementTeam('fire', 2, 'right', player2),
            // ...getTeam('right', player1, [
            //     [0, 2],
            //     [1, 2],
            //     [2, 2],
            //     [3, 2],
            //     [4, 2],
            //     [5, 2],
            // ]),
            // ...getTeam('left', player2, [
            //     [0, 28],
            //     [1, 28],
            //     [2, 28],
            //     [3, 28],
            //     [4, 28],
            //     [5, 28],
            // ])
        ],
        leftTeam: [],
        rightTeam: [],
        battleState: BATTLE_STATE_WAITING,
        battleMap: undefined,
        activeCreature: undefined,
        availableActions: [],
    }),
    getters: {},
    actions: {
        load() {
            // this.resetBattle(testEffects())
            this.resetBattle([
                ...testTeam(2, 'left', 'player'),
                ...testTeam(2, 'right', 'player')
            ])
        },
        resetBattle(creatures) {
            this.round = 0
            this.battleLog = []
            this.creatures = creatures

            this.leftTeam = []
            this.rightTeam = []
            this.battleState = BATTLE_STATE_WAITING
            this.activeCreature = undefined
            this.availableActions = []

            this.queue = new QueueController(this.creatures)
            const contents = new Map()
            this.creatures.forEach(creature => {
                contents.set(creature.position.join(','), creature)
                if (creature.direction === 'right') {
                    this.leftTeam.push(creature)
                } else {
                    this.rightTeam.push(creature)
                }
            })
            this.battleMap = BattleMap.create(this.gridSizeX, this.gridSizeY, contents)
        },
        handleRound() {
            this.activeCreature = this.queue.currentCreature

            this.availableActions = []
            if (this.battleState === BATTLE_STATE_BATTLE_OVER_LOSE || this.battleState === BATTLE_STATE_BATTLE_OVER_WIN) {
                return
            }

            // переделать на что-то другое
            if (this.activeCreature.control === 'player') {
                this.handlePlayerTurn()
                this.setBattleState(BATTLE_STATE_PLAYER_TURN)
            } else {
                this.handleEngineTurn(this.activeCreature.control)
                this.setBattleState(BATTLE_STATE_ENGINE_TURN)
            }
        },
        handlePlayerTurn() {
            const activeCreature = this.activeCreature
            if (activeCreature.hasEffect('freeze')) {
                return
            }
            const moveable = this.getMoveablePositions(activeCreature)
            if (moveable.length) {
                this.availableActions.push({
                    action: 'move',
                    targets: moveable,
                })
            }

            activeCreature.getActions().forEach(action => {
                const actionTargets = []
                this.creatures.forEach(creature => {
                    if (action.actionType === 'treat'
                        ? creature.direction !== activeCreature.direction
                        : creature.direction === activeCreature.direction
                    ) {
                        return
                    }

                    if (creature.health <= 0) {
                        availableActions.p
                        return
                    }

                    const obstacles = new Set()
                    if (action.actionType === 'melee') {
                        this.creatures.forEach(obstacleCreature => {
                            if (obstacleCreature === creature || obstacleCreature === activeCreature) {
                                return
                            }
                            obstacles.add(obstacleCreature)
                        })
                    }

                    let pathLength = this.findPath(activeCreature.position, creature.position, obstacles).length
                    if (action.actionType !== 'treat' && pathLength === 0) {
                        return;
                    }

                    let pathLimit = activeCreature.getSpeed()
                    if (action.actionType !== 'melee') {
                        pathLimit = action.range
                    }
                    if ((pathLength - 1) > pathLimit) {
                        return
                    }

                    actionTargets.push(creature.position)
                })

                if (actionTargets.length > 0) {
                    this.availableActions.push({
                        action: action.actionType === 'treat' ? 'treat' : 'attack', //как будто должно быть actionType
                        actionObject: action, //а тут просто action
                        targets: actionTargets,
                    })

                }
            })
        },
        handleEngineTurn(engine) {
            const activeCreature = this.activeCreature
            if (activeCreature.hasEffect('freeze')) {
                return
            }
            this.availableActions = [engine.getAction(this)]
            return
            //Выбор всех активных врагов
            let enemies = []
            this.creatures.forEach(creature => {
                if (creature.direction === this.activeCreature.direction
                    || creature.health <= 0) {
                    return false
                }

                enemies.push(creature)
            });

            // Если врагов не осталось, то ничего не приходится делать
            if (enemies.length === 0) {
                const obstacles = new Set()
                if (action.actionType === 'melee') {
                    this.creatures.forEach(obstacleCreature => {
                        if (obstacleCreature === creature || obstacleCreature === activeCreature) {
                            return
                        }
                        obstacles.add(obstacleCreature)
                    })
                }
                return
            }

            // Ищем ближайшего противника, если таких несколько, то того у кого меньше ХП
            let path = this.findPath(this.activeCreature.position, enemies[0].position)
            let target = enemies[0].position

            for (let i = 0; i < enemies.length; i++) {
                if (i === 0) continue
                let newPath = this.findPath(this.activeCreature.position, enemies[i].position)
                if (
                    newPath.length < path.length
                    || enemies[i].health < target.health
                ) {
                    path = newPath
                    target = enemies[i].position
                }
            }

            // Если можем дойти до цели, то атакуем ее
            if ((path.length - 1) <= this.activeCreature.speed) {
                this.availableActions.push(
                    {
                        action: 'attack',
                        targets: target,
                    })
            }
            // в противном случае идем к цели
            else {
                this.availableActions.push({
                    action: 'move',
                    targets: path[this.activeCreature.speed - 1],
                })
            }
        },
        setBattleState(battleState) {
            this.battleState = battleState
        },
        endTurn(isDelayTurn = false) {
            this.activeCreature.removeRoundEffects().forEach(effect => this.recordLog(effect.effect + ' перестал действовать на ' + this.activeCreature.name))
            this.queue.endTurn(isDelayTurn)
            if (this.checkBattleOver()) {
                return true
            }
            this.round++
            this.queue.nextTurn()
        },
        checkBattleOver() {
            let sideA = 0
            let sideB = 0
            this.creatures.forEach(creature => {
                if (creature.health <= 0) {
                    return
                }

                if (creature.direction === 'right') {
                    sideA++
                } else {
                    sideB++
                }
            })

            if (sideA === 0) {
                this.setBattleState(BATTLE_STATE_BATTLE_OVER_LOSE)
                return true
            } else if (sideB === 0) {
                this.setBattleState(BATTLE_STATE_BATTLE_OVER_WIN)
                return true
            }
            return false
        },
        getTurn() {
            const effects = this.activeCreature.applyRoundEffects()
            this.recordLog(effects.map(effect => this.activeCreature.name + ' HP ' + effect.damage + ' (' + effect.effect + ')'))

            if (this.activeCreature.health <= 0) {
                this.activeCreature.health = 0
                // гомосятина переделать
                let targetIndex = this.creatures.findIndex(c => c === this.activeCreature)
                this.creatures.splice(targetIndex, 1)
                this.battleMap.removeContent(...this.activeCreature.position)
                targetIndex = this.creatures.findIndex(c => c === this.activeCreature)
                this.round = targetIndex
            }

            this.activeCreature.roundRestorePP()

            return {
                activeCreature: this.activeCreature,
                availableActions: this.availableActions,
                effects: effects,
            }
        },
        getMoveablePositions(activeCreature) {
            let start = activeCreature.position
            let speed = activeCreature.getSpeed()
            const visited = new Set();
            let currentPositions = [start];
            visited.add(start.join(','));

            for (let s = 0; s < speed; s++) {
                const nextPositions = [];

                for (const pos of currentPositions) {
                    const directions = this.getDirections(pos);

                    for (const [dx, dy] of directions) {
                        const newX = pos[0] + dx;
                        const newY = pos[1] + dy;
                        const key = `${newX},${newY}`;

                        if (
                            newX >= 0 &&
                            newY >= 0 &&
                            this.battleMap.hasByCoords(newX, newY) &&
                            !visited.has(key) &&
                            this.battleMap.isMovable(newX, newY)
                        ) {
                            visited.add(key);
                            nextPositions.push([newX, newY]);
                        }
                    }
                }

                currentPositions.push(...nextPositions);
                if (currentPositions.length === 0) break; // нет куда идти дальше
            }

            // убираем стартовую позицию, тк туда перемещаться и не надо
            currentPositions.shift()
            return currentPositions;
        },
        getDirections(position) {
            return [
                [0, -2], //влево
                position[1] % 2 ? [0, -1] : [-1, -1], //лево вверх
                position[1] % 2 ? [0, 1] : [-1, 1], //право вверх
                [0, 2], //право
                position[1] % 2 ? [1, 1] : [0, 1], //право вниз
                position[1] % 2 ? [1, -1] : [0, -1], //лево вниз
            ]
        },
        findPath(start, end, useObstacles = true) {
            let obstacles = new Set()

            if (useObstacles) {
                this.creatures.forEach(item => {
                    let obstaclePosition = item.position.join(',')
                    // исключаем стартовые и конченые точки, тк они обязательно должны быть проходимые
                    if (
                        obstaclePosition === start.join(',')
                        || obstaclePosition === end.join(',')
                    ) {
                        return
                    }
                    obstacles.add(obstaclePosition)
                })

            }

            return this.battleMap.findPath(start, end, obstacles)
            // Плохо что есть две разные точки поиска пути, надобы объеденить

            if (!start || !end) {
                return []
            }

            // Очередь для BFS: элементы вида [x, y, path]
            const queue = [];
            queue.push([start[0], start[1], []]);

            const visited = new Set();

            while (queue.length > 0) {
                const [x, y, path] = queue.shift();
                const key = `${x},${y}`;
                if (visited.has(key)) continue;
                visited.add(key);

                const newPath = path.concat([[x, y]]);

                if (x === end[0] && y === end[1]) {
                    return newPath;
                }

                const directions = this.getDirections([x, y]);
                for (const [dx, dy] of directions) {
                    const newX = x + dx;
                    const newY = y + dy;
                    const newKey = `${newX},${newY}`;

                    if (
                        newX >= 0 &&
                        newY >= 0 &&
                        this.battleMap.has(`${newX},${newY}`) &&
                        !visited.has(newKey)
                    ) {
                        queue.push([newX, newY, newPath]);
                    }
                }
            }

            return []
        },
        playerActionMoveTo(path) {
            if (this.getCreatureByCoords(path[path.length - 1])) {
                console.error(new Exception('Попытка перединуться в точку, где уже есть другое существо'))
            }

            this.battleMap.removeContent(...this.activeCreature.position)
            this.activeCreature.position = path[path.length - 1]
            this.battleMap.setContent(...path[path.length - 1], this.activeCreature)
            this.recordLog('Перемещение в ' + path[path.length - 1].join(','))
        },
        playerActionAttack(targetPosition, attack) {
            const result = {
                attack: attack.name,
                success: false,
                damage: 0,
                potentialDamage: 0,
                health: 0,
                hitChance: 0,
                isCrit: 0,
                effects: [],
            }
            const attacker = this.activeCreature
            const defender = this.getCreatureByCoords(targetPosition)

            if (attack.pp > attacker.pp || attack.currentCooldown > 0) {
                //навык недоступен
                return
            }

            if (!defender) {
                return
            }

            // Выставляем кулдаун и обновляем pp
            attack.currentCooldown = attack.cooldown
            attacker.pp -= attack.pp


            // Расчёт шанса попадания
            const hitChance = CombatHandler.getHitChance(attacker, defender, attack);
            result.hitChance = hitChance
            const isCrit = Math.random() < CombatHandler.getCritAttackChance(attacker, defender, attack);
            result.potentialDamage = CombatHandler.getAttackDamage(attacker, defender, attack, false, true)

            const dice = Math.random()
            if (dice < hitChance) {
                result.success = true

                // считаем урон
                result.damage = CombatHandler.getAttackDamage(attacker, defender, attack, isCrit)
                defender.health -= result.damage
            }


            if (defender.health <= 0) {
                defender.health = 0
                // гомосятина переделать
                let targetIndex = this.creatures.findIndex(c => c === defender)
                this.creatures.splice(targetIndex, 1)
                this.battleMap.removeContent(...defender.position)
                targetIndex = this.creatures.findIndex(c => c === this.activeCreature)
                // this.round = targetIndex
            }

            result.health = defender.health;

            let logText = `Атака ${defender.name} (${defender.id}) ${attack.name}: `
            if (result.success) {
                logText += 'Урон: ' + result.damage
                if (result.isCrit) {
                    logText += ' КРИТ!'
                }
            } else {
                logText += 'Промах'
            }
            this.recordLog(logText)

            if (!result.success) {
                return result
            }

            // накладываем эфекты
            (attack.effects || []).forEach(effect => {
                const chance = CombatHandler.getPushEffectChance(attacker, defender, effect)
                if (Math.random() > chance) {
                    return
                }

                const effectTarget = effect.target === 'target' ? defender : attacker
                if (!effectTarget.hasEffect(effect.effect)) {
                    result.effects.push(effect.effect)
                }

                this.recordLog(effectTarget.pushEffect(effect))
            })

            // Проверка обратных эффектов шипов и вампиризма
            if (result.damage > 0) {
                const backDamageTerm = defender.getBackDamageTerm()
                if (backDamageTerm) {
                    const backDamage = Math.floor(result.damage * backDamageTerm)
                    attacker.health -= backDamage
                    result.backDamage = backDamage

                    if (attacker.health <= 0) {
                        attacker.health = 0
                        // гомосятина переделать
                        let targetIndex = this.creatures.findIndex(c => c === attacker)
                        this.creatures.splice(targetIndex, 1)
                        this.battleMap.removeContent(...attacker.position)
                        targetIndex = this.creatures.findIndex(c => c === this.activeCreature)
                    }
                }
            }

            return result
        },
        playerActionTreat(targetPosition, action) {
            const result = {
                attack: action.name,
                success: false,
                damage: 0,
                health: 0,
                hitChance: 0,
                isCrit: 0,
                effects: [],
            }
            const treater = this.activeCreature
            const treated = this.getCreatureByCoords(targetPosition)

            if (action.pp > treater.pp || action.currentCooldown > 0) {
                //навык недоступен
                return
            }

            if (!treated) {
                return
            }

            // Выставляем кулдаун и обновляем pp
            action.currentCooldown = action.cooldown
            treater.pp -= action.pp


            // Расчёт шанса попадания
            const hitChance = CombatHandler.getTreatHitChance(treater, treated, action);
            result.hitChance = hitChance
            const isCrit = Math.random() < CombatHandler.getTreatCritChance(treater, treated, action);

            const dice = Math.random()
            if (dice < hitChance) {
                result.success = true

                // считаем урон
                result.damage = CombatHandler.getTreatDamage(treater, treated, action, isCrit)
                treated.health += result.damage
                if (treated.health > treated.getMaxHealth()) {
                    treated.health = treated.getMaxHealth()
                }
            }

            result.health = treated.health;


            let logText = `Лечение союзника ${treated.name} (${treated.id}) ${action.name}: `
            if (result.success) {
                logText += 'Лечение: ' + result.damage
                if (result.isCrit) {
                    logText += ' КРИТ!'
                }
            } else {
                logText += 'Промах'
            }
            this.recordLog(logText);

            // накладываем эфекты
            (action.effects || []).forEach(effect => {

                let chance = effect.chance
                if (effect.target === 'target') {
                    chance = CombatHandler.getPushEffectChance(treater, treated, effect)
                }
                if (Math.random() > chance) {
                    return
                }

                const effectTarget = effect.target === 'target' ? treated : treater
                if (!effectTarget.hasEffect(effect.effect)) {
                    result.effects.push(effect.effect)
                }

                this.recordLog(effectTarget.pushEffect(effect))
            })

            if (result.damage > 0) {
                // При лечении эфект кровотечения убирается
                treated.removeEffect('bleed')
            }

            return result
        },
        playerActionMoveAndAttack(path, targetPosition, action) {
            this.playerActionMoveTo(path)
            return this.playerActionAttack(targetPosition, action)
        },
        playerActionDefense() {
            this.recordLog(this.activeCreature.pushEffect({effect: 'defense', duration: 2}))
        },
        playerActionDelayedTurn(afterCreature) {
            this.queue.handleDelayedTurn(afterCreature)
            this.recordLog(this.activeCreature.pushEffect({effect: 'confusion', duration: 3}))
        },
        getCreatureByCoords(position) {
            return this.battleMap.get(position.join(','))?.content
        },
        recordLog(log) {
            if (typeof log === 'string') {
                log = [log]
            }
            const round = this.queue.round
            const turn = this.queue.currentTurnIndex + 1
            const activeCreature = this.activeCreature

            for (const text of log) {

                this.battleLog.push(`[ROUND: ${round}, TURN: ${turn}][Command: ${activeCreature.direction}}, Creature: ${activeCreature.name} (${activeCreature.id})]: ` + log)
            }

        },
    },
});
