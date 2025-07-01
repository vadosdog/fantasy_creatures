import {defineStore} from 'pinia';
import {creaturesLib} from "../database/CreaturesLib.js";

export const useCraftStore = defineStore('craft', {
    state: () => ({
        selectedForm: null,
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
        }
    }),
    getters: {
        selectedShards() {
            return [this.selectedForm, this.selectedEmotion, this.selectedElement]
        },
        potentialCreature() {
            if ([this.selectedForm, this.selectedEmotion, this.selectedElement].filter(s => !!s).length < 3) {
                return null
            }

            return creaturesLib[this.selectedElement.code + '-' + this.selectedForm.code + '-' + this.selectedEmotion.code]
        },
    },
    actions: {
        selectShard(type, shard) {
            switch (type) {
                case 'form':
                    this.selectedForm = shard
                    break
                case 'element':
                    this.selectedElement = shard
                    break
                case 'emotion':
                    this.selectedEmotion = shard
                    break
            }
        },
    },
});
