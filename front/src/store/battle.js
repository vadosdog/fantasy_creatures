import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/BattleMap.js";

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
            {
                name: 'Flameky',
                texture: 'Pink_Monster',
                health: 10,
                maxHealth: 100,
                position: [2, 13],
                direction: 'right',
                control: 'player',
                speed: 4,
                attacks: [
                    {

                        'name': 'Искры',
                        'chance': 90,
                        'power': 10,
                        'type': 'melee',
                    },
                    {
                        'name': 'Fireball',
                        'chance': 50,
                        'power': 50,
                        'type': 'ranged',
                    }
                ],
            },
            {
                name: 'Bubbly',
                texture: 'Dude_Monster',
                health: 50,
                maxHealth: 100,
                position: [3, 13],
                direction: 'right',
                control: 'player',
                speed: 4,
                attacks: [
                    {

                        'name': 'Брызги',
                        'chance': 80,
                        'power': 20,
                        'type': 'melee',
                    },
                    {
                        'name': 'Водомет',
                        'chance': 40,
                        'power': 80,
                        'type': 'ranged',
                    }
                ],
            },
            {
                name: 'Droplet',
                texture: 'Owlet_Monster',
                health: 100,
                maxHealth: 100,
                position: [2, 19],
                direction: 'left',
                control: 'engine',
                speed: 4,
                attacks: [
                    {

                        'name': 'Искры',
                        'chance': 90,
                        'power': 10,
                        'type': 'melee',
                    },
                    {
                        'name': 'Fireball',
                        'chance': 50,
                        'power': 50,
                        'type': 'ranged',
                    }
                ],
            },
            {
                name: 'Bulbik',
                texture: 'Dude_Monster',
                health: 100,
                maxHealth: 100,
                position: [3, 19],
                direction: 'left',
                control: 'engine',
                speed: 4,
                attacks: [
                    {

                        'name': 'Брызги',
                        'chance': 80,
                        'power': 20,
                        'type': 'melee',
                    },
                    {
                        'name': 'Водомет',
                        'chance': 40,
                        'power': 80,
                        'type': 'ranged',
                    }
                ],
            },
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
            const moveable = this.getMoveablePositions(this.activeCreature)
            if (moveable.length) {
                this.availableActions.push({
                    action: 'move',
                    targets: moveable,
                })
            }

            const attackAble = []
            this.creatures.forEach(creature => {
                if (creature.direction === this.activeCreature.direction) {
                    return
                }

                if (creature.health <= 0) {
                    return
                }

                let pathLength = this.findPath(this.activeCreature.position, creature.position).length
                if (pathLength === 0) {
                    return;
                }
                if ((pathLength - 1) > this.activeCreature.speed) {
                    return
                }

                attackAble.push(creature.position)
            })
            if (attackAble.length) {
                this.availableActions.push({
                    action: 'attack',
                    targets: attackAble,
                })
            }
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
            let speed = activeCreature.speed
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
        playerActionAttack(targetPosition) {
            const result = {
                attack: undefined,
                success: false,
                damage: 0,
                health: 0
            }
            const targetCreature = this.getCreatureByCoords(targetPosition)
            if (!targetPosition) {
                return
            }

            const attack = this.activeCreature.attacks[0]
            result.attack = attack.name
            const dice = Phaser.Math.Between(0, 100)
            if (dice < attack.chance) {
                result.success = true
                result.damage = attack.power
            }

            targetCreature.health -= result.damage
            if (targetCreature.health <= 0) {
                targetCreature.health = 0
                // гомосятина переделать
                let targetIndex = this.queue.findIndex(c => c === targetCreature)
                this.queue.splice(targetIndex, 1)
                this.battleMap.removeContent(...targetCreature.position)
                targetIndex = this.queue.findIndex(c => c === this.activeCreature)
                this.round = targetIndex
            }

            result.health = targetCreature.health

            return result
        },
        playerActionMoveAndAttack(path, targetPosition) {
            this.playerActionMoveTo(path)
            return this.playerActionAttack(targetPosition)
        },
        getCreatureByCoords(position) {
            return this.battleMap.get(position.join(','))?.content
        }
    },
});
