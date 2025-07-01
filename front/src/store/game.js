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
        inventory: [
            {
                id: 1,
                name: 'Огненный Клык',
                type: 'shard',
                shardType: 'element',
                code: 'fire',
                rarity: 'common',
                count: 3,
                texture: 'fire_shard',
                img: 'assets/runes/fire_shard.png',
            },
            {
                id: 2,
                name: 'Морская Пена',
                type: 'shard',
                shardType: 'element',
                code: 'water',
                rarity: 'common',
                count: 5,
                texture: 'water_shard',
                img: 'assets/runes/water_shard.png',
            },
            {
                id: 3,
                name: 'Лист Древних',
                type: 'shard',
                shardType: 'element',
                code: 'grass',
                rarity: 'common',
                count: 7,
                texture: 'grass_shard',
                img: 'assets/runes/grass_shard.png',
            },
            {
                id: 4,
                name: 'Сердце Волка',
                type: 'shard',
                shardType: 'shape',
                code: 'beast',
                rarity: 'common',
                count: 1,
                texture: 'beast_shard',
                img: 'assets/runes/beast_shard.png',
            },
            {
                id: 5,
                name: 'Крыло Ворона',
                type: 'shard',
                shardType: 'shape',
                code: 'bird',
                rarity: 'common',
                count: 2,
                texture: 'bird_shard',
                img: 'assets/runes/bird_shard.png',
            },
            {
                id: 6,
                name: 'Язык змеи',
                type: 'shard',
                shardType: 'shape',
                code: 'reptile',
                rarity: 'common',
                count: 2,
                texture: 'reptile_shard',
                img: 'assets/runes/reptile_shard.png',
            },
            {
                id: 7,
                name: 'Капля Ярости',
                type: 'shard',
                shardType: 'emotion',
                code: 'rage',
                rarity: 'common',
                count: 4,
                texture: 'rage_shard',
                img: 'assets/runes/rage_shard.png'
            },
            {
                id: 8,
                name: 'Свет Надежды',
                type: 'shard',
                shardType: 'emotion',
                code: 'hope',
                rarity: 'common',
                count: 4,
                texture: 'hope_shard',
                img: 'assets/runes/hope_shard.png'
            },
            {
                id: 9,
                name: 'Тень Азарта',
                type: 'shard',
                shardType: 'emotion',
                code: 'passion',
                rarity: 'common',
                count: 4,
                texture: 'passion_shard',
                img: 'assets/runes/passion_shard.png'
            },
        ],
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
    getters: {
        inventoryShards() {
            return this.inventory.filter(ii => ii.type === 'shard')
        }
    },
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
        
        addCreature(creatureData) {
            this.creatures.push(creatureData)
        },
        inventoryRemove(item, count = 1) {
            const index = this.inventory.findIndex(ii => ii.id === item.id)
            if (index === -1) {
                return
            }

            this.inventory[index].count-= count
            if (this.inventory[index].count <= 0) {
                this.inventory.splice(index, 1)
            }
        },
    },
});
