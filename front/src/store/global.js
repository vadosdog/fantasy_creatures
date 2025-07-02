import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/battle/BattleMap.js";
import {QueueController} from "../game/classes/battle/QueueController.js";
import {CombatHandler} from "../game/classes/battle/CombatHandler.js";
import {
    testTeam
} from "../database/creaturesLib.js";
import {CreatureAPI} from "../game/classes/battle/Creature.js";

export const useGlobalStore = defineStore('global', {
    state: () => ({
        dialogVisible: false
    }),
    actions: {
        setDialogVisible(visible) {
            this.dialogVisible = visible;

            // Глобально блокируем прокрутку страницы при открытии диалога
            if (visible) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }
});