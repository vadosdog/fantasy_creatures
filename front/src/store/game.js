import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/BattleMap.js";

export const useGameStore = defineStore('game', {
    state: () => ({}),
    getters: {},
    actions: {
        load() {
        },
        setScene(scene) {
            this.scene = scene
        }
    },
});
