import {defineStore} from 'pinia';
import {locationsLib} from "../database/locationsLib.js";
import {npcDialogs} from "../database/dialogsLib.js";
import npcsLib from "../database/npcsLib.js";

export const useGameStore = defineStore('game', {
    state: () => ({
        game: undefined,
        currentSceneName: undefined,
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
        ],
        creatures: [],

        // Сюжетные флаги
        flags: [],

        currentState: 'location', //battle, craft?
        battleConfig: undefined,

        // Локации
        currentLocationId: 'academy',
        currentDialogNpc: null,
        currentDialogNodeId: null,
        visitedLocations: [],
        metNpcs: [],


        // Прогресс диалогов
        dialogProgress: {
            dragomir: {}
        }
    }),
    getters: {
        inventoryShards(state) {
            return state.inventory.filter(ii => ii.type === 'shard')
        },
        isLocationAvailable: (state) => (locationId) => {
            const location = locationsLib[locationId];
            if (!location) {
                return false
            }
            return location.conditions.every(cond => state.flags[cond]);
        },
        currentLocation(state) {
            if (!state.currentLocationId || !this.isLocationAvailable(state.currentLocationId)) {
                state.moveToLocation('academy') // дополнительно, если не задана локация, то телепортируем в академию
            }

            return locationsLib[state.currentLocationId]
        },
        currentDialog(state) {
            if (state.currentState !== 'dialog') {
                return null
            }

            const npc = npcsLib[this.currentDialogNpc]
            const dialogNode = npcDialogs[this.currentDialogNpc][this.currentDialogNodeId]
            
            let phrase = dialogNode.npcText;
            if (Array.isArray(phrase)) {
                phrase = phrase[Math.floor(Math.random() * phrase.length)]
            }

            return {
                name: npc.name,
                phrase: phrase,
                options: dialogNode.options,
                image: npc.image
            }
        }
    },
    actions: {
        load() {
        },
        setGame(game) {
            this.game = game
        },
        changeScene(newScene) {
            this.currentSceneName = newScene
            if (!this.scene) {
                return
            }

            console.log(this.scene)

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
            if (!this.knownCreatures.includes(creatureData.number)) {
                this.knownCreatures.push(creatureData.number);
            }
        },
        inventoryRemove(item, count = 1) {
            const index = this.inventory.findIndex(ii => ii.id === item.id)
            if (index === -1) {
                return
            }

            this.inventory[index].count -= count
            if (this.inventory[index].count <= 0) {
                this.inventory.splice(index, 1)
            }
        },
        setFlag(flag, value) {
            this.flags[flag] = value;
        },
        addInventoryItem(item) {
            this.inventory.push(item);
        },
        moveToLocation(locationId) {
            if (this.isLocationAvailable(locationId)) {
                this.currentLocationId = locationId;
                if (!this.visitedLocations.includes(locationId)) {
                    this.visitedLocations.push(locationId);
                }
            }
        },
        recordDialogProgress(npcId, nodeId) {
            // Сохраняем прогресс диалога
        },
        startDialog(npcId) {
            const npc = npcsLib[npcId]
            const dialogNodeId = this.getDefaultDialogNodeId(npc)
            if (!npcDialogs[npcId] || !npcDialogs[npcId][dialogNodeId]) {
                return false
            }


            if (!this.metNpcs.includes(npcId)) {
                this.metNpcs.push(npcId);
            }

            this.currentDialogNpc = npcId
            this.currentDialogNodeId = dialogNodeId
            this.currentState = 'dialog'
        },
        getDefaultDialogNodeId(npc) {
            if (!npc.defaultDialog) {
                return 'greeting'
            }

            for (const defaultDialog of npc.defaultDialog) {
                if (defaultDialog.conditions.every(condition => condition(this))) {
                    return defaultDialog.dialogNodeId
                }
            }
            return 'greeting'
        },
        selectDialogOption(dialogNodeId) {
            if (!npcDialogs[this.currentDialogNpc][dialogNodeId]) {
                return false
            }

            this.currentDialogNodeId = dialogNodeId
        },
        endDialog() {
            this.currentDialogNpc = null
            this.currentDialogNodeId = null
            this.currentState = 'location'
        },
        setState(newState) {
            this.currentState = newState;
        }
    },
});
