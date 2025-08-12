import {createCreature, createCreatureAction} from "../game/classes/battle/Creature.js";

import creatures from './creatures.json';
import creaturesActions from './creature-actions.json';
import {MediumAI} from "../game/classes/battle/AI/MediumAI.js";
import {EasyAI} from "../game/classes/battle/AI/EasyAI.js";

export const creaturesLib = {}
const creatureActionsLib = {}

creatures.forEach((creature, index) => {
    creature.id = index + 1
    if (!creature.evolutionGroup) {
        creature.evolutionGroup = creature.number
    }
    let rarity = creature.rarity || 'common'
    creaturesLib[creature.element + '-' + creature.shape + '-' + creature.emotion + '-' + rarity] = creature
})

for (const actionIndex of creaturesActions.keys()) {
    const creaturesAction = creaturesActions[actionIndex]

    // Убрать, когда появятся нормальные ид
    if (!creaturesAction.id) {
        creaturesAction.id = actionIndex + 100
    }
    const key = creaturesAction.element + '-' + creaturesAction.shape + '-' + creaturesAction.emotion
    if (!creatureActionsLib[key]) {
        creatureActionsLib[key] = []
    }

    creaturesAction.hitChance /= 100
    creaturesAction.critChance /= 100

    creatureActionsLib[key].push(creaturesAction)
}

export function getTeam(direction, control, positions) {
    throw new Error('Устаревший метод')
    return
    const result = []
    lib.forEach((config, i) => {
        const creature = createCreature(getCreature(config.element, 'beast', config.emotion, 2))
        creature.id += direction === 'left' ? 100 : 0
        creature.actions = creature.actions.map(action => {
            if (action.effects) {
                for (const effect of action.effects) {
                    if (!effect.target) {
                        effect.target = 'target'
                    }
                }
            }
            return createCreatureAction(action)
        })
        creature.direction = direction
        creature.control = control
        creature.position = positions[i]
        // creature.pushEffect({effect: 'burn', duration: 1})
        result.push(creature)
    })

    return result
}

let id = 1

export function getTeam2(direction, control, creatures) {
    const positions = getPositions(direction)
    return creatures.map((config, i) => {
        const creature = createCreature(config)
        if (!creature.id) {
            creature.id = crypto.randomUUID()
        }
        creature.actions = creature.actions.map(action => {
            if (action.effects) {
                for (const effect of action.effects) {
                    if (!effect.target) {
                        effect.target = 'target'
                    }
                }
            }
            return createCreatureAction(action)
        })
        creature.direction = direction
        creature.control = control
        creature.position = positions[i]
        return creature
    })
}

export function getCreature(element, shape, emotion, level, rarity = 'common') {
    // TODO Пока нет эпических и легендарных, заменяем их редкими
    if (rarity === 'epic' || rarity === 'legendary') {
        rarity = 'rare'
    }
    // нужно копирование, иначе при повторении существ, будет один объект
    const creature = Object.assign({}, creaturesLib[element + '-' + shape + '-' + emotion + '-' + rarity]);
    // creature.name = element + '/' + shape + '/' + emotion
    creature.texture = creature.number;
    creature.level = level

    // creature.texture = [
    //     'Decidueye',
    //     'Sandslash',
    //     'Ekans',
    //     'Hoppip',
    //     'Mudkip',
    //     'Oshawott',
    //     'Piplup',
    //     'Popplio',
    //     'Quaxly',
    //     'Rowlet',
    //     'Squirtle',
    //     'Totodile',
    //     'Treecko',
    //     'Turtwig',
    //     'Wingull',
    // ][Math.floor(Math.random() * 15)] + '_Pokemon';
    // creature.textureType = 'pokemon'
    creature.textureType = 'wildermyth'
    // switch (creature.emotion) {
    //     case 'rage':
    //         creature.texture = 'Arcanine_Pokemon'
    //         creature.textureType = 'pokemon'
    //         break
    //     case 'passion':
    //         creature.texture = 'Dude_Monster'
    //         break
    //     case 'hope':
    //         creature.texture = 'Owlet_Monster'
    //         break
    // }


    creature.actions = getActionsByLevel(element, shape, emotion, level);
    return creature
}

export function getActionById(id) {
    return Object.assign({}, creaturesActions.find(obj => obj.id === id));
}

export function getActionsByLevel(element, shape, emotion, level) {
    const actions = [
        ...creatureActionsLib[element + '-' + shape + '-' + emotion],
        ...creatureActionsLib['-' + '-' + emotion],
        ...creatureActionsLib['-' + shape + '-'],
        ...creatureActionsLib[element + '-' + '-'],
        ...creatureActionsLib['-' + shape + '-' + emotion],
        ...creatureActionsLib[element + '-' + '-' + emotion],
        ...creatureActionsLib[element + '-' + shape + '-'],
    ]

    return actions.filter(action => action.level <= level).map(action => {
        return Object.assign({}, action)
    })
}

function randomEmotion() {
    return ['rage', 'passion', 'hope'][Math.floor(Math.random() * 3)];
}

function randomShape() {
    return [
        'beast',
        'bird',
        'reptile'
    ][Math.floor(Math.random() * 3)];
}

function randomElement() {
    return ['fire', 'water', 'grass'][Math.floor(Math.random() * 3)];
}

function getPositions(direction) {
    if (direction === 'right') {
        return [
            [2, 2],
            [3, 2],
            [1, 2],
            [4, 2],
            [0, 2],
            [5, 2],
        ]
    } else {
        return [
            [2, 28],
            [3, 28],
            [1, 28],
            [4, 28],
            [0, 28],
            [5, 28],
        ]
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Выбираем случайный индекс от 0 до i включительно
        const j = Math.floor(Math.random() * (i + 1));
        // Меняем элементы местами
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function testElementTeam(element, level, direction, control) {
    const creatures = [
        getCreature(element, randomShape(), 'rage', level),
        getCreature(element, randomShape(), 'rage', level),
        getCreature(element, randomShape(), 'hope', level),
        getCreature(element, randomShape(), 'hope', level),
        getCreature(element, randomShape(), 'passion', level),
        getCreature(element, randomShape(), 'passion', level),
    ]


    shuffleArray(creatures)

    const positions = getPositions(direction)
    creatures.forEach((c, i) => {
        c.position = positions[i]
    })

    return getTeam2(direction, control, creatures)
}

export function testTeam(level, direction, control, limit) {
    const roles = ['rage', 'rage', 'passion', 'passion', 'hope', 'hope'];

    const creatures = roles.slice(0, limit).map(emotion => {
        return getCreature(randomElement(), randomShape(), emotion, level)
    })


    shuffleArray(creatures)

    const positions = getPositions(direction)
    creatures.forEach((c, i) => {
        c.position = positions[i]
    })

    return getTeam2(direction, control, creatures)
}

// Тест 1: Базовый урон (ДД vs Танк)
export function testBaseDamagePassionvsRage() {
    const rage = Object.assign({}, creaturesLib['fire' + '-' + 'beast' + '-' + 'rage' + '-' + 'common']);
    const passion = Object.assign({}, creaturesLib['fire' + '-' + 'beast' + '-' + 'passion' + '-' + 'common']);
    const passion2 = Object.assign({}, creaturesLib['fire' + '-' + 'beast' + '-' + 'passion' + '-' + 'common']);
    const hope = Object.assign({}, creaturesLib['fire' + '-' + 'beast' + '-' + 'hope' + '-' + 'common']);
    rage.actions = []
    passion2.actions = []
    hope.actions = [
        {
            "name": "Лечебная волна",
            "element": "",
            "shape": "",
            "emotion": "passion",
            "level": 2,
            "Тип": "Поддерживающий",
            "actionType": "treat",
            "range": 10,
            "baseDamage": 25,
            "hitChance": 95,
            "critChance": 10,
            "effects": [],
            "": ""
        }
    ]
    passion.actions = [
        {
            "name": "Свирепый укус",
            "element": "",
            "shape": "beast",
            "emotion": "",
            "level": 1,
            "Тип": "Атакующий",
            "actionType": "melee",
            "range": 1,
            "baseDamage": 30,
            "hitChance": 90,
            "critChance": 12,
            "effects": [
                // {
                //     "effect": "bleed",
                //     "chance": 0.3,
                //     "duration": 3
                // }
            ],
            "": ""
        },
        {
            "name": "Ветряной удар",
            "element": "",
            "shape": "bird",
            "emotion": "",
            "level": 1,
            "Тип": "Атакующий",
            "actionType": "melee",
            "range": 1,
            "baseDamage": 27,
            "hitChance": 98,
            "critChance": 20,
            "effects": [],
            "": ""
        },
        {
            "name": "Ядовитый плевок",
            "element": "",
            "shape": "reptile",
            "emotion": "",
            "level": 1,
            "Тип": "Гибридный",
            "actionType": "melee",
            "range": 1,
            "baseDamage": 32,
            "hitChance": 85,
            "calcDamage": "25,5",
            "critChance": 5,
            "effects": [
                // {
                //     "effect": "poison",
                //     "chance": 0.8,
                //     "duration": 3
                // }
            ],
            "": ""
        },
        // {
        //     "name": "Огненный коготь",
        //     "element": "fire",
        //     "shape": "",
        //     "emotion": "",
        //     "level": 1,
        //     "Тип": "Атакующий",
        //     "actionType": "melee",
        //     "range": 1,
        //     "baseDamage": 26,
        //     "hitChance": 90,
        //     "critChance": 15,
        //     "effects": [
        //         // {
        //         //     "effect": "burn",
        //         //     "chance": 0.15,
        //         //     "duration": 3
        //         // }
        //     ],
        //     "": ""
        // },
        // {
        //     "name": "Ядовитый шип",
        //     "element": "grass",
        //     "shape": "",
        //     "emotion": "",
        //     "level": 1,
        //     "Тип": "Гибридный",
        //     "actionType": "melee",
        //     "range": 1,
        //     "baseDamage": 25,
        //     "hitChance": 95,
        //     "calcDamage": "23,75",
        //     "critChance": 7,
        //     "effects": [
        //         // {
        //         //     "effect": "poison",
        //         //     "chance": 0.4,
        //         //     "duration": 3
        //         // }
        //     ],
        //     "": ""
        // },
        // {
        //     "name": "Ледяная игла",
        //     "element": "water",
        //     "shape": "",
        //     "emotion": "",
        //     "level": 1,
        //     "Тип": "Атакующий",
        //     "actionType": "melee",
        //     "range": 1,
        //     "baseDamage": 28,
        //     "hitChance": 85,
        //     "calcDamage": "25,5",
        //     "critChance": 10,
        //     "effects": [
        //         // {
        //         //     "effect": "freeze",
        //         //     "chance": 0.2,
        //         //     "duration": 1
        //         // }
        //     ],
        //     "": ""
        // },
        // {
        //     "name": "Смертельный удар",
        //     "element": "",
        //     "shape": "",
        //     "emotion": "passion",
        //     "level": 2,
        //     "Тип": "Атакующий",
        //     "actionType": "ranged",
        //     "range": 15,
        //     "baseDamage": 35,
        //     "hitChance": 85,
        //     "calcDamage": "38,25",
        //     "critChance": 5,
        //     "effects": [],
        //     "": ""
        // },
    ].map(a => {
        a.hitChance /= 100
        return a
    })

    passion.actions = [passion.actions[Math.floor(Math.random() * 3)]]

    rage.name = 'rage'
    hope.name = 'hope'
    hope.maxHealthStat = 1
    passion2.name = 'passion2'
    passion.name = 'passion'

    rage.texture = 'Pink_Monster'
    passion.texture = 'Dude_Monster'
    passion2.texture = 'Dude_Monster'
    hope.texture = 'Owlet_Monster'

    // rage.position = getPositions('left')[0]
    passion2.position = getPositions('left')[0]
    hope.position = getPositions('left')[1]
    passion.position = getPositions('right')[0]

    rage.id = 1
    passion2.id = 2
    hope.id = 3
    passion.id = 4

    return [
        ...getTeam2('left', 'player', [passion2]),
        ...getTeam2('right', 'player', [passion])
    ]
}

// Тест 1: Базовый урон (ДД vs Танк)
export function testEffects(effect, chanceEffect, duration) {
    const rage1 = Object.assign({}, creaturesLib['fire' + '-' + 'beast' + '-' + 'rage' + '-' + 'common']);
    const rage2 = Object.assign({}, creaturesLib['fire' + '-' + 'beast' + '-' + 'rage' + '-' + 'common']);
    rage1.actions = [
        {
            "name": "Свирепый укус с эффектом",
            "element": "",
            "shape": "beast",
            "emotion": "",
            "level": 1,
            "Тип": "Атакующий",
            "actionType": "melee",
            "range": 1,
            "baseDamage": 30,
            "hitChance": 90,
            "critChance": 12,
            "effects": [],
            "": ""
        },
    ].map(a => {
        a.hitChance /= 100
        return a
    })
    rage2.actions = [
        {
            "name": "Свирепый укус без эффекта",
            "element": "",
            "shape": "beast",
            "emotion": "",
            "level": 1,
            "Тип": "Атакующий",
            "actionType": "melee",
            "range": 1,
            "baseDamage": 30,
            "hitChance": 90,
            "critChance": 12,
            "effects": [
                // {
                //     "effect": "bleed",
                //     "chance": 0.3,
                //     "duration": 3
                // }
            ],
            "": ""
        },
    ].map(a => {
        a.hitChance /= 100
        return a
    })

    rage1.name = 'rage1'
    rage2.name = 'rage2'

    rage1.texture = 'Pink_Monster'
    rage2.texture = 'Pink_Monster'

    rage1.position = getPositions('right')[0]
    rage2.position = getPositions('left')[0]

    rage1.id = 1
    rage2.id = 4

    if (Math.random() < chanceEffect) {
        rage1.effects = [{
            "effect": effect,
            "duration": duration
        }]
    }

    // rage1.actions[0].effects = [{
    //     "effect": effect,
    //     "chance": chanceEffect,
    //     "duration": duration
    // }]

    return [
        ...getTeam2('left', new EasyAI(), [rage2]),
        ...getTeam2('right', new EasyAI(), [rage1])
    ]
}