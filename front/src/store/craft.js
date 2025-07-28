import {defineStore} from 'pinia';
import {creaturesLib, getActionsByLevel} from "../database/creaturesLib.js";
import {useGameStore} from "./game.js";
import {calcCreatureStats} from "../game/classes/battle/Creature.js";

const gameStore = useGameStore()

export const useCraftStore = defineStore('craft', {
    state: () => ({
        selectedShape: null,
        selectedEmotion: null,
        selectedElement: null,
        isKnownCreature: false,
        craftStatRange: {
            rage: {
                baseMaxHealthStat: 15,
                baseAttackStat: 10,
                baseDefenseStat: 20,
                baseWillStat: 10,
                baseInitiativeStat: 20,
                baseSpeedStat: 0,
                baseMaxPP: 1,
                basePpRegen: 1,
            },
            passion: {
                baseMaxHealthStat: 10,
                baseAttackStat: 5,
                baseDefenseStat: 5,
                baseWillStat: 15,
                baseInitiativeStat: 20,
                baseSpeedStat: 0,
                baseMaxPP: 1,
                basePpRegen: 1,
            },
            hope: {
                baseMaxHealthStat: 10,
                baseAttackStat: 10,
                baseDefenseStat: 15,
                baseWillStat: 30,
                baseInitiativeStat: 20,
                baseSpeedStat: 0,
                baseMaxPP: 2,
                basePpRegen: 1,
            }
        },
        createdCreature: null,
    }),
    getters: {
        selectedShards() {
            return [this.selectedShape, this.selectedEmotion, this.selectedElement]
        },
        potentialCreature() {
            if ([this.selectedShape, this.selectedEmotion, this.selectedElement].filter(s => !!s).length < 3) {
                return null
            }

            return creaturesLib[this.selectedElement.code + '-' + this.selectedShape.code + '-' + this.selectedEmotion.code]
        },
    },
    actions: {
        selectShard(type, shard) {
            if (this.createdCreature) {
                this.createdCreature = null
            }
            switch (type) {
                case 'shape':
                    this.selectedShape = shard
                    break
                case 'element':
                    this.selectedElement = shard
                    break
                case 'emotion':
                    this.selectedEmotion = shard
                    break
            }
        },
        createNewCreature() {
            if (!this.potentialCreature) {
                return
            }

            let newCreature = Object.assign({}, this.potentialCreature)

            // Присваиваем рандомный ИД
            newCreature.id = crypto.randomUUID();
            newCreature.level = 1;

            const diffs = this.craftStatRange[newCreature.emotion]

            for (let prop in diffs) {
                if (newCreature.hasOwnProperty(prop)) {
                    const diffValue = diffs[prop];
                    if (diffValue === 0) {
                        continue
                    }

                    // Генерируем случайное число в диапазоне [-diffValue; +diffValue]
                    const randomOffset = Math.floor(Math.random() * (2 * diffValue + 1)) - diffValue;

                    // Применяем смещение
                    newCreature[prop] += randomOffset;
                }
            }


            newCreature = calcCreatureStats(newCreature)
            newCreature.actions = getActionsByLevel(
                this.selectedElement.code,
                this.selectedShape.code,
                this.selectedEmotion.code,
                1
            )

            gameStore.inventoryRemove(this.selectedElement.id)
            gameStore.inventoryRemove(this.selectedShape.id)
            gameStore.inventoryRemove(this.selectedEmotion.id)
            gameStore.addCreature(newCreature)
            
            this.selectedElement = null
            this.selectedShape = null
            this.selectedEmotion = null


            this.createdCreature = newCreature;

            return newCreature
        },
    },
});
