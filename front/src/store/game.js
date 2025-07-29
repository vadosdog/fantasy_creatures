import {defineStore} from 'pinia';
import {locationsLib} from "../database/locationsLib.js";
import {npcDialogs} from "../database/dialogsLib.js";
import npcsLib from "../database/npcsLib.js";
import {markRaw} from "vue";
import {resourcesLib} from "../database/resourcesLib.js";
import {Notify} from "quasar";
import {ALLOWED_KEYS, useYandexStore} from "./yandexStore.js";

export const useGameStore = defineStore('game', {
    // persist: {
    //     storage: localStorage
    // },
    state: () => ({
        game: undefined,
        currentSceneName: undefined,
        scene: undefined, //TODO не нужно тут
        hoveredCreatureId: undefined, //ToDO не нужно тут
        tooltip: { //TODO не нужно тут
            show: false,
            text: '',
            position: {x: 0, y: 0}
        },
        inventory: [
            {
                id: 'memory_shard',
                amount: 0,
            },
            {
                id: 'craft_shard_fire_common',
                amount: 1,
            },
            {
                id: 'craft_shard_water_common',
                amount: 1,
            },
            {
                id: 'craft_shard_grass_common',
                amount: 1,
            },
            {
                id: 'craft_shard_beast_common',
                amount: 1,
            },
            {
                id: 'craft_shard_bird_common',
                amount: 1,
            },
            {
                id: 'craft_shard_reptile_common',
                amount: 1,
            },
            {
                id: 'craft_shard_rage_common',
                amount: 1,
            },
            {
                id: 'craft_shard_hope_common',
                amount: 1,
            },
            {
                id: 'craft_shard_passion_common',
                amount: 1,
            },
        ],
        knownCreatures: [],
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
        },

        // Просто вспомогательная переменная для выбора существа для прокачки в библиотеке
        selectedLibraryCreatureId: null,
    }),
    getters: {
        inventoryObjects(state) {
            return state.inventory.map((item) => {
                return Object.assign({amount: item.amount}, resourcesLib[item.id])
            })
        },
        inventoryShards(state) {
            return state.inventoryObjects.filter(ii => ii.type === 'shard')
        },
        inventoryResources(state) {
            return state.inventoryObjects.filter(ii => ii.type !== 'shard')
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
        // Инициализация состояния
        async initialize() {
            const yandexStore = useYandexStore();

            let savedData = await yandexStore.loadGame();

            // Проверяем, есть ли сохранённые данные (не пустой объект)
            const hasSavedData = savedData && typeof savedData === 'object' && Object.keys(savedData).length > 0;

            if (hasSavedData) {
                this.$patch(savedData);
            }
        },
        load() {
        },
        setGame(game) {
            if (!game) {
                this.game = null
                return
            }
            // this.game = markRaw(game)
        },
        changeScene(newScene) {
            this.currentSceneName = newScene
            if (!this.scene) {
                return
            }


            this.scene.start(newScene);
        },
        setScene(scene) {
            if (!scene) {
                this.scene = null
                return
            }
            this.scene = markRaw(scene) //TODO не надо этот тут вообще
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
            this.creatures = [...this.creatures, creatureData];
            if (!this.knownCreatures.includes(creatureData.number)) {
                this.knownCreatures = [...this.knownCreatures, creatureData.number];
            }
        },
        inventoryRemove(itemId, amount = 1) {
            const index = this.inventory.findIndex(ii => ii.id === itemId);
            if (index === -1) return;

            const item = this.inventory[index];
            if (item.amount <= amount) {
                // Удаляем элемент — создаём новый массив
                this.inventory = this.inventory.filter(i => i.id !== itemId);
            } else {
                // Обновляем количество — создаём новый объект
                this.inventory = this.inventory.map(i =>
                    i.id === itemId ? {...i, amount: i.amount - amount} : i
                );
            }
        },
        setFlag(flag, value) {
            this.flags[flag] = value;
            this.saveGame()
        },
        hasInventoryItem(id, amount = 1) {
            const item = this.inventory.find(ii => ii.id === id);
            return item ? item.amount >= amount : false;
        },
        addInventoryItem({id, amount}) {
            const index = this.inventory.findIndex(ii => ii.id === id);
            if (index === -1) {
                this.inventory = [...this.inventory, {id, amount}];
            } else {
                this.inventory = this.inventory.map(i =>
                    i.id === id ? {...i, amount: i.amount + amount} : i
                );
            }

            const resourceItem = resourcesLib[id];
            if (resourceItem) {
                Notify.create({
                    html: true,
                    message: `<img src="${resourceItem.img}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;"> +${amount} ${resourceItem.name}`,
                    position: 'top-right',
                    timeout: 3000,
                    closeBtn: true,
                    color: 'white',
                    textColor: 'dark',
                });
            }
        },
        addCreatureExperience(id, exp) {
            // Находим объект по id
            const entity = this.creatures.find(item => item.id === id);

            if (!entity) {
                console.warn(`Entity with id ${id} not found.`);
                return
            }

            // Если объект найден, добавляем опыт
            if (typeof entity.experience === 'number') {
                entity.experience += exp;
            } else {
                entity.experience = exp; // Если experience нет — создаём
            }
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
        },
        creatureLevelUp(creatureId) {
            const index = this.creatures.findIndex(c => c.id === creatureId);
            console.log(index, creatureId)

            if (index === -1) return;

            const creature = this.creatures[index];
            const levelCost = 50 + 10 * Math.floor(creature.level / 3);

            if (!this.hasInventoryItem('memory_shard', levelCost)) {
                return;
            }

            // Рассчитываем новые значения
            const newLevel = creature.level + 1;
            const levelModifier = 1 + 0.03 * (newLevel - 1);

            // Создаём новый объект с новыми значениями
            const updatedCreature = {
                ...creature,
                level: newLevel,
                maxHealthStat: Math.round(creature.baseMaxHealthStat * levelModifier) + (creature.manualMaxHealthStat || 0),
                attackStat: Math.round(creature.baseAttackStat * levelModifier) + (creature.manualAttackStat || 0),
                defenseStat: Math.round(creature.baseDefenseStat * levelModifier) + (creature.manualDefenseStat || 0),
                willStat: Math.round(creature.baseWillStat * levelModifier) + (creature.manualWillStat || 0),
                initiativeStat: Math.round(creature.baseInitiativeStat * levelModifier) + (creature.manualInitiativeStat || 0),
                maxPP: Math.round(creature.baseMaxPP * levelModifier) + (creature.manualMaxPP || 0),
                ppRegen: Math.round(creature.basePpRegen * levelModifier) + (creature.manualPpRegen || 0),
                manualPoints: (creature.manualPoints || 0) + 4,
            };

            // Заменяем в массиве
            this.creatures = this.creatures.map(c => c.id === creatureId ? updatedCreature : c);

            // Тратим ресурс
            this.inventoryRemove('memory_shard', levelCost);

            this.saveGame()
        },
        upgradeStat(creature, statKey) {
            const manualKey = `manual${statKey.charAt(0).toUpperCase() + statKey.slice(1)}`;
            // Обновляем итоговое значение
            const baseKey = `base${statKey.charAt(0).toUpperCase() + statKey.slice(1)}`;

            let index = this.creatures.findIndex(({id}) => id === creature.id)
            if (index === -1) {
                return
            }

            creature = this.creatures[index]

            if ((creature.manualPoints || 0) <= 0 || creature[manualKey] >= 100) {
                return
            }

            // Увеличиваем ручное значение характеристики
            creature[manualKey] = (creature[manualKey] || 0) + 1;

            // Уменьшаем доступные очки прокачки
            creature.manualPoints -= 1;

            const baseValue = creature[baseKey];
            const level = creature.level;
            const manualValue = creature[manualKey] || 0;

            // Пересчёт: base * (1 + 0.03 * (level - 1)) + manual
            creature[statKey] = Math.round(
                baseValue * (1 + 0.03 * (level - 1)) + manualValue
            );

            this.saveGame()
        },
        toggleSkill(creatureId, skill) {
            const creatureIndex = this.creatures.findIndex(c => c.id === creatureId);
            if (creatureIndex === -1) return;

            const creature = this.creatures[creatureIndex];
            const exists = creature.actions.some(a => a.id === skill.id);

            let newActions;
            if (exists) {
                newActions = creature.actions.filter(a => a.id !== skill.id);
            } else {
                newActions = [...creature.actions, skill];
                if (newActions.length > 4) {
                    newActions = newActions.slice(1);
                }
            }

            // Создаём новый объект существа
            const updatedCreature = {
                ...creature,
                actions: newActions
            };

            // Заменяем в массиве
            this.creatures = this.creatures.map(c => c.id === creatureId ? updatedCreature : c);

            this.saveGame();
        },
        applyRewards(rewards) {
            if (rewards.resources) {
                for (const resource of rewards.resources) {
                    this.addInventoryItem(resource)
                }
            }

            if (rewards.experience) {
                for (const id of Object.keys(rewards.experience)) {
                    this.addCreatureExperience(id, rewards.experience[id])
                }
            }
            this.saveGame()
        },
        selectLibraryCreatureId(id) {
            this.selectedLibraryCreatureId = id
        },
        saveGame() {
            const gameData = {};
            for (const key of ALLOWED_KEYS) {
                const value = this.$state[key];
                // Полностью клонируем, убивая реактивность
                gameData[key] = JSON.parse(JSON.stringify(value));
            }

            useYandexStore().throttledSave(gameData);
        }
    },
});
