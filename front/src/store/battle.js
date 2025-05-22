import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";
import {Creature, CreatureAction} from "../game/classes/battle/Creature.js";
import {QueueController} from "../game/classes/battle/QueueController.js";
import {BaseEffect} from "../game/classes/battle/Effects/BaseEffect.js";
import {EasyAI} from "../game/classes/battle/AI/EasyAI.js";
import {CombatHandler} from "../game/classes/battle/CombatHandler.js";
import {MediumAI} from "../game/classes/battle/AI/MediumAI.js";

export const BATTLE_STATE_PLAYER_TURN = 'PLAYER_TURN'
export const BATTLE_STATE_ENGINE_TURN = 'ENGINE_TURN'
export const BATTLE_STATE_WAITING = 'WAITING'
export const BATTLE_STATE_BATTLE_OVER_WIN = 'BATTLE_OVER_WIN'
export const BATTLE_STATE_BATTLE_OVER_LOSE = 'BATTLE_OVER_LOSE'

const player1 = new MediumAI()
const player2 = new EasyAI()

export const useBattleStore = defineStore('battle', {
    state: () => ({
        // Количество ячеек горизонтально (учитывая два ряда)
        gridSizeX: 31,
        // Количество ячеек вертикально (каждый ряд)
        gridSizeY: 11,
        queue: null,
        round: 0,
        newCreatures: [
            // Команда 1 (right)
            new Creature({
                id: 1,
                name: 'Огненный Страж',
                element: 'fire',
                role: 'tank',
                maxHealthStat: 320,  // Увеличен HP
                speedStat: 5,       // Немного снижена скорость
                attackStat: 35,     // Снижен урон
                defenseStat: 65,    // Увеличен защита
                initiativeStat: 35,
                willStat: 30,
                actions: [
                    // Основная атака с поджигом
                    new CreatureAction({
                        name: 'Раскалённый удар',
                        element: 'fire',
                        baseDamage: 28,
                        hitChance: 0.9,
                        critChance: 0.05,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'burn', chance: 0.8, duration: 2}]
                    }),
                    // Защитный скилл
                    new CreatureAction({
                        name: 'Щит пламени',
                        element: 'fire',
                        baseDamage: 0,
                        hitChance: 1,
                        actionType: 'treat',
                        range: 0,
                        effects: [{effect: 'aegis', chance: 1.0, duration: 3}]
                    })
                ]
            }),

            new Creature({
                id: 2,
                name: 'Лесной Убийца',
                element: 'grass',
                role: 'dd',
                maxHealthStat: 180,
                speedStat: 12,     // Высокая скорость
                attackStat: 70,    // Высокий урон
                defenseStat: 25,
                initiativeStat: 55,
                willStat: 40,
                actions: [
                    // Основная атака с ядом
                    new CreatureAction({
                        name: 'Ядовитый укус',
                        element: 'grass',
                        baseDamage: 45,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'poison', chance: 0.85, duration: 3}]
                    }),
                    // Дальнобойная атака
                    new CreatureAction({
                        name: 'Шторм листьев',
                        element: 'grass',
                        baseDamage: 38,
                        hitChance: 0.9,
                        critChance: 0.1,
                        actionType: 'ranged',
                        range: 30
                    })
                ]
            }),

            new Creature({
                id: 3,
                name: 'Водный Целитель',
                element: 'water',
                role: 'support',
                maxHealthStat: 110,
                speedStat: 7,
                attackStat: 25,
                defenseStat: 45,
                initiativeStat: 50,
                willStat: 75,
                actions: [
                    // Лечение + регенерация
                    new CreatureAction({
                        name: 'Исцеляющий поток',
                        element: 'water',
                        baseDamage: 30,
                        hitChance: 0.95,
                        critChance: 0.2,
                        actionType: 'treat',
                        range: 4,
                        effects: [{effect: 'regeneration', duration: 4}]
                    }),
                    // Дебаф врага
                    new CreatureAction({
                        name: 'Глубинный шёпот',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 0.95,
                        actionType: 'ranged',
                        range: 5,
                        effects: [{effect: 'blind', duration: 3}]
                    })
                ]
            }),

            // Команда 2 (left)
            new Creature({
                id: 4,
                name: 'Водный Страж',
                element: 'water',
                role: 'tank',
                
                maxHealthStat: 310,
                speedStat: 6,
                attackStat: 30,
                defenseStat: 70,    // Высокая защита
                initiativeStat: 40,
                willStat: 35,
                actions: [
                    // Атака с замедлением
                    new CreatureAction({
                        name: 'Водяной таран',
                        element: 'water',
                        baseDamage: 25,
                        hitChance: 0.92,
                        critChance: 0.05,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'chill', chance: 0.85, duration: 2}]
                    }),
                    // Защитный скилл
                    new CreatureAction({
                        name: 'Кипящий щит',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 1,
                        actionType: 'treat',
                        range: 0,
                        effects: [{effect: 'aegis', duration: 3}]
                    })
                ]
            }),

            new Creature({
                id: 5,
                name: 'Огненный Разрушитель',
                element: 'fire',
                role: 'dd',
                
                maxHealthStat: 170,
                speedStat: 11,
                attackStat: 75,    // Очень высокий урон
                defenseStat: 20,
                initiativeStat: 60,
                willStat: 45,
                actions: [
                    // Мощная атака с поджигом
                    new CreatureAction({
                        name: 'Раскалённый клинок',
                        element: 'fire',
                        baseDamage: 50,
                        hitChance: 0.8,
                        critChance: 0.15,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'burn', chance: 0.9, duration: 3}]
                    }),
                    // Дальнобойная атака
                    new CreatureAction({
                        name: 'Огненная стрела',
                        element: 'fire',
                        baseDamage: 45,
                        hitChance: 0.9,
                        critChance: 0.1,
                        actionType: 'ranged',
                        range: 30
                    })
                ]
            }),

            new Creature({
                id: 6,
                name: 'Травяной Шаман',
                element: 'grass',
                role: 'support',
                
                maxHealthStat: 120,
                speedStat: 6,
                attackStat: 30,
                defenseStat: 50,
                initiativeStat: 45,
                willStat: 70,
                actions: [
                    // Лечение + баф
                    new CreatureAction({
                        name: 'Целительный споры',
                        element: 'grass',
                        baseDamage: 35,
                        hitChance: 0.9,
                        critChance: 0.25,
                        actionType: 'treat',
                        range: 4,
                        effects: [{effect: 'regeneration', duration: 5}]
                    }),
                    // Дебаф врага
                    new CreatureAction({
                        name: 'Проклятие листвы',
                        element: 'grass',
                        baseDamage: 0,
                        hitChance: 0.9,
                        actionType: 'ranged',
                        range: 6,
                        effects: [{effect: 'curse', duration: 5}]
                    })
                ]
            })
        ],
        creatures: [
            new Creature({
                id: 1,
                name: 'Огонь/Танк',
                texture: 'Pink_Monster',
                element: 'fire',
                role: 'tank',
                position: [1, 3],
                direction: 'right',
                control: player1,

                maxHealthStat: 320,
                speedStat: 5,
                attackStat: 35,
                defenseStat: 65,
                initiativeStat: 35,
                willStat: 30,

                actions: [
                    // Основная атака с поджигом
                    new CreatureAction({
                        name: 'Раскалённый удар',
                        element: 'fire',
                        baseDamage: 28,
                        hitChance: 0.9,
                        critChance: 0.05,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'burn', chance: 0.8, duration: 2}]
                    }),
                    // Защитный скилл
                    new CreatureAction({
                        name: 'Щит пламени',
                        element: 'fire',
                        baseDamage: 0,
                        hitChance: 1,
                        actionType: 'treat',
                        range: 0,
                        effects: [{effect: 'aegis', chance: 1.0, duration: 3}]
                    })
                ]
                ,
                // effects: [BaseEffect.getEffectObject({effect: 'curse', duration: 1})]
            }),

            new Creature({
                id: 2,
                name: 'ДД/Трава',
                texture: 'Dude_Monster',
                element: 'grass',
                role: 'dd',
                position: [3, 3],
                direction: 'right',
                control: player1,

                maxHealthStat: 180, // 1=10 - 20
                speedStat: 12, // 5=1 - 25
                attackStat: 70, // 
                defenseStat: 25,
                initiativeStat: 55,
                willStat: 40,

                actions: [
                    // Основная атака с ядом
                    new CreatureAction({
                        name: 'Ядовитый укус',
                        element: 'grass',
                        baseDamage: 45,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'poison', chance: 0.85, duration: 3}]
                    }),
                    // Дальнобойная атака
                    new CreatureAction({
                        name: 'Шторм листьев',
                        element: 'grass',
                        baseDamage: 38,
                        hitChance: 0.9,
                        critChance: 0.1,
                        actionType: 'ranged',
                        range: 30
                    })
                ]
                ,
            }),

            new Creature({
                id: 3,
                name: 'Сап/Вода',
                texture: 'Owlet_Monster',
                element: 'water',
                role: 'support',
                position: [4, 4],
                direction: 'right',
                control: player1,
                
                maxHealthStat: 110,
                speedStat: 7,
                attackStat: 25,
                defenseStat: 45,
                initiativeStat: 50,
                willStat: 75,
                actions: [
                    // Лечение + регенерация
                    new CreatureAction({
                        name: 'Исцеляющий поток',
                        element: 'water',
                        baseDamage: 30,
                        hitChance: 0.95,
                        critChance: 0.2,
                        actionType: 'treat',
                        range: 4,
                        effects: [{effect: 'regeneration', duration: 4}]
                    }),
                    // Дебаф врага
                    new CreatureAction({
                        name: 'Глубинный шёпот',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 0.95,
                        actionType: 'ranged',
                        range: 5,
                        effects: [{effect: 'blind', duration: 3}]
                    })
                ]
                ,
                effects: []
            }),

            new Creature({
                id: 4,
                name: 'Вода/Танк',
                texture: 'Pink_Monster',
                element: 'water',
                role: 'tank',
                position: [1, 28],
                direction: 'left',
                control: player2,

                maxHealthStat: 310,
                speedStat: 6,
                attackStat: 30,
                defenseStat: 70,    // Высокая защита
                initiativeStat: 40,
                willStat: 35,

                actions: [
                    // Атака с замедлением
                    new CreatureAction({
                        name: 'Водяной таран',
                        element: 'water',
                        baseDamage: 25,
                        hitChance: 0.92,
                        critChance: 0.05,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'chill', chance: 0.85, duration: 2}]
                    }),
                    // Защитный скилл
                    new CreatureAction({
                        name: 'Кипящий щит',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 1,
                        actionType: 'treat',
                        range: 0,
                        effects: [{effect: 'aegis', duration: 3}]
                    })
                ]
                ,
            }),

            new Creature({
                id: 5,
                name: 'Огонь / ДД',
                texture: 'Dude_Monster',
                element: 'fire',
                role: 'dd',
                position: [3, 28],
                direction: 'left',
                control: player2,

                maxHealthStat: 170,
                speedStat: 11,
                attackStat: 75,    // Очень высокий урон
                defenseStat: 20,
                initiativeStat: 60,
                willStat: 45,

                actions: [
                    // Мощная атака с поджигом
                    new CreatureAction({
                        name: 'Раскалённый клинок',
                        element: 'fire',
                        baseDamage: 50,
                        hitChance: 0.8,
                        critChance: 0.15,
                        actionType: 'melee',
                        range: 1,
                        effects: [{effect: 'burn', chance: 0.9, duration: 3}]
                    }),
                    // Дальнобойная атака
                    new CreatureAction({
                        name: 'Огненная стрела',
                        element: 'fire',
                        baseDamage: 45,
                        hitChance: 0.9,
                        critChance: 0.1,
                        actionType: 'ranged',
                        range: 30
                    })
                ]
                ,
            }),

            new Creature({
                id: 6,
                name: 'Трава/САП',
                texture: 'Owlet_Monster',
                element: 'grass',
                role: 'support',
                position: [4, 28],
                direction: 'left',
                control: player2,

                maxHealthStat: 120,
                speedStat: 6,
                attackStat: 30,
                defenseStat: 50,
                initiativeStat: 45,
                willStat: 70,
                actions: [
                    // Лечение + баф
                    new CreatureAction({
                        name: 'Целительный споры',
                        element: 'grass',
                        baseDamage: 35,
                        hitChance: 0.9,
                        critChance: 0.25,
                        actionType: 'treat',
                        range: 4,
                        effects: [{effect: 'regeneration', duration: 5}]
                    }),
                    // Дебаф врага
                    new CreatureAction({
                        name: 'Проклятие листвы',
                        element: 'grass',
                        baseDamage: 0,
                        hitChance: 0.9,
                        actionType: 'ranged',
                        range: 6,
                        effects: [{effect: 'curse', duration: 5}]
                    })
                ]
                ,
            })
        ],
        battleState: BATTLE_STATE_WAITING,
        battleMap: undefined,
        activeCreature: undefined,
        availableActions: [],
    }),
    getters: {},
    actions: {
        load() {
            this.queue = new QueueController(this.creatures)
            const contents = new Map()
            this.creatures.forEach(creature => {
                contents.set(creature.position.join(','), creature)
            })
            this.battleMap = BattleMap.create(this.gridSizeX, this.gridSizeY, contents)
        },
        handleRound() {
            this.activeCreature = this.queue.currentCreature

            this.availableActions = []

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
            this.activeCreature.removeRoundEffects()
            this.checkBattleOver()
            this.round++
            this.queue.endTurn(isDelayTurn)
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
            } else if (sideB === 0) {
                this.setBattleState(BATTLE_STATE_BATTLE_OVER_WIN)
            }
        },
        getTurn() {
            const effects = this.activeCreature.applyRoundEffects()

            if (this.activeCreature.health <= 0) {
                this.activeCreature.health = 0
                // гомосятина переделать
                let targetIndex = this.creatures.findIndex(c => c === this.activeCreature)
                this.creatures.splice(targetIndex, 1)
                this.battleMap.removeContent(...this.activeCreature.position)
                targetIndex = this.creatures.findIndex(c => c === this.activeCreature)
                this.round = targetIndex
            }

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
                throw new Exception('Попытка перединуться в точку, где уже есть другое существо')
            }
            
            this.battleMap.removeContent(...this.activeCreature.position)
            this.activeCreature.position = path[path.length - 1]
            this.battleMap.setContent(...path[path.length - 1], this.activeCreature)
        },
        playerActionAttack(targetPosition, attack) {
            const result = {
                attack: attack.name,
                success: false,
                damage: 0,
                health: 0,
                hitChance: 0,
                isCrit: 0,
            }
            const attacker = this.activeCreature
            const defender = this.getCreatureByCoords(targetPosition)
            if (!defender) {
                return
            }


            // Расчёт шанса попадания
            const hitChance = CombatHandler.getHitChance(attacker, defender, attack);
            result.hitChance = hitChance
            const isCrit = Math.random() < CombatHandler.getCritAttackChance(attacker, defender, attack);

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
                this.round = targetIndex
            }

            result.health = defender.health;

            if (!result.success) {
                return result
            }

            // накладываем эфекты
            (attack.effects || []).forEach(effect => {
                const chance = CombatHandler.getPushEffectChance(attacker, defender, effect)
                if (Math.random() > chance) {
                    console.log('Эфект не наложен')
                    return
                }

                if (effect.target === 'target') {
                    defender.pushEffect(effect)
                } else {
                    attacker.pushEffect(effect)
                }
            })

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
            }
            const treater = this.activeCreature
            const treated = this.getCreatureByCoords(targetPosition)
            if (!treated) {
                return
            }


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


            // накладываем эфекты
            (action.effects || []).forEach(effect => {

                let chance = effect.chance
                if (effect.target === 'target') {
                    chance = CombatHandler.getPushEffectChance(treater, treated, effect)
                }
                if (Math.random() > chance) {
                    console.log('Эфект не наложен')
                    return
                }

                if (effect.target === 'target') {
                    treated.pushEffect(effect)
                } else {
                    treater.pushEffect(effect)
                }
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
            this.activeCreature.pushEffect({effect: 'defense', duration: 2})
        },
        playerActionDelayedTurn(afterCreature) {
            this.queue.handleDelayedTurn(afterCreature)
            this.activeCreature.pushEffect({effect: 'confusion', duration: 3})
        },
        getCreatureByCoords(position) {
            return this.battleMap.get(position.join(','))?.content
        },
    },
});
