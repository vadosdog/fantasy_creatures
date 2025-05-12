import {defineStore} from 'pinia';
import {BattleMap} from "../game/classes/BattleMap.js";
import {Creature, CreatureAction} from "../game/classes/Creature.js";

export const BATTLE_STATE_PLAYER_TURN = 'PLAYER_TURN'
export const BATTLE_STATE_ENGINE_TURN = 'ENGINE_TURN'
export const BATTLE_STATE_WAITING = 'WAITING'
export const BATTLE_STATE_BATTLE_OVER_WIN = 'BATTLE_OVER_WIN'
export const BATTLE_STATE_BATTLE_OVER_LOSE = 'BATTLE_OVER_LOSE'

export const useBattleStore = defineStore('battle', {
    state: () => ({
        // Количество ячеек горизонтально (учитывая два ряда)
        gridSizeX: 31,
        // Количество ячеек вертикально (каждый ряд)
        gridSizeY: 11,
        creatures: new Set(),
        round: 0,
        queue: [
            //Pink_Monster
            //Dude_Monster
            //Owlet_Monster
            new Creature({
                name: 'Огонь/Танк',
                texture: 'Pink_Monster',
                element: 'fire',
                position: [1, 3],
                direction: 'right',
                control: 'player',

                maxHealthStat: 300,
                speedStat: 3,
                attackStat: 40,
                defenseStat: 60,
                initiativeStat: 30,
                willStat: 25,
                form: 70,
                mass: 80,

                actions: [
                    new CreatureAction({
                        name: 'Раскалённый удар',
                        element: 'fire',
                        baseDamage: 30,
                        hitChance: 0.85,
                        critChance: 0.05,
                        actionType: 'melee', // Ближняя атака
                        range: 1, // Дистанция 1 для ближней атаки
                        effects: [{type: 'burn', chance: 0.7, target: 'target', duration: 2}],
                    }),
                    new CreatureAction({
                        name: 'Таран',
                        element: 'normal',
                        baseDamage: 25,
                        hitChance: 0.9,
                        critChance: 0.00,
                        actionType: 'melee',
                        range: 1,
                        effects: [{type: 'chill', chance: 0.5, target: 'target', duration: 1}],
                    }),
                    new CreatureAction({
                        name: 'Щит пламени',
                        element: 'fire',
                        baseDamage: 0,
                        hitChance: 1,
                        critChance: 0,
                        actionType: 'treat',
                        range: 0, // Только на себя
                        effects: [{type: 'aegis', chance: 1.0, target: 'self', duration: 3}],
                    }),
                    new CreatureAction({
                        name: 'Грозный рёв',
                        element: 'normal',
                        baseDamage: 0,
                        hitChance: 1,
                        critChance: 0.00,
                        actionType: 'melee',
                        range: 1,
                        effects: [{type: 'fear', chance: 0.8, target: 'target', duration: 2}],
                    }),
                ],
            }),

            new Creature({
                name: 'ДД/Трава',
                texture: 'Dude_Monster',
                element: 'grass',
                position: [3, 3],
                direction: 'right',
                control: 'player',

                maxHealthStat: 200,
                speedStat: 5,
                attackStat: 65,
                defenseStat: 30,
                initiativeStat: 50,
                willStat: 35,
                form: 50,
                mass: 60,

                actions: [
                    new CreatureAction({
                        name: 'Ядовитый укус',
                        element: 'grass',
                        baseDamage: 40,
                        hitChance: 0.8,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 1,
                        effects: [{type: 'poison', chance: 0.8, target: 'target', duration: 3}],
                    }),
                    new CreatureAction({
                        name: 'Шторм листьев',
                        element: 'grass',
                        baseDamage: 35,
                        hitChance: 0.95,
                        critChance: 0.05,
                        actionType: 'ranged', // Дальняя атака
                        range: 30, // Дистанция 3 клетки
                        effects: [{type: 'blind', chance: 0.6, target: 'target', duration: 2}],
                    }),
                    new CreatureAction({
                        name: 'Смертельный выстрел',
                        element: 'normal',
                        baseDamage: 50,
                        hitChance: 0.8,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 5,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Адреналин',
                        element: 'normal',
                        baseDamage: 0,
                        hitChance: 1,
                        critChance: 0,
                        actionType: 'treat', // Лечение
                        range: 0, // Себя
                        effects: [{type: 'empower', chance: 1.0, target: 'self', duration: 3}],
                    }),
                ],
            }),

            new Creature({
                name: 'Сап/Вода',
                texture: 'Owlet_Monster',
                element: 'water',
                position: [4, 4],
                direction: 'right',
                control: 'player',
                maxHealthStat: 90,
                speedStat: 4,
                attackStat: 30,
                defenseStat: 50,
                initiativeStat: 60,
                willStat: 70,
                form: 60,
                mass: 50,
                actions: [
                    // 1. Обычная атака с дебафом
                    new CreatureAction({
                        name: 'Удар прилива',
                        element: 'water',
                        baseDamage: 25,
                        hitChance: 0.9,
                        actionType: 'melee',
                        range: 1,
                        effects: [{type: 'chill', target: 'target', duration: 2}], // Замедление
                    }),
                    // 2. Дальний дебаф (без урона)
                    new CreatureAction({
                        name: 'Глубинный шёпот',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 0.95,
                        actionType: 'ranged',
                        range: 5,
                        effects: [{type: 'blind', target: 'target', duration: 3}], // Слепота
                    }),
                    // 3. Баф на союзника
                    new CreatureAction({
                        name: 'Щит волн',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 1.0,
                        actionType: 'treat',
                        range: 4,
                        effects: [{type: 'aegis', target: 'target', duration: 4}], // -10% урона
                    }),
                    // 4. Второй баф
                    new CreatureAction({
                        name: 'Исцеляющий поток',
                        element: 'water',
                        baseDamage: 25,
                        hitChance: 0.9,
                        critChance: 0.15,
                        actionType: 'treat',
                        range: 4,
                        effects: [{type: 'regeneration', target: 'target', duration: 5}], // +5% HP/ход
                    }),
                ],
                effects: []
            }),

            new Creature({
                name: 'Вода/Танк',
                texture: 'Pink_Monster',
                element: 'water',
                position: [1, 28],
                direction: 'left',
                control: 'player',

                maxHealthStat: 250,
                speedStat: 4,
                attackStat: 35,
                defenseStat: 55,
                initiativeStat: 45,
                willStat: 30,
                form: 60,
                mass: 50,

                actions: [
                    new CreatureAction({
                        name: 'Водяной таран',
                        element: 'water',
                        baseDamage: 28,
                        hitChance: 0.88,
                        critChance: 0.07,
                        actionType: 'melee',
                        range: 1,
                        effects: [{
                            type: 'chill',
                            chance: 0.8,
                            target: 'target',
                            duration: 2  // -1 скорость, -20% инициативы
                        }],
                    }),
                    new CreatureAction({
                        name: 'Удар прибоя',
                        element: 'water',
                        baseDamage: 25,
                        hitChance: 0.93,
                        critChance: 0.03,
                        actionType: 'melee',
                        range: 1,
                        effects: [{
                            type: 'fear',
                            chance: 0.6,
                            target: 'target',
                            duration: 1  // -15% атаки
                        }],
                    }),
                    new CreatureAction({
                        name: 'Кипящий щит',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 1,
                        critChance: 0.0,
                        actionType: 'treat',
                        range: 0, // На себя
                        effects: [{
                            type: 'aegis',
                            chance: 1.0,
                            target: 'self',
                            duration: 3  // +15% защиты
                        }],
                    }),
                    new CreatureAction({
                        name: 'Гул глубин',
                        element: 'water',
                        baseDamage: 0,
                        hitChance: 1,
                        critChance: 0.00,
                        actionType: 'melee',
                        range: 15,
                        effects: [{
                            type: 'fear',
                            chance: 0.7,
                            target: 'target',
                            duration: 2
                        }],
                    }),
                ],
            }),

            new Creature({
                name: 'Огонь / ДД',
                texture: 'Dude_Monster',
                element: 'fire',
                position: [3, 28],
                direction: 'left',
                control: 'player',

                maxHealthStat: 175,
                speedStat: 6,
                attackStat: 70,
                defenseStat: 25,
                initiativeStat: 65,
                willStat: 40,
                form: 55,
                mass: 45,

                actions: [
                    new CreatureAction({
                        name: 'Раскалённый клинок',
                        element: 'fire',
                        baseDamage: 45,
                        hitChance: 0.75,
                        critChance: 0.15,
                        actionType: 'melee',
                        range: 1, // Дальняя дистанция
                        effects: [{
                            type: 'burn',
                            chance: 0.9,
                            target: 'target',
                            duration: 3  // 7% урона за ход, -15% защиты
                        }],
                    }),
                    new CreatureAction({
                        name: 'Огненная стрела',
                        element: 'fire',
                        baseDamage: 50,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'melee',
                        range: 30,
                        effects: [],
                    }),
                    new CreatureAction({
                        name: 'Вулканический взрыв',
                        element: 'normal',
                        baseDamage: 35,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'ranged',
                        range: 30,
                        effects: [{
                            type: 'burn',
                            chance: 0.7,
                            target: 'target',
                            duration: 2
                        }],
                    }),
                    new CreatureAction({
                        name: 'Ярость пламени',
                        element: 'normal',
                        baseDamage: 0,
                        hitChance: 0.85,
                        critChance: 0.1,
                        actionType: 'treat',
                        range: 0, //на себя
                        effects: [{
                            type: 'empower',
                            chance: 1.0,
                            target: 'self',
                            duration: 3  // +30% к атаке
                        }],
                    }),
                ],
            }),

            new Creature({
                name: 'Трава/САП',
                texture: 'Owlet_Monster',
                element: 'grass',
                position: [4, 28],
                direction: 'left',
                control: 'player',
                maxHealthStat: 100,
                speedStat: 3,
                attackStat: 35,
                defenseStat: 55,
                initiativeStat: 40,
                willStat: 65,
                form: 80,
                mass: 70,
                actions: [
                    // 1. Обычная атака с дебафом
                    new CreatureAction({
                        name: 'Ядовитые шипы',
                        element: 'grass',
                        baseDamage: 20,
                        hitChance: 0.85,
                        actionType: 'ranged',
                        range: 15,
                        effects: [{type: 'poison', target: 'target', duration: 3}], // Яд
                    }),
                    // 2. Дальний дебаф (без урона)
                    new CreatureAction({
                        name: 'Проклятие листвы',
                        element: 'grass',
                        baseDamage: 0,
                        hitChance: 0.9,
                        actionType: 'ranged',
                        range: 6,
                        effects: [{type: 'curse', target: 'target', duration: 'permanent'}], // -20% max HP
                    }),
                    // 3. Баф на союзника
                    new CreatureAction({
                        name: 'Благословение роста',
                        element: 'grass',
                        baseDamage: 0,
                        hitChance: 1.0,
                        actionType: 'treat',
                        range: 4,
                        effects: [{type: 'empower', target: 'target', duration: 4}], // +X к атаке
                    }),
                    // 4. Второй баф
                    new CreatureAction({
                        name: 'Целительный споры',
                        element: 'grass',
                        baseDamage: 20,
                        hitChance: 0.8,
                        actionType: 'treat',
                        critChance: 0.2,
                        range: 3,
                        effects: [{type: 'regeneration', target: 'target', duration: 5}], // +5% HP/ход
                    }),
                ],
            })
        ],
        battleState: BATTLE_STATE_WAITING,
        battleMap: undefined,
        activeCreature: undefined,
        availableActions: [],
    }),
    getters: {},
    actions: {
        load() {
            const contents = new Map()
            this.queue.forEach(creature => {
                contents.set(creature.position.join(','), creature)
            })
            this.battleMap = BattleMap.create(this.gridSizeX, this.gridSizeY, contents)
        },
        handleRound() {
            this.activeCreature = this.queue[this.round % this.queue.length]

            this.availableActions = []

            // переделать на что-то другое
            if (this.activeCreature.control === 'player') {
                this.handlePlayerTurn()
                this.setBattleState(BATTLE_STATE_PLAYER_TURN)
            } else {
                this.handleEngineTurn()
                this.setBattleState(BATTLE_STATE_ENGINE_TURN)
            }
        },
        handlePlayerTurn() {
            const activeCreature = this.activeCreature
            const moveable = this.getMoveablePositions(activeCreature)
            if (moveable.length) {
                this.availableActions.push({
                    action: 'move',
                    targets: moveable,
                })
            }

            activeCreature.getActions().forEach(action => {
                const actionTargets = []
                this.creatures.forEach(creature => {
                    if (action.actionType === 'treat'
                        ? creature.direction !== activeCreature.direction
                        : creature.direction === activeCreature.direction
                    ) {
                        return
                    }

                    if (creature.health <= 0) {
                        return
                    }

                    let pathLength = this.findPath(activeCreature.position, creature.position).length
                    // if (pathLength === 0) {
                    //     return;
                    // }

                    let pathLimit = activeCreature.getSpeed()
                    if (action.actionType !== 'melee') {
                        pathLimit = action.range
                    }
                    if ((pathLength - 1) > pathLimit) {
                        return
                    }

                    actionTargets.push(creature.position)
                })

                if (actionTargets.length > 0) {
                    this.availableActions.push({
                        action: action.actionType === 'treat' ? 'treat' : 'attack', //как будто должно быть actionType
                        actionObject: action, //а тут просто action
                        targets: actionTargets,
                    })

                }
            })
        },
        handleEngineTurn() {
            //Выбор всех активных врагов
            let enemies = []
            this.creatures.forEach(creature => {
                if (creature.direction === this.activeCreature.direction
                    || creature.health <= 0) {
                    return false
                }

                enemies.push(creature)
            });

            // Если врагов не осталось, то ничего не приходится делать
            if (enemies.length === 0) {
                return
            }

            // Ищем ближайшего противника, если таких несколько, то того у кого меньше ХП
            let path = this.findPath(this.activeCreature.position, enemies[0].position)
            let target = enemies[0].position

            for (let i = 0; i < enemies.length; i++) {
                if (i === 0) continue
                let newPath = this.findPath(this.activeCreature.position, enemies[i].position)
                if (
                    newPath.length < path.length
                    || enemies[i].health < target.health
                ) {
                    path = newPath
                    target = enemies[i].position
                }
            }

            // Если можем дойти до цели, то атакуем ее
            if ((path.length - 1) <= this.activeCreature.speed) {
                this.availableActions.push(
                    {
                        action: 'attack',
                        targets: target,
                    })
            }
            // в противном случае идем к цели
            else {
                this.availableActions.push({
                    action: 'move',
                    targets: path[this.activeCreature.speed - 1],
                })
            }
        },
        setBattleState(battleState) {
            this.battleState = battleState
        },
        endOfRound() {
            this.activeCreature.removeRoundEffects()
            this.checkBattleOver()
            this.round++
        },
        checkBattleOver() {
            let sideA = 0
            let sideB = 0
            this.creatures.forEach(creature => {
                if (creature.health <= 0) {
                    return
                }

                if (creature.direction === 'right') {
                    sideA++
                } else {
                    sideB++
                }
            })

            if (sideA === 0) {
                this.setBattleState(BATTLE_STATE_BATTLE_OVER_LOSE)
            } else if (sideB === 0) {
                this.setBattleState(BATTLE_STATE_BATTLE_OVER_WIN)
            }
        },
        getTurn() {
            const effects = this.activeCreature.applyRoundEffects()

            if (this.activeCreature.health <= 0) {
                this.activeCreature.health = 0
                // гомосятина переделать
                let targetIndex = this.queue.findIndex(c => c === this.activeCreature)
                this.queue.splice(targetIndex, 1)
                this.battleMap.removeContent(...this.activeCreature.position)
                targetIndex = this.queue.findIndex(c => c === this.activeCreature)
                this.round = targetIndex
            }
            
            return {
                activeCreature: this.activeCreature,
                availableActions: this.availableActions,
                effects: effects,
            }
        },
        getMoveablePositions(activeCreature) {
            let start = activeCreature.position
            let speed = activeCreature.getSpeed()
            const visited = new Set();
            let currentPositions = [start];
            visited.add(start.join(','));

            for (let s = 0; s < speed; s++) {
                const nextPositions = [];

                for (const pos of currentPositions) {
                    const directions = this.getDirections(pos);

                    for (const [dx, dy] of directions) {
                        const newX = pos[0] + dx;
                        const newY = pos[1] + dy;
                        const key = `${newX},${newY}`;

                        if (
                            newX >= 0 &&
                            newY >= 0 &&
                            this.battleMap.hasByCoords(newX, newY) &&
                            !visited.has(key) &&
                            this.battleMap.isMovable(newX, newY)
                        ) {
                            visited.add(key);
                            nextPositions.push([newX, newY]);
                        }
                    }
                }

                currentPositions.push(...nextPositions);
                if (currentPositions.length === 0) break; // нет куда идти дальше
            }

            // убираем стартовую позицию, тк туда перемещаться и не надо
            currentPositions.shift()
            return currentPositions;
        },
        getDirections(position) {
            return [
                [0, -2], //влево
                position[1] % 2 ? [0, -1] : [-1, -1], //лево вверх
                position[1] % 2 ? [0, 1] : [-1, 1], //право вверх
                [0, 2], //право
                position[1] % 2 ? [1, 1] : [0, 1], //право вниз
                position[1] % 2 ? [1, -1] : [0, -1], //лево вниз
            ]
        },
        findPath(start, end) {
            // Плохо что есть две разные точки поиска пути, надобы объеденить

            if (!start || !end) {
                return []
            }

            // Очередь для BFS: элементы вида [x, y, path]
            const queue = [];
            queue.push([start[0], start[1], []]);

            const visited = new Set();

            while (queue.length > 0) {
                const [x, y, path] = queue.shift();
                const key = `${x},${y}`;
                if (visited.has(key)) continue;
                visited.add(key);

                const newPath = path.concat([[x, y]]);

                if (x === end[0] && y === end[1]) {
                    return newPath;
                }

                const directions = this.getDirections([x, y]);
                for (const [dx, dy] of directions) {
                    const newX = x + dx;
                    const newY = y + dy;
                    const newKey = `${newX},${newY}`;

                    if (
                        newX >= 0 &&
                        newY >= 0 &&
                        this.battleMap.has(`${newX},${newY}`) &&
                        !visited.has(newKey)
                    ) {
                        queue.push([newX, newY, newPath]);
                    }
                }
            }

            return []
        },
        playerActionMoveTo(path) {
            this.battleMap.removeContent(...this.activeCreature.position)
            this.activeCreature.position = path[path.length - 1]
            this.battleMap.setContent(...path[path.length - 1], this.activeCreature)
        },
        playerActionAttack(targetPosition, attack) {
            const result = {
                attack: attack.name,
                success: false,
                damage: 0,
                health: 0,
                hitChance: 0,
                isCrit: 0,
            }
            const attacker = this.activeCreature
            const defender = this.getCreatureByCoords(targetPosition)
            if (!defender) {
                return
            }


            // Расчёт шанса попадания
            const hitChance = Phaser.Math.Clamp(
                attack.hitChance
                + (attacker.getInitiative() - defender.getInitiative()) / 100
                - (attacker.getForm() - defender.getForm()) / 100,
                0.05, // всегда есть шанс на поподание
                0.99 // всегда есть шанс на промах
            );
            result.hitChance = hitChance
            const isCrit = Math.random() < (attack.critChance
                + (attacker.getWill() - defender.getWill()) / 100);

            const dice = Math.random()
            if (dice < hitChance) {
                result.success = true

                // считаем урон
                result.damage = Math.floor(attack.baseDamage
                    * (attacker.getAttack() / defender.getDefense())
                    * (1 + (attacker.mass - defender.mass) / 100)
                    * this.getElementMultiplier(attack.element, defender.element)
                    * (isCrit ? 1.15 : 1)
                )
                defender.health -= result.damage
            }


            if (defender.health <= 0) {
                defender.health = 0
                // гомосятина переделать
                let targetIndex = this.queue.findIndex(c => c === defender)
                this.queue.splice(targetIndex, 1)
                this.battleMap.removeContent(...defender.position)
                targetIndex = this.queue.findIndex(c => c === this.activeCreature)
                this.round = targetIndex
            }

            result.health = defender.health;

            if (!result.success) {
                return result
            }

            // накладываем эфекты
            (attack.effects || []).forEach(effect => {

                let chance = effect.chance
                if (effect.target === 'target') {
                    chance += (attacker.getWill() - defender.getWill()) / 100 // если цель - противник, то добавляем к шансу разницу воли
                }
                if (Math.random() > chance) {
                    console.log('Эфект не наложен')
                    return
                }

                if (effect.target === 'target') {
                    defender.pushEffect(effect)
                } else {
                    attacker.pushEffect(effect)
                }
            })

            return result
        },
        playerActionTreat(targetPosition, action) {
            const result = {
                attack: action.name,
                success: false,
                damage: 0,
                health: 0,
                hitChance: 0,
                isCrit: 0,
            }
            const treater = this.activeCreature
            const treated = this.getCreatureByCoords(targetPosition)
            if (!treated) {
                return
            }


            // Расчёт шанса попадания
            const hitChance = action.hitChance
                + (treater.getWill() - treated.getWill()) / 100;
            result.hitChance = hitChance
            const isCrit = Math.random() < (0.05 + treater.getWill() / 100);

            const dice = Math.random()
            if (dice < hitChance) {
                result.success = true

                // считаем урон
                result.damage = Math.floor(action.baseDamage
                    * (treater.getAttack() / treated.getDefense())
                    * (1 + (treater.mass - treated.mass) / 100)
                    * this.getElementMultiplier(action.element, treated.element)
                    * (isCrit ? 1.15 : 1)
                )
                treated.health += result.damage
                if (treated.health > treated.getMaxHealth()) {
                    treated.health = treated.getMaxHealth()
                }
            }

            result.health = treated.health;


            // накладываем эфекты
            (action.effects || []).forEach(effect => {

                let chance = effect.chance
                if (effect.target === 'target') {
                    chance += (treater.getWill() - treated.getWill()) / 100 // если цель - противник, то добавляем к шансу разницу воли
                }
                if (Math.random() > chance) {
                    console.log('Эфект не наложен')
                    return
                }

                if (effect.target === 'target') {
                    treated.pushEffect(effect)
                } else {
                    treater.pushEffect(effect)
                }
            })

            console.log(result)
            return result
        },
        playerActionMoveAndAttack(path, targetPosition, action) {
            this.playerActionMoveTo(path)
            return this.playerActionAttack(targetPosition, action)
        },
        getCreatureByCoords(position) {
            return this.battleMap.get(position.join(','))?.content
        },
        getElementMultiplier(attackElement, defenseElement) {
            const normal = 1
            const enlarged = 1.5
            const reduced = 0.75

            return {
                'fire->fire': reduced,
                'fire->water': reduced,
                'fire->grass': enlarged,
                'water->water': reduced,
                'water->fire': enlarged,
                'water->grass': reduced,
                'grass->grass': reduced,
                'grass->water': enlarged,
                'grass->fire': reduced,
            }[attackElement + '->' + defenseElement] || 1.0
        }
    },
});
