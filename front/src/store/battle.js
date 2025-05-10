import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/BattleMap.js";
import {Creature, CreatureAction} from "../game/classes/Creature.js";

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
        creatures: new Set(),
        round: 0,
        queue: [
            new Creature({
                name: 'Огонь/Танк',
                texture: 'Pink_Monster',
                element: 'fire',
                position: [1, 3],
                direction: 'right',
                control: 'player',

                maxHealthStat: 300,
                speedStat: 3,
                attackStat: 40,
                defenseStat: 60,
                initiativeStat: 30,
                willStat: 25,
                form: 70,
                mass: 80,

                actions: [
                    new CreatureAction({
                        name: 'Раскалённый удар',
                        element: 'fire',
                        baseDamage: 30,
                        hitChance: 0.85,
                        critChance: 0.05,
                        actionType: 'melee', // Ближняя атака
                        range: 1, // Дистанция 1 для ближней атаки
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Тяжёлая лапа',
                        element: 'normal',
                        baseDamage: 25,
                        hitChance: 0.9,
                        critChance: 0.00,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Раскалённый удар',
                        element: 'fire',
                        baseDamage: 30,
                        hitChance: 0.85,
                        critChance: 0.05,
                        actionType: 'melee', // Ближняя атака
                        range: 1, // Дистанция 1 для ближней атаки
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Тяжёлая лапа',
                        element: 'normal',
                        baseDamage: 25,
                        hitChance: 0.9,
                        critChance: 0.00,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                ],
            }),

            new Creature({
                name: 'ДД/Трава',
                texture: 'Dude_Monster',
                element: 'grass',
                position: [3, 3],
                direction: 'right',
                control: 'player',

                maxHealthStat: 200,
                speedStat: 5,
                attackStat: 65,
                defenseStat: 30,
                initiativeStat: 50,
                willStat: 35,
                form: 50,
                mass: 60,

                actions: [
                    new CreatureAction({
                        name: 'Каменный клык',
                        element: 'grass',
                        baseDamage: 40,
                        hitChance: 0.8,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Быстрый бросок',
                        element: 'normal',
                        baseDamage: 35,
                        hitChance: 0.95,
                        critChance: 0.05,
                        actionType: 'ranged', // Дальняя атака
                        range: 15, // Дистанция 3 клетки
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Каменный клык',
                        element: 'grass',
                        baseDamage: 40,
                        hitChance: 0.8,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Быстрый бросок',
                        element: 'normal',
                        baseDamage: 35,
                        hitChance: 0.95,
                        critChance: 0.05,
                        actionType: 'ranged', // Дальняя атака
                        range: 15, // Дистанция 3 клетки
                        effects: [],
                    }),
                ],
            }),

            new Creature({
                name: 'Вода/Танк',
                texture: 'Owlet_Monster',
                element: 'water',
                position: [1, 28],
                direction: 'left',
                control: 'player',

                maxHealthStat: 250,
                speedStat: 4,
                attackStat: 35,
                defenseStat: 55,
                initiativeStat: 45,
                willStat: 30,
                form: 60,
                mass: 50,

                actions: [
                    new CreatureAction({
                        name: 'Водяной клинок',
                        element: 'water',
                        baseDamage: 28,
                        hitChance: 0.88,
                        critChance: 0.07,
                        actionType: 'ranged',
                        range: 10, // Средняя дистанция
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Клюющий удар',
                        element: 'normal',
                        baseDamage: 22,
                        hitChance: 0.93,
                        critChance: 0.03,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Водяной клинок',
                        element: 'water',
                        baseDamage: 28,
                        hitChance: 0.88,
                        critChance: 0.07,
                        actionType: 'ranged',
                        range: 10, // Средняя дистанция
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Клюющий удар',
                        element: 'normal',
                        baseDamage: 22,
                        hitChance: 0.93,
                        critChance: 0.03,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                ],
            }),

            new Creature({
                name: 'Огонь / ДД',
                texture: 'Dude_Monster',
                element: 'fire',
                position: [3, 28],
                direction: 'left',
                control: 'player',

                maxHealthStat: 175,
                speedStat: 6,
                attackStat: 70,
                defenseStat: 25,
                initiativeStat: 65,
                willStat: 40,
                form: 55,
                mass: 45,

                actions: [
                    new CreatureAction({
                        name: 'Огненное пике',
                        element: 'fire',
                        baseDamage: 45,
                        hitChance: 0.75,
                        critChance: 0.15,
                        actionType: 'ranged',
                        range: 30, // Дальняя дистанция
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Быстрый коготь',
                        element: 'normal',
                        baseDamage: 38,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Огненное пике',
                        element: 'fire',
                        baseDamage: 45,
                        hitChance: 0.75,
                        critChance: 0.15,
                        actionType: 'ranged',
                        range: 30, // Дальняя дистанция
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Быстрый коготь',
                        element: 'normal',
                        baseDamage: 38,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [],
                    }),
                ],
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
            const contents = new Map()
            this.queue.forEach(creature => {
                contents.set(creature.position.join(','), creature)
            })
            this.battleMap = BattleMap.create(this.gridSizeX, this.gridSizeY, contents)
        },
        handleRound() {
            this.activeCreature = this.queue[this.round % this.queue.length]

            this.availableActions = []

            // переделать на что-то другое
            if (this.activeCreature.control === 'player') {
                this.handlePlayerTurn()
                this.setBattleState(BATTLE_STATE_PLAYER_TURN)
            } else {
                this.handleEngineTurn()
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
                    if (creature.direction === activeCreature.direction) {
                        return
                    }

                    if (creature.health <= 0) {
                        return
                    }

                    let pathLength = this.findPath(activeCreature.position, creature.position).length
                    if (pathLength === 0) {
                        return;
                    }

                    let pathLimit = activeCreature.getSpeed()
                    if (action.actionType === 'ranged') {
                        pathLimit = action.range
                    }
                    if ((pathLength - 1) > pathLimit) {
                        return
                    }

                    actionTargets.push(creature.position)
                })

                if (actionTargets.length > 0) {
                    this.availableActions.push({
                        action: 'attack', //как будто должно быть actionType
                        actionObject: action, //а тут просто action
                        targets: actionTargets,
                    })

                }
            })
        },
        handleEngineTurn() {
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
        endOfRound() {
            this.checkBattleOver()
            this.round++
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
            return {
                activeCreature: this.activeCreature,
                availableActions: this.availableActions
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
        findPath(start, end) {
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
            const hitChance = Phaser.Math.Clamp(
                attack.hitChance
                + (attacker.getInitiative() - defender.getInitiative()) / 100
                - (attacker.getForm() - defender.getForm()) / 100,
                0.05, // всегда есть шанс на поподание
                0.99 // всегда есть шанс на промах
            );
            result.hitChance = hitChance
            const isCrit = Math.random() < (attack.critChance
                + (attacker.getWill() - defender.getWill()) / 100);

            const dice = Math.random()
            if (dice < hitChance) {
                result.success = true

                // считаем урон
                result.damage = Math.floor(attack.baseDamage
                    * (attacker.getAttack() / defender.getDefense())
                    * (1 + (attacker.mass - defender.mass) / 100)
                    * this.getElementMultiplier(attack.element, defender.element)
                    * (isCrit ? 1.15 : 1)
                )
                defender.health -= result.damage
            }


            if (defender.health <= 0) {
                defender.health = 0
                // гомосятина переделать
                let targetIndex = this.queue.findIndex(c => c === defender)
                this.queue.splice(targetIndex, 1)
                this.battleMap.removeContent(...defender.position)
                targetIndex = this.queue.findIndex(c => c === this.activeCreature)
                this.round = targetIndex
            }

            result.health = defender.health

            console.log(result)
            return result
        },
        playerActionMoveAndAttack(path, targetPosition, action) {
            this.playerActionMoveTo(path)
            return this.playerActionAttack(targetPosition, action)
        },
        getCreatureByCoords(position) {
            return this.battleMap.get(position.join(','))?.content
        },
        getElementMultiplier(attackElement, defenseElement) {
            const normal = 1
            const enlarged = 1.5
            const reduced = 0.75

            return {
                'fire->fire': reduced,
                'fire->water': reduced,
                'fire->grass': enlarged,
                'water->water': reduced,
                'water->fire': enlarged,
                'water->grass': reduced,
                'grass->grass': reduced,
                'grass->water': enlarged,
                'grass->fire': reduced,
            }[attackElement + '->' + defenseElement] || 1.0
        }
    },
});
