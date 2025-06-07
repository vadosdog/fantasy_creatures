import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";
import {QueueController} from "../game/classes/battle/QueueController.js";
import {CombatHandler} from "../game/classes/battle/CombatHandler.js";
import {
    testTeam
} from "../database/CreaturesLib.js";
import {CreatureAPI} from "../game/classes/battle/Creature.js";

export const useBattleLogStore = defineStore('battleLog', {
    state: () => ({
        battleLog: [],
        lastTurn: undefined,
    }),
    actions: {
        recordLog(round, turn, log) {
            if (!this.lastTurn || this.lastTurn.round != round || this.lastTurn.turn != turn) {
                this.lastTurn = {
                    round, turn, log: []
                }
                this.battleLog.push(this.lastTurn)
            }

            this.lastTurn.log.push(log)
        },
        resetLog() {
            this.battleLog = []
            this.lastTurn = undefined
        }
    }
});