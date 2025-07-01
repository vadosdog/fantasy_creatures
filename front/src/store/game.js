import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";

export const useGameStore = defineStore('game', {
    state: () => ({
        game: undefined,
        scene: undefined,
        hoveredCreatureId: undefined,
        tooltip: {
            show: false,
            text: '',
            position: {x: 0, y: 0}
        },
        inventory: {
            shards: [
                {
                    id: 1,
                    name: 'Огненный Клык',
                    type: 'element',
                    code: 'fire',
                    rarity: 'common',
                    count: 3,
                    icon: 'whatshot',
                    img: 'assets/runes/fire_shard.png',
                },
                {
                    id: 2,
                    name: 'Морская Пена',
                    type: 'element',
                    code: 'water',
                    rarity: 'common',
                    count: 5,
                    icon: 'water_drop',
                    img: 'assets/runes/water_shard.png',
                },
                {
                    id: 3,
                    name: 'Лист Древних',
                    type: 'element',
                    code: 'grass',
                    rarity: 'common',
                    count: 7,
                    icon: 'grass',
                    img: 'assets/runes/grass_shard.png',
                },
                {
                    id: 4,
                    name: 'Сердце Волка',
                    type: 'form',
                    code: 'beast',
                    rarity: 'common',
                    count: 1,
                    icon: 'pets',
                    img: 'assets/runes/beast_shard.png',
                },
                {
                    id: 5,
                    name: 'Крыло Ворона',
                    type: 'form',
                    code: 'bird',
                    rarity: 'common',
                    count: 2,
                    icon: 'flutter_dash',
                    img: 'assets/runes/bird_shard.png',
                },
                {
                    id: 6,
                    name: 'Язык змеи',
                    type: 'form',
                    code: 'reptile',
                    rarity: 'common',
                    count: 2,
                    icon: 'flutter_dash',
                    img: 'assets/runes/reptile_shard.png',
                },
                {
                    id: 7,
                    name: 'Капля Ярости',
                    type: 'emotion',
                    code: 'rage',
                    rarity: 'common',
                    count: 4,
                    icon: 'mood_bad',
                    img: 'assets/runes/rage_shard.png'
                },
                {
                    id: 8,
                    name: 'Свет Надежды',
                    type: 'emotion',
                    code: 'hope',
                    rarity: 'common',
                    count: 4,
                    icon: 'mood_bad',
                    img: 'assets/runes/hope_shard.png'
                },
                {
                    id: 9,
                    name: 'Тень Азарта',
                    type: 'emotion',
                    code: 'passion',
                    rarity: 'common',
                    count: 4,
                    icon: 'mood_bad',
                    img: 'assets/runes/passion_shard.png'
                },
            ],
        },
        knownCreatures: [
            '001',
            '004',
            '007',
            '010',
            '013',
            '016',
            '019',
            '022',
            '025',
            '028',
            '031',
            '034',
            '037',
            '040',
            '043',
            '046',
            '049',
            '052',
            '055',
            '058',
            '061',
            '064',
            '067',
            '070',
            '073',
            '076',
            '079',
        ],
        creatures: [],
    }),
    getters: {},
    actions: {
        load() {
        },
        setGame(game) {
            this.game = game
        },
        changeScene(newScene) {
            if (!this.scene) {
                return
            }

            this.scene.start(newScene);
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
