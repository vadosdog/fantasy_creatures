import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";
import {QueueController} from "../game/classes/battle/QueueController.js";
import {CombatHandler} from "../game/classes/battle/CombatHandler.js";
import {testTeam} from "../database/CreaturesLib.js";
import {CreatureAPI} from "../game/classes/battle/Creature.js";
import {useBattleLogStore} from "./battleLog.js";
import {EasyAI} from "../game/classes/battle/AI/EasyAI.js";

export const BATTLE_STATE_PLAYER_TURN = 'PLAYER_TURN'
export const BATTLE_STATE_ENGINE_TURN = 'ENGINE_TURN'
export const BATTLE_STATE_WAITING = 'WAITING'
export const BATTLE_STATE_BATTLE_OVER_WIN = 'BATTLE_OVER_WIN'
export const BATTLE_STATE_BATTLE_OVER_LOSE = 'BATTLE_OVER_LOSE'

const battleLog = useBattleLogStore()

export const useBattleStore = defineStore('battle', {
    state: () => ({
        // Количество ячеек горизонтально (учитывая два ряда)
        gridSizeX: 31,
        // Количество ячеек вертикально (каждый ряд)
        gridSizeY: 11,
        queue: null,
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
        selectedActionId: undefined,
        queueData: [], // Добавляем для хранения данных очереди
        activeCreatureId: null // ID текущего существа
    }),
    getters: {},
    actions: {
        load() {
            this.resetBattle([
                ...testTeam(2, 'right', 'player'),
                ...testTeam(2, 'left', new EasyAI()),
            ]);

            this.updateQueueData(); // Инициализируем данные очереди
        },
        resetBattle(creatures) {
            this.$reset();

            battleLog.resetLog()
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
            this.updateQueueData(); // Обновляем данные очереди
        },
        handleRound() {
            this.activeCreature = this.queue.currentCreature
            this.updateQueueData(); // Обновляем при смене хода

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
            if (CreatureAPI.hasEffect(activeCreature, 'freeze')) {
                return
            }
            const moveablePositions = this.getMoveablePositions(activeCreature)
            if (moveablePositions.length) {
                this.availableActions.push({
                    action: 'move',
                    targets: moveablePositions,
                })
            }

            activeCreature.actions.forEach(action => {
                const actionTargets = []
                const actionDirections = {}
                this.creatures.forEach(creature => {
                    if (action.actionType === 'treat'
                        ? creature.direction !== activeCreature.direction
                        : creature.direction === activeCreature.direction
                    ) {
                        return
                    }

                    if (creature.health <= 0) {
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

                    let pathLimit = CreatureAPI.getSpeed(activeCreature)
                    if (action.actionType !== 'melee') {
                        pathLimit = action.range
                    }
                    if ((pathLength - 1) > pathLimit) {
                        return
                    }

                    actionTargets.push(creature.position)

                    if (action.actionType === 'melee') {
                        // Для ближней атаки дополнительно высчитываем направление
                        const neighbors = this.getNeighbors(creature.position, activeCreature.position);

                        const validPositions = neighbors.filter(({position}) =>
                            moveablePositions.some(mp => mp[0] === position[0] && mp[1] === position[1])
                            || (position[0] === activeCreature.position[0] && position[1] === activeCreature.position[1])
                        );

                        if (validPositions.length > 0) {
                            actionDirections[creature.position.join(',')] = validPositions
                        }
                    }
                })

                if (actionTargets.length > 0) {
                    this.availableActions.push({
                        action: action.actionType === 'treat' ? 'treat' : 'attack', //как будто должно быть actionType
                        actionObject: action, //а тут просто action
                        targets: actionTargets,
                        actionDirections,
                    })
                }
            })

            if (this.availableActions.length > 0) {
                this.selectedActionId = this.activeCreature.actions.filter(a => {
                    return a.pp <= this.activeCreature.pp && a.currentCooldown === 0
                })[0]?.id
            }
        },
        handleEngineTurn(engine) {
            const activeCreature = this.activeCreature
            const speed = CreatureAPI.getSpeed(activeCreature)
            if (CreatureAPI.hasEffect(activeCreature, 'freeze')) {
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
            if ((path.length - 1) <= speed) {
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
                    targets: path[speed - 1],
                })
            }
        },
        setBattleState(battleState) {
            this.battleState = battleState
        },
        endTurn(isDelayTurn = false) {
            const removedRoundEffects = CreatureAPI.removeRoundEffects(this.activeCreature)
            for (const effect of removedRoundEffects) {
                this.recordLog({
                    type: 'endOfEffect',
                    effect,
                    target: CreatureAPI.getSimpleObject(this.activeCreature),
                })
            }
            this.queue.endTurn(isDelayTurn)
            if (this.checkBattleOver()) {
                return true
            }
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
            if (!this.activeCreature) return null; // Добавьте эту проверку

            const creatureId = this.activeCreature.id
            const effects = CreatureAPI.applyRoundEffects(this.activeCreature)
            for (const effect of effects) {
                this.recordLog({
                    type: 'roundEffect',
                    effect,
                    target: CreatureAPI.getSimpleObject(this.activeCreature),
                })
            }

            if (this.activeCreature.health <= 0) {
                this.activeCreature.health = 0
                // гомосятина переделать
                this.creatureDefeated(this.activeCreature)
                this.activeCreature = undefined
            } else {
                CreatureAPI.roundRestorePP(this.activeCreature)
            }

            return {
                activeCreature: this.activeCreature,
                availableActions: this.availableActions,
                selectedActionId: this.selectedActionId,
                effects: effects,
            }
        },
        creatureDefeated(creature) {
            this.creatures = this.creatures.filter(c => c.id !== creature.id);
            this.battleMap.removeContent(...creature.position)
            this.recordLog({
                target: CreatureAPI.getSimpleObject(creature),
                type: 'defeated'
            });
        },
        getMoveablePositions(activeCreature) {
            let start = activeCreature.position
            let speed = CreatureAPI.getSpeed(activeCreature)
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
                position[1] % 2 ? [0, -1] : [-1, -1], //лево вверх
                position[1] % 2 ? [0, 1] : [-1, 1], //право вверх
                [0, 2], //право
                position[1] % 2 ? [1, 1] : [0, 1], //право вниз
                position[1] % 2 ? [1, -1] : [0, -1], //лево вниз
                [0, -2], //влево
            ]
        },
        getNeighbors(position, [currentX, currentY]) {
            const neighbors = []
            const [x, y] = position

            this.getDirections(position).forEach(([dx, dy], i) => {
                const newX = x + dx;
                const newY = y + dy;
                if (!(this.battleMap.hasByCoords(newX, newY) // ячейка должна существоть
                    && ( //и
                        this.battleMap.isMovable(newX, newY) //или быть доступна для перемещения
                        || (newX === currentX && newY === currentY)) // или быть той, на которой уже стоит существо
                )
                ) {
                    return;
                }

                neighbors.push({
                    position: [newX, newY],
                    direction: i,
                })
            });
            return neighbors
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
            this.recordLog({
                type: 'move',
                actor: CreatureAPI.getSimpleObject(this.activeCreature),
                newPosition: path[path.length - 1],
            })
        },
        playerActionAttack(targetPosition, attack) {
            // Добавьте проверку в начале метода
            if (!this.activeCreature || this.activeCreature.health <= 0) {
                console.error("No active creature or creature is dead");
                return;
            }

            const result = {
                attack: attack,
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


            const defenderId = defender.id

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
                this.$patch(state => {
                    // Используйте иммутабельные обновления
                    const defenderStateObject = state.creatures.find(c => c.id === defenderId);
                    if (defenderStateObject) {
                        defenderStateObject.health = Math.floor(defenderStateObject.health - result.damage);
                    }
                });

            }


            this.recordLog({
                ...result,
                type: 'attack',
                actor: CreatureAPI.getSimpleObject(attacker),
                target: CreatureAPI.getSimpleObject(defender)
            })

            if (defender.health <= 0) {
                defender.health = 0
                this.creatureDefeated(defender)
            }

            result.health = defender.health;

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
                if (!CreatureAPI.hasEffect(effectTarget, effect.effect)) {
                    result.effects.push(effect.effect)
                }

                const pushEffect = CreatureAPI.pushEffect(effectTarget, effect)
                if (pushEffect) {
                    this.recordLog({
                        type: 'pushEffect',
                        effect,
                        target: CreatureAPI.getSimpleObject(effectTarget),
                    })
                }
            })

            // Проверка обратных эффектов шипов и вампиризма
            if (result.damage > 0) {
                const backDamageTerm = CreatureAPI.getBackDamageTerm(defender)
                if (backDamageTerm) {
                    const backDamage = Math.floor(result.damage * backDamageTerm)
                    attacker.health = Math.floor(attacker.health - backDamage)
                    result.backDamage = backDamage

                    if (attacker.health <= 0) {
                        attacker.health = 0
                        // гомосятина переделать
                        this.creatureDefeated(attacker)
                    }
                }
            }

            return result
        },
        playerActionTreat(targetPosition, action) {
            const result = {
                attack: action,
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
                treated.health = Math.floor(treated.health + result.damage)
                const treatedMaxHealth = CreatureAPI.getMaxHealth(treated)
                if (treated.health > treatedMaxHealth) {
                    treated.health = treatedMaxHealth
                }
            }

            result.health = treated.health;


            this.recordLog({
                ...result,
                type: 'treat',
                actor: CreatureAPI.getSimpleObject(treater),
                target: CreatureAPI.getSimpleObject(treated)
            });

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
                if (!CreatureAPI.hasEffect(effectTarget, effect.effect)) {
                    result.effects.push(effect.effect)
                }

                const pushEffect = CreatureAPI.pushEffect(effectTarget, effect)
                if (pushEffect) {
                    this.recordLog({
                        type: 'pushEffect',
                        effect,
                        target: CreatureAPI.getSimpleObject(effectTarget),
                    })
                }
            })

            if (result.damage > 0) {
                // При лечении эфект кровотечения убирается
                CreatureAPI.removeEffect(treated, 'bleed')
            }

            return result
        },
        playerActionMoveAndAttack(path, targetPosition, action) {
            this.playerActionMoveTo(path)
            return this.playerActionAttack(targetPosition, action)
        },
        playerActionDefense() {
            this.recordLog({
                type: 'defense',
                actor: CreatureAPI.getSimpleObject(this.activeCreature),
            })
        },
        playerActionDelayedTurn(afterCreature) {
            this.queue.handleDelayedTurn(afterCreature)
            this.recordLog({
                type: 'delayTurn',
                actor: CreatureAPI.getSimpleObject(this.activeCreature),
            })

        },
        getCreatureByCoords(position) {
            return this.battleMap.get(position.join(','))?.content
        },
        getCreatureById(id) {
            return this.creatures.find(c => c.id = id)
        },
        recordLog(log) {
            const round = this.queue.round
            const turn = this.queue.currentTurnIndex + 1

            battleLog.recordLog(round, turn, log)
        },
        selectAction(actionId) {
            this.selectedActionId = actionId
        },

        // Работа с очередью 
        updateQueueData() {
            if (this.queue) {
                this.queueData = this.queue.getQueueData();
                this.activeCreatureId = this.queue.currentCreature?.id || null;
            }
        },
    },
});
