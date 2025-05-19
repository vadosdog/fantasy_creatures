import {EventBus} from '../EventBus';
import {Scene} from 'phaser';
import Hexagon, {
    HEX_STATE_ATTACKABLE,
    HEX_STATE_MOVABLE,
    HEX_STATE_NORMAL,
    HEX_STATE_SELECTED, HEX_STATE_TREATABLE,
    HEXAGON_ANIM_GREEN,
    HEXAGON_ANIM_GREY,
    HEXAGON_ANIM_LIGHT_GREEN,
    HEXAGON_ANIM_LIGHT_RED,
    HEXAGON_ANIM_LIGHT_YELLOW,
    HEXAGON_ANIM_NORMAL,
    HEXAGON_ANIM_RED,
    HEXAGON_ANIM_YELLOW
} from "../sprites/battle/Hexagon.js";
import MonsterContainer from "../sprites/creatures/MonsterContainer.js";
import {
    BATTLE_STATE_BATTLE_OVER_LOSE,
    BATTLE_STATE_BATTLE_OVER_WIN,
    BATTLE_STATE_PLAYER_TURN,
    BATTLE_STATE_WAITING,
    useBattleStore
} from "../../store/battle.js";

export class Battle extends Scene {
    showGridIndexes = false
    hexagonGroup;
    store
    hexagonsArray;
    buttons = []
    selectedAction

    constructor() {
        super('Battle');
        this.store = useBattleStore()
        this.hexagonsArray = new Map()
    }

    create() {
        this.store.load()

        this.createAnims()
        this.createBackground()
        this.createBattleField()
        //
        this.handleStep()

        EventBus.emit('current-scene-ready', this);
    }

    createAnims() {
        this.anims.create({
            key: HEXAGON_ANIM_NORMAL,
            frames: [{key: 'hexagon', frame: 0}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_LIGHT_YELLOW,
            frames: [{key: 'hexagon', frame: 1}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_LIGHT_RED,
            frames: [{key: 'hexagon', frame: 2}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_LIGHT_GREEN,
            frames: [{key: 'hexagon', frame: 3}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_YELLOW,
            frames: [{key: 'hexagon', frame: 4}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_RED,
            frames: [{key: 'hexagon', frame: 5}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_GREEN,
            frames: [{key: 'hexagon', frame: 6}],
        });
        this.anims.create({
            key: HEXAGON_ANIM_GREY,
            frames: [{key: 'hexagon', frame: 7}],
        });
    }

    createBackground() {
        let scaleX = 1
        let scaleY = 1
        let scale = 1
        // Battleground
        let battleground = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'battle-background-1-battleground'
        );
        scaleX = this.cameras.main.width / battleground.width
        scaleY = this.cameras.main.height / battleground.height
        scale = Math.max(scaleX, scaleY)
        battleground.setScale(scale).setScrollFactor(0)

        // Back land

        // Battleground
        let backLand = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3,
            'battle-background-1-back_land'
        );
        scaleX = this.cameras.main.width / backLand.width
        scaleY = this.cameras.main.height / backLand.height / 2
        scale = Math.max(scaleX, scaleY)
        backLand.setScale(scale).setScrollFactor(0)
    }

    createBattleField() {
        // Рамки в которые вписывается поле
        let startX = 50
        let startY = 200
        let endX = this.cameras.main.width - startX // одинаково от краев
        let endY = this.cameras.main.height - 50 // снизу не также как сверху

        // Размер ячеек по горизонтали зависит от количества, которое необходимо вписать
        // Если количество ячеек четное, то учитывается, что последняя идет со смещением в пол радиуса
        let hexagonWidth = (endX - startX) / (Math.floor(this.store.gridSizeX / 2) + ((this.store.gridSizeX) % 2 === 0 ? 0.5 : 1))
        let hexagonT = hexagonWidth / 2 // вспомогательная переменная, сторона 6 угольника

        // Радиус вписанной в шестиугольник окружности r (половина ширины) по отношению 
        // к описанной вокруг шестиугольника окружности R (половина высота)
        // r = sqrt(3) * R / 2
        // Или R = r * 2 / sqrt(3)
        let hexagonHeight = hexagonWidth * 2 / Math.sqrt(3)

        this.hexagonGroup = this.add.group();

        this.store.battleMap.forEach((cell) => {
            let posX = cell.positionX
            let posY = cell.positionY
            let hexagonX = startX + hexagonWidth / 2 + hexagonWidth * posY / 2;
            let hexagonY = startY + hexagonHeight / 2
                // Если четный ряд (j нечетное), то смещаем ряд "под" предыдущий  
                + (posY % 2 === 1 ? (hexagonT + (hexagonHeight - hexagonT) / 2) : 0)
                // Каждый ряд смещается на высоту хекса + сторону
                + (hexagonHeight + hexagonT) * posX


            let hexagon = new Hexagon(this, hexagonX, hexagonY)
            this.hexagonGroup.add(hexagon)
            this.hexagonsArray.set(`${posX},${posY}`, hexagon)


            hexagon.on('pointerup', (...args) => {
                this.handleHexagonClick([posX, posY], hexagon, ...args)
            });

            let scaleX = hexagonWidth / (hexagon.width)
            let scaleY = hexagonHeight / (hexagon.height)
            hexagon.setScale(scaleX, scaleY).setScrollFactor(0)

            if (this.showGridIndexes) {
                let hexagonText = this.add.text(hexagonX - hexagonWidth / 4, hexagonY, posX + "," + posY);
                hexagonText.font = "arial";
                hexagonText.fontSize = 12;
                this.hexagonGroup.add(hexagonText);
            }

        })

        this.store.battleMap.forEach((cell) => {
            if (cell.content) {
                // в перспективе могут быть другие препятствия
                let creature = cell.content
                let hexagon = this.hexagonsArray.get(creature.position.join(','))

                creature.creatureSpriteContainer = new MonsterContainer(
                    creature,
                    this,
                    hexagon.x,
                    hexagon.y,
                )
                // this.store.creatures.add(creature)
                creature.creatureSpriteContainer.updateEffectsIcons()
            }
        })
    }

    handleStep() {
        this.hexagonsArray.forEach(hexagonSprite => {
            hexagonSprite.setHexState(HEX_STATE_NORMAL)
        })
        this.store.handleRound()
        let {activeCreature, availableActions, effects} = this.store.getTurn()
        // показывает произошедшие эффекты в начале раунда
        const timeline = this.add.timeline({});
        timeline.add({
            at: 0, //гомосятина
            run: () => {
                activeCreature.creatureSpriteContainer.setMonsterState('hurt_' + activeCreature.direction)
                activeCreature.creatureSpriteContainer.updateVisual()
            }
        })

        effects.forEach((effect, i) => {
            const emoji = {
                'regeneration': '💚',
                'poison': '☠️',
                'bleed': '💉',
                'burn': '🔥',
                'madness': '🤪',
            }[effect.type] || ''
            timeline.add({
                at: i * 200, //гомосятина
                run: () => {
                    activeCreature.creatureSpriteContainer.playActionText(emoji + " " + effect.damage, effect.damage > 0 ? 'green' : 'red')
                }
            })
        })
        if (activeCreature.health <= 0) {
            timeline.add({
                at: 200 * (effects.length), //гомосятина
                run: () => {
                    activeCreature.creatureSpriteContainer.setMonsterState('death_' + activeCreature.direction)
                    activeCreature.creatureSpriteContainer.updateVisual()
                }
            });
            timeline.add({
                at: 200 * (effects.length + 1) + 500, //гомосятина
                run: () => {
                    activeCreature.creatureSpriteContainer.destroy(true)
                    this.hexagonsArray.get(activeCreature.position.join(',')).content = null
                }
            });
        } else {
            timeline.add({
                at: 200 * (effects.length), //гомосятина
                run: () => {
                    activeCreature.creatureSpriteContainer.setMonsterState('idle_' + activeCreature.direction)
                }
            });
        }

        timeline.on('complete', () => {
            if (activeCreature.health <= 0) {
                this.store.endOfRound();
                if (
                    this.store.state === BATTLE_STATE_BATTLE_OVER_WIN
                    || this.store.state === BATTLE_STATE_BATTLE_OVER_LOSE
                ) {

                    return this.scene.start('BattleOver');
                }
                this.handleStep()
            } else {
                let activeHexagonSprite = this.hexagonsArray.get(`${activeCreature.position[0]},${activeCreature.position[1]}`)

                activeHexagonSprite.setHexState(HEX_STATE_SELECTED)
                if (this.store.battleState === BATTLE_STATE_PLAYER_TURN) {
                    this.showButtons()

                    this.markActionAvailableHexs(false)
                } else {
                    if (availableActions.length === 0) {
                        this.scene.start('BattleOver');
                        return
                    }
                    this.handleAction(availableActions[0].action, availableActions[0].targets)
                }
            }
        })
        timeline.play()
    }

    markActionAvailableHexs(reset = true) {
        if (reset) {
            this.hexagonsArray.forEach(hexagonSprite => {
                if (
                    hexagonSprite.hexState === HEX_STATE_ATTACKABLE
                    || hexagonSprite.hexState === HEX_STATE_TREATABLE
                ) {
                    hexagonSprite.setHexState(HEX_STATE_NORMAL)
                }
            })
        }

        this.store.availableActions.forEach(({action, actionObject, targets}) => {
            if (action === 'move') {
                targets.forEach(([x, y]) => {
                    let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                    hexagonSprite.setHexState(HEX_STATE_MOVABLE)
                })
                return
            }
            if (this.selectedAction.action.name !== actionObject.name) {
                return
            }

            targets.forEach(([x, y]) => {
                let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                hexagonSprite.setHexState(action === 'attack' ? HEX_STATE_ATTACKABLE : HEX_STATE_TREATABLE)
            })
        })
    }

    handleHexagonClick(position, hexagonSprite, args) {
        if (this.store.battleState !== BATTLE_STATE_PLAYER_TURN) {
            return
        }

        const targets = new Map
        this.store.availableActions.forEach((action) => {
            if (action.action !== 'move' && this.selectedAction.action.name !== action.actionObject.name) {
                return
            }
            action.targets.forEach(target => {
                targets.set(target.join(','), action)
            })
        })

        if (!targets.has(position.join(','))) {
            return
        }

        const action = targets.get(position.join(','))
        this.handleAction(action, position)
    }

    handleAction(action, position) {
        this.store.setBattleState(BATTLE_STATE_WAITING)

        const timeline = this.add.timeline({});
        const targetCreature = this.store.getCreatureByCoords(position)
        let path = []
        switch (action.action) {
            case 'move':
                // Получаем путь от текущей позиции персонажа до выбранной клетки
                path = this.findPath(this.store.activeCreature.position, position);
                if (!path || path.length === 0) return;

                this.store.playerActionMoveTo(path)
                this.moveCreatureAlongPath(timeline, this.store.activeCreature, path)

                // надо бы в одном место выделить
                timeline.add({
                    at: 200 * (path.length), //гомосятина
                    run: () => {
                        this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                    }
                });
                break
            case 'attack':
                let attackResult
                if (!targetCreature) {
                    return
                }

                let timelineStart = 0
                // для ближний атак, нужно еще перемещение
                if (action.actionObject.actionType === 'melee') {
                    // Получаем путь от текущей позиции персонажа до выбранной клетки
                    path = this.findPath(this.store.activeCreature.position, position);
                    if (!path || path.length === 0) return;
                    path = path.slice(0, path.length - 1)

                    if (path.length > 1) {
                        attackResult = this.store.playerActionMoveAndAttack(path, position, action.actionObject)
                        this.moveCreatureAlongPath(timeline, this.store.activeCreature, path)
                    } else {
                        attackResult = this.store.playerActionAttack(position, action.actionObject)
                    }
                } else {
                    attackResult = this.store.playerActionAttack(position, action.actionObject)
                }


                timeline.add({
                    at: 200 * (path.length), //гомосятина
                    run: () => {
                        let attackDirection = this.store.activeCreature.position[1] < position[1]
                            ? 'attack_right'
                            : 'attack_left'
                        this.store.activeCreature.creatureSpriteContainer.setMonsterState(attackDirection)
                    }
                });

                // надо бы в одном место выделить
                timeline.add({
                    at: 200 * (path.length) + 500, //гомосятина
                    run: () => {
                        this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                    }
                });


                let defenseDirection = this.store.activeCreature.position[1] < position[1]
                    ? 'left'
                    : 'right'
                if (attackResult.success) {
                    timeline.add({
                        at: 200 * (path.length), //гомосятина
                        run: () => {
                            targetCreature.creatureSpriteContainer.setMonsterState('hurt_' + defenseDirection)
                            targetCreature.creatureSpriteContainer.updateVisual()
                            targetCreature.creatureSpriteContainer.playActionText("-" + attackResult.damage, 'red')
                            targetCreature.creatureSpriteContainer.updateEffectsIcons()
                            this.store.activeCreature.creatureSpriteContainer.updateEffectsIcons()
                        }
                    });
                    if (targetCreature.health) {
                        timeline.add({
                            at: 200 * (path.length) + 500, //гомосятина
                            run: () => {
                                targetCreature.creatureSpriteContainer.setDefaultState()
                            }
                        });
                    } else {
                        timeline.add({
                            at: 200 * (path.length) + 500, //гомосятина
                            run: () => {
                                targetCreature.creatureSpriteContainer.setMonsterState('death_' + defenseDirection)
                                targetCreature.creatureSpriteContainer.updateVisual()
                            }
                        });
                        timeline.add({
                            at: 200 * (path.length + 1) + 1000, //гомосятина
                            run: () => {
                                targetCreature.creatureSpriteContainer.destroy(true)
                                this.hexagonsArray.get(targetCreature.position.join(',')).content = null
                            }
                        });
                    }
                } else {
                    timeline.add({
                        at: 200 * (path.length), //гомосятина
                        run: () => {
                            targetCreature.creatureSpriteContainer.playActionText("Промах...", 'red')
                        }
                    });
                }

                break
            case 'treat':
                let treatResult
                if (!targetCreature) {
                    return
                }
                treatResult = this.store.playerActionTreat(position, action.actionObject)

                timeline.add({
                    at: 200 * (path.length), //гомосятина
                    run: () => {
                        let attackDirection = this.store.activeCreature.position[1] < position[1]
                            ? 'attack_right'
                            : 'attack_left'
                        this.store.activeCreature.creatureSpriteContainer.setMonsterState(attackDirection) //сделать анимацию treat
                    }
                });
                // надо бы в одном место выделить
                timeline.add({
                    at: 200 * (path.length) + 500, //гомосятина
                    run: () => {
                        this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                    }
                });
                let treatedDirection = this.store.activeCreature.position[1] < position[1]
                    ? 'left'
                    : 'right'

                if (treatResult.success) {
                    timeline.add({
                        at: 200 * (path.length), //гомосятина
                        run: () => {
                            targetCreature.creatureSpriteContainer.setMonsterState('hurt_' + treatedDirection)
                            targetCreature.creatureSpriteContainer.updateVisual()
                            targetCreature.creatureSpriteContainer.playActionText("+" + treatResult.damage, 'green')
                            targetCreature.creatureSpriteContainer.updateEffectsIcons()
                            this.store.activeCreature.creatureSpriteContainer.updateEffectsIcons()
                        }
                    });
                    timeline.add({
                        at: 200 * (path.length) + 500,
                        run: () => {
                            targetCreature.creatureSpriteContainer.setDefaultState()
                        }
                    });
                } else {
                    timeline.add({
                        at: 200 * (path.length), //гомосятина
                        run: () => {
                            targetCreature.creatureSpriteContainer.playActionText("Промах...", 'green')
                        }
                    });
                }
                break;
            default:
                // неизвестное действие
                return
        }


        timeline.on('complete', () => {
            this.store.endOfRound();
            this.store.activeCreature.creatureSpriteContainer.updateEffectsIcons()
            if (
                this.store.state === BATTLE_STATE_BATTLE_OVER_WIN
                || this.store.state === BATTLE_STATE_BATTLE_OVER_LOSE
            ) {

                return this.scene.start('BattleOver');
            }
            this.handleStep()
        })
        timeline.play()
    }

    moveCreatureAlongPath(timeline, activeCreature, path) {
        if (path.length < 2) return;

        const segmentDuration = 200;

        for (let i = 1; i < path.length; i++) {
            const [x, y] = path[i];
            const key = `${x},${y}`;
            const cellSprite = this.hexagonsArray.get(`${x},${y}`);
            if (!cellSprite) continue;

            let direction = path[i - 1][1] < y ? 'walk_right' : 'walk_left'
            timeline.add({
                at: i * segmentDuration,
                run: () => activeCreature.creatureSpriteContainer.setMonsterState(direction)
            });
            timeline.add({
                at: i * segmentDuration,
                tween: {
                    targets: activeCreature.creatureSpriteContainer,
                    x: cellSprite.x,
                    y: cellSprite.y,
                    duration: segmentDuration,
                    ease: 'Linear'
                }
            });
        }
        timeline.add({
            at: (path.length) * segmentDuration,
            run: () => {
                const lastPos = path[path.length - 1];
                activeCreature.position[0] = lastPos[0];
                activeCreature.position[1] = lastPos[1];
            }
        })

        return timeline
    }

    getDirections(position) {
        return [
            [0, -2], //влево
            position[1] % 2 ? [0, -1] : [-1, -1], //лево вверх
            position[1] % 2 ? [0, 1] : [-1, 1], //право вверх
            [0, 2], //право
            position[1] % 2 ? [1, 1] : [0, 1], //право вниз
            position[1] % 2 ? [1, -1] : [0, -1], //лево вниз
        ]
    }

    findPath(start, end) {
        let obstacles = new Set()

        this.store.creatures.forEach(item => {
            let obstaclePosition = item.position.join(',')
            // исключаем стартовые и конченые точки, тк они обязательно должны быть проходимые
            if (
                obstaclePosition === start.join(',')
                || obstaclePosition === end.join(',')
            ) {
                return
            }
            obstacles.add(obstaclePosition)
        })
        return this.store.battleMap.findPath(start, end, obstacles)
        // Плохо что есть две разные точки поиска пути, надобы объеденить

        if (!start || !end) {
            throw new Error("Start or end point not found.");
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
                    this.hexagonsArray.has(`${newX},${newY}`) &&
                    !visited.has(newKey) &&
                    !obstacles.has(newKey)
                ) {
                    queue.push([newX, newY, newPath]);
                }
            }
        }

        throw new Error("No path found.");
    }

    update(time, delta) {
    }

    showButtons() {

        this.store.activeCreature.getActions().forEach((action, i) => {
            // Создаем элементы кнопки
            const buttonBg = this.add.rectangle(0, 0, 200, 150, 0x3e5a4d)
                .setOrigin(0, 0)
                .setInteractive();

            const effects = (action.effects || []).map(effect => effect.type).join(', ')
            const buttonTexts = [
                this.add.text(20, 20, action.name, {fontFamily: "arial", fontSize: "14px"}).setOrigin(0, 0),
                this.add.text(20, 40, 'Стихия: ' + action.element, {
                    fontFamily: "arial",
                    fontSize: "12px"
                }).setOrigin(0, 0),
                this.add.text(20, 60, 'Тип атаки: ' + action.actionType + (action.actionType === 'ranged' ? ' (' + action.range + ')' : ''), {
                    fontFamily: "arial",
                    fontSize: "12px"
                }).setOrigin(0, 0),
                this.add.text(20, 80, 'Шанс (крит): ' + action.hitChance + ' (' + (action.critChance || 0) + ')', {
                    fontFamily: "arial",
                    fontSize: "12px"
                }).setOrigin(0, 0),
                this.add.text(20, 100, 'Базовый урон: ' + action.baseDamage, {
                    fontFamily: "arial",
                    fontSize: "12px"
                }).setOrigin(0, 0),
                this.add.text(20, 120, 'Эффекты: ' + effects, {
                    fontFamily: "arial",
                    fontSize: "12px"
                }).setOrigin(0, 0)
            ];

            // Создаем контейнер для кнопки
            const buttonContainer = this.add.container(20 + i * 250, 20, [buttonBg, ...buttonTexts]);

            buttonContainer.action = action

            // Делаем весь контейнер интерактивным
            buttonContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 150), Phaser.Geom.Rectangle.Contains);

            // Сохраняем ссылку на background для удобства
            buttonContainer.buttonBg = buttonBg;
            buttonContainer.isActive = false;

            // Обработчики событий
            buttonBg.on('pointerover', () => {
                if (!buttonContainer.isActive) {
                    buttonBg.setFillStyle(0x5a7a6d); // Цвет при наведении
                }
            });

            buttonBg.on('pointerout', () => {
                if (!buttonContainer.isActive) {
                    buttonBg.setFillStyle(0x3e5a4d); // Исходный цвет
                }
            });

            buttonBg.on('pointerdown', () => {
                // Сбрасываем предыдущую активную кнопку
                if (this.selectedAction) {
                    this.selectedAction.buttonBg.setFillStyle(0x3e5a4d);
                    this.selectedAction.isActive = false;
                }

                // Устанавливаем новую активную кнопку
                this.selectedAction = buttonContainer;
                buttonContainer.isActive = true;
                buttonBg.setFillStyle(0x7a9a8d); // Цвет активной кнопки

                this.markActionAvailableHexs()
            });

            // устанавливаем первой активность по умолчанию
            if (i === 0) {
                // Устанавливаем новую активную кнопку
                this.selectedAction = buttonContainer;
                buttonContainer.isActive = true;
                buttonBg.setFillStyle(0x7a9a8d); // Цвет активной кнопки
            }
        });
    }

    hideButtons() {
        this.buttons.forEach(button => button.destroy())
        this.buttons = []
    }
}
