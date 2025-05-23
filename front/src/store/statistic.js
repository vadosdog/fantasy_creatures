import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";

export const useStatisticStore = defineStore('statistic', {
    state: () => ({
    }),
    getters: {},
    actions: {
        load() {
        },
        setScene(scene) {
            this.scene = scene
        }
    },
});
