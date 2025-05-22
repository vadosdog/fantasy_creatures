import {Creature, CreatureAction} from "./Creature.js";

const lib = [
    {
        id: 1,
        name: 'Огонь/Танк',
        texture: 'Pink_Monster',
        element: 'fire',
        role: 'tank',

        direction: 'right',


        maxHealthStat: 320,
        speedStat: 5,
        attackStat: 35,
        defenseStat: 65,
        initiativeStat: 35,
        willStat: 30,

        actions: [
            // Основная атака с поджигом
            {
                name: 'Раскалённый удар',
                element: 'fire',
                baseDamage: 28,
                hitChance: 0.9,
                critChance: 0.05,
                actionType: 'melee',
                range: 1,
                effects: [{effect: 'burn', chance: 0.8, duration: 2}]
            },
            // Защитный скилл
            {
                name: 'Щит пламени',
                element: 'fire',
                baseDamage: 0,
                hitChance: 1,
                actionType: 'treat',
                range: 0,
                effects: [{effect: 'aegis', chance: 1.0, duration: 3}]
            }
        ]
        ,
        // effects: [BaseEffect.getEffectObject({effect: 'curse', duration: 1})]
    },
// ], a = [

    {
        id: 2,
        name: 'ДД/Трава',
        texture: 'Dude_Monster',
        element: 'grass',
        role: 'dd',

        direction: 'right',


        maxHealthStat: 180, // 1=10 - 20
        speedStat: 12, // 5=1 - 25
        attackStat: 70, // 
        defenseStat: 25,
        initiativeStat: 55,
        willStat: 40,

        actions: [
            // Основная атака с ядом
            {
                name: 'Ядовитый укус',
                element: 'grass',
                baseDamage: 45,
                hitChance: 0.85,
                critChance: 0.1,
                actionType: 'melee',
                range: 1,
                effects: [{effect: 'poison', chance: 0.85, duration: 3}]
            },
            // Дальнобойная атака
            {
                name: 'Шторм листьев',
                element: 'grass',
                baseDamage: 38,
                hitChance: 0.9,
                critChance: 0.1,
                actionType: 'ranged',
                range: 30
            }
        ]
        ,
    },

    {
        id: 3,
        name: 'Сап/Вода',
        texture: 'Owlet_Monster',
        element: 'water',
        role: 'support',

        direction: 'right',


        maxHealthStat: 110,
        speedStat: 7,
        attackStat: 25,
        defenseStat: 45,
        initiativeStat: 50,
        willStat: 75,
        actions: [
            // Лечение + регенерация
            {
                name: 'Исцеляющий поток',
                element: 'water',
                baseDamage: 30,
                hitChance: 0.95,
                critChance: 0.2,
                actionType: 'treat',
                range: 4,
                effects: [{effect: 'regeneration', duration: 4}]
            },
            // Дебаф врага
            {
                name: 'Глубинный шёпот',
                element: 'water',
                baseDamage: 0,
                hitChance: 0.95,
                actionType: 'ranged',
                range: 5,
                effects: [{effect: 'blind', duration: 3}]
            }
        ]
        ,
        effects: []
    },

    {
        id: 4,
        name: 'Вода/Танк',
        texture: 'Pink_Monster',
        element: 'water',
        role: 'tank',

        direction: 'left',

        maxHealthStat: 310,
        speedStat: 6,
        attackStat: 30,
        defenseStat: 70,    // Высокая защита
        initiativeStat: 40,
        willStat: 35,

        actions: [
            // Атака с замедлением
            {
                name: 'Водяной таран',
                element: 'water',
                baseDamage: 25,
                hitChance: 0.92,
                critChance: 0.05,
                actionType: 'melee',
                range: 1,
                effects: [{effect: 'chill', chance: 0.85, duration: 2}]
            },
            // Защитный скилл
            {
                name: 'Кипящий щит',
                element: 'water',
                baseDamage: 0,
                hitChance: 1,
                actionType: 'treat',
                range: 0,
                effects: [{effect: 'aegis', duration: 3}]
            }
        ]
        ,
    },

    {
        id: 5,
        name: 'Огонь / ДД',
        texture: 'Dude_Monster',
        element: 'fire',
        role: 'dd',

        direction: 'left',

        maxHealthStat: 170,
        speedStat: 11,
        attackStat: 75,    // Очень высокий урон
        defenseStat: 20,
        initiativeStat: 60,
        willStat: 45,

        actions: [
            // Мощная атака с поджигом
            {
                name: 'Раскалённый клинок',
                element: 'fire',
                baseDamage: 50,
                hitChance: 0.8,
                critChance: 0.15,
                actionType: 'melee',
                range: 1,
                effects: [{effect: 'burn', chance: 0.9, duration: 3}]
            },
            // Дальнобойная атака
            {
                name: 'Огненная стрела',
                element: 'fire',
                baseDamage: 45,
                hitChance: 0.9,
                critChance: 0.1,
                actionType: 'ranged',
                range: 30
            }
        ]
        ,
    },

    {
        id: 6,
        name: 'Трава/САП',
        texture: 'Owlet_Monster',
        element: 'grass',
        role: 'support',

        direction: 'left',

        maxHealthStat: 120,
        speedStat: 6,
        attackStat: 30,
        defenseStat: 50,
        initiativeStat: 45,
        willStat: 70,
        actions: [
            // Лечение + баф
            {
                name: 'Целительный споры',
                element: 'grass',
                baseDamage: 35,
                hitChance: 0.9,
                critChance: 0.25,
                actionType: 'treat',
                range: 4,
                effects: [{effect: 'regeneration', duration: 5}]
            },
            // Дебаф врага
            {
                name: 'Проклятие листвы',
                element: 'grass',
                baseDamage: 0,
                hitChance: 0.9,
                actionType: 'ranged',
                range: 6,
                effects: [{effect: 'curse', duration: 5}]
            }
        ]
        ,
    }
]
let idIndex = 1

export function getTeam(direction, control, positions) {
    const result = []
    lib.forEach((config, i) => {
        const creature = new Creature(config)
        creature.id = idIndex++
        creature.actions = config.actions.map(action => new CreatureAction(action))
        creature.direction = direction
        creature.control = control
        creature.position = positions[i]
        result.push(creature)
    })

    return result
}