import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/BattleMap.js";

export const GAME_STATE_PLAYER_TURN = 'PLAYER_TURN'
export const GAME_STATE_ENGINE_TURN = 'ENGINE_TURN'
export const GAME_STATE_WAITING = 'GAME_STATE_WAITING'

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
                name: 'One',
                sprite: 'dude',
                health: 100,
                mahHealth: 100,
                position: [1, 2],
                direction: 'right',
                speed: 4,
                availableActions: [
                    {
                        action: 'move'
                    }
                ]
            },
            {
                name: 'Two',
                sprite: 'dude',
                health: 100,
                mahHealth: 100,
                position: [1, 6],
                direction: 'right',
                speed: 4,
                availableActions: [
                    {
                        action: 'move',
                    }
                ]
            },
            {
                name: 'Three',
                sprite: 'dude',
                health: 100,
                mahHealth: 100,
                position: [1, 5],
                direction: 'left',
                speed: 4,
            },
            {
                name: 'Four',
                sprite: 'dude',
                health: 100,
                mahHealth: 100,
                position: [4, 28],
                direction: 'left',
                speed: 4,
            },
        ],
        gameState: GAME_STATE_WAITING,
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
        nextRound() {
            this.activeCreature = this.queue[this.round % 4]

            this.availableActions = []
            const moveable = this.getMoveablePositions(this.activeCreature)
            if (moveable.length) {
                this.availableActions.push(
                    {
                        action: 'move',
                        targets: this.getMoveablePositions(this.activeCreature),
                    })
            }

            // переделать на что-то другое
            if (this.activeCreature.direction === 'right') {
                this.setGameState(GAME_STATE_PLAYER_TURN)
            }
        },
        setGameState(gameState) {
            this.gameState = gameState
        },
        endOfRound() {
            this.round++
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
        playerActionMoveTo(path) {
            this.battleMap.removeContent(...this.activeCreature.position)
            this.activeCreature.position = path[path.length - 1]
            this.battleMap.setContent(...path[path.length - 1], this.activeCreature)
        }
    },
});
