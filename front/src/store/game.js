import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";

export const useGameStore = defineStore('game', {
    state: () => ({
        scene: undefined,
        hoveredCreatureId: undefined,
        tooltip: {
            show: false,
            text: '',
            position: {x: 0, y: 0}
        }
    }),
    getters: {},
    actions: {
        load() {
        },
        setScene(scene) {
            this.scene = scene
        },
        setHoveredCreature(id) {
            this.hoveredCreatureId = id;
        },
        showTooltip(text, position = {x: 0, y: 0}) {
            this.tooltip = {show: true, text, position};
        },
        hideTooltip() {
            this.tooltip.show = false;
        },
    },
});
