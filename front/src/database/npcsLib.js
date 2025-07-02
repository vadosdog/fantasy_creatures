import {conditions} from "./conditionsLib.js";

export default {
    dragomir: {
        id: 'dragomir',
        name: 'Драгомир',
        location: 'academy',
        image: '/assets/npcs/dragomir_transperent.png',
        defaultDialog: [ // Массив стандартных диалогов с условиями. С конца, если условие не подходит, то следующее
            {
                conditions: [
                    conditions.requireMeetNpc('dragomir'),
                ],
                dialogNodeId: 'greeting',
            },
            {
                conditions: [],
                dialogNodeId: 'first_meet',
            }
        ],
    },
}