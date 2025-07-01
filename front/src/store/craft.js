import {defineStore} from 'pinia';
import {creaturesLib} from "../database/CreaturesLib.js";
import {useGameStore} from "./game.js";
const gameStore = useGameStore()

export const useCraftStore = defineStore('craft', {
    state: () => ({
        selectedShape: null,
        selectedEmotion: null,
        selectedElement: null,
        isKnownCreature: false,
        craftStatRange: {
            rage: {
                maxHealthStat: 15,
                attackStat: 10,
                defenseStat: 20,
                willStat: 10,
                initiativeStat: 20,
                speedStat: 0,
                maxPP: 1,
                ppRegen: 1,
            },
            passion: {
                maxHealthStat: 10,
                attackStat: 5,
                defenseStat: 5,
                willStat: 15,
                initiativeStat: 20,
                speedStat: 0,
                maxPP: 1,
                ppRegen: 1,
            },
            hope: {
                maxHealthStat: 10,
                attackStat: 10,
                defenseStat: 15,
                willStat: 30,
                initiativeStat: 20,
                speedStat: 0,
                maxPP: 2,
                ppRegen: 1,
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

            const newCreature = Object.assign({}, this.potentialCreature)

            // Присваиваем рандомный ИД
            newCreature.id = crypto.randomUUID();

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

            gameStore.inventoryRemove(this.selectedElement)
            gameStore.inventoryRemove(this.selectedShape)
            gameStore.inventoryRemove(this.selectedEmotion)
            gameStore.addCreature(newCreature)

            this.selectedElement = null
            this.selectedShape = null
            this.selectedEmotion = null


            this.createdCreature = newCreature;
            return newCreature
        },
    },
});
