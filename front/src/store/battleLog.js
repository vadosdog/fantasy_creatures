import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";
import {QueueController} from "../game/classes/battle/QueueController.js";
import {CombatHandler} from "../game/classes/battle/CombatHandler.js";
import {
    testTeam
} from "../database/creaturesLib.js";
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
        },
        getStatistic() {
            // Не уверен, что тут должен считать EXP, но пусть будет пока
            const result = {}
            for (const {log} of this.battleLog) {
                for (const logElement of log) {
                    // На интересуют только атаки, лечения и эффекты не на себя
                    if (
                        !(logElement.type === 'attack'
                            || logElement.type === 'treat'
                            || (logElement.type === 'pushEffect' && logElement.actor?.id !== logElement.target?.id))
                        || !logElement.success
                    ) {
                        continue;
                    }

                    if (!result.hasOwnProperty(logElement.actor.id)) {
                        result[logElement.actor.id] = 0
                    }

                    switch (logElement.type) {
                        case 'attack':
                            if (logElement.damage > 0) {

                                result[logElement.actor.id] += Math.round(logElement.damage * (1 + 0.01 * logElement.target.level))
                            }
                            break
                        case 'treat':
                            if (logElement.damage > 0) {
                                result[logElement.actor.id] += Math.round(logElement.damage * 1.25 * (1 + 0.01 * logElement.target.level))
                            }
                            break
                        case 'pushEffect':
                            result[logElement.actor.id] += Math.round(50 * (1 + 0.01 * logElement.target.level))
                            break
                    }
                }
            }

            return result
        }
    }
});