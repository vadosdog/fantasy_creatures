import {defineStore} from 'pinia';

export const GAME_STATE_CHOOSE_TARGET = 'GAME_STATE_CHOOSE_TARGET'
export const GAME_STATE_WAITING = 'GAME_STATE_WAITING'

export const useBattleStore = defineStore('battle', {
    state: () => ({
        // Количество ячеек горизонтально (учитывая два ряда)
        gridSizeX: 31,
        // Количество ячеек вертикально (каждый ряд)
        gridSizeY: 11,
        hexagonsArray: new Map(),
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
            },
            {
                name: 'Four',
                sprite: 'dude',
                health: 100,
                mahHealth: 100,
                position: [4, 28],
                direction: 'left',
            },
        ],

        gameState: GAME_STATE_WAITING
    }),
    getters: {},
    actions: {
        setGameState(gameState) {
            this.gameState = gameState
        },
        endOfRound(){
            this.round++
        },
        setHexagonsMaps(map) {
            this.hexagonsArray = map
        }
    },
});
