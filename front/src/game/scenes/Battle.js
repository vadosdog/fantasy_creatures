import {EventBus} from '../EventBus';
import {Scene} from 'phaser';
import {
    HEX_STATE_ATTACKABLE,
    HEX_STATE_MOVEABLE,
    HEX_STATE_NORMAL,
    HEX_STATE_SELECTED,
    HEX_STATE_TREATABLE,
} from "../classes/battle/HexTile.js";
import MonsterContainer from "../sprites/creatures/MonsterContainer.js";
import {
    BATTLE_STATE_BATTLE_OVER_LOSE,
    BATTLE_STATE_BATTLE_OVER_WIN,
    BATTLE_STATE_PLAYER_TURN,
    BATTLE_STATE_WAITING,
    useBattleStore
} from "../../store/battle.js";
import {CreatureAPI} from "../classes/battle/Creature.js";
import {watchEffect} from "vue";
import {useGameStore} from "../../store/game.js";
import {HexTile} from "../classes/battle/HexTile.js";
import Monster2Container from "../sprites/creatures/Monster2Container.js";

const gameStore = useGameStore()


export class Battle extends Scene {
    showGridIndexes = false
    hexagonGroup;
    store
    hexagonsArray;
    buttons = []
    selectedAction
    delayTurnModelOpened = false
    gameSpeed = 1
    currentAttack = {
        enemyId: null,
        direction: null,
        position: null
    };
    attackIndicator = null;
    hoveredCreature = null;

    constructor() {
        super('Battle');
        this.store = useBattleStore()
        this.hexagonsArray = new Map()
    }

    create() {
        this.cameras.main.setBounds(0, 0, 1024, 800);
        this.physics.world.setBounds(0, 0, 1024, 800);

        // Центрируйте камеру на поле боя
        this.cameras.main.centerOn(512, 400);

        // Обработчик изменения размера
        this.scale.on('resize', this.resize, this);

        this.store.load()

        this.createBackground()
        this.createBattleField()
        //
        this.handleStep()

        // Вызов resize после создания
        this.resize(this.scale.gameSize);

        EventBus.emit('current-scene-ready', this);

        watchEffect(() => {
            const id = gameStore.hoveredCreatureId;
            if (!id) {
                this.hoveredCreature = null
            }
            Object.entries(this.store.creatures).forEach(([key, creature]) => {
                if (!creature.creatureSpriteContainer) return;

                creature.creatureSpriteContainer.creatureSprite.setTint(creature.id === id ? 0xffff00 : 0xffffff);

                if (creature.id === id) {
                    this.hoveredCreature = creature
                }
            });
        });

        this.input.on('pointermove', this.handleAttackDirection.bind(this));
    }

    resize(gameSize) {
        if (!gameSize) return;

        // Рассчитайте масштаб для вписывания
        const scale = Math.min(
            gameSize.width / 1024,
            gameSize.height / 800
        );

        // Примените масштаб
        this.cameras.main.setZoom(scale);
        this.cameras.main.centerOn(gameSize.width / 2, gameSize.height / 2);
    }

    createBackground() {
        let battleground = this.add.image(512, 400, 'battle-background-1-battleground');
        battleground.setDisplaySize(1024, 800);

        let backLand = this.add.image(0, 0, 'battle-background-1-back_land')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        const scale = 1024 / backLand.width;
        backLand.setScale(scale);
    }

    createBattleField() {
        const hexGap = 2; // расстояние между гексами
        // Рамки в которые вписывается поле
        let startX = 50
        let startY = 200
        let endX = 1024 - startX // одинаково от краев
        let endY = 800 - 50 // снизу не также как сверху

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
            let hexagon = new HexTile(this, hexagonX, hexagonY, {
                width: hexagonWidth,
                orientation: 'pointy'
            }, posX, posY)
            this.hexagonGroup.add(hexagon)
            this.hexagonsArray.set(`${posX},${posY}`, hexagon)


            hexagon.on('pointerup', (...args) => {
                this.handleHexagonClick([posX, posY], hexagon, ...args)
            });

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

                // creature.creatureSpriteContainer = new MonsterContainer(
                //     creature,
                //     this,
                //     hexagon.x,
                //     hexagon.y,
                // )
                creature.creatureSpriteContainer = new Monster2Container(
                    creature,
                    this,
                    hexagon.x,
                    hexagon.y,
                )

                creature.creatureSpriteContainer.creatureSprite.on('pointerup', (...args) => {
                    this.handleHexagonClick(creature.position, hexagon, ...args)
                });

                // this.store.creatures.add(creature)
                creature.creatureSpriteContainer.updateEffectsIcons()

                // Устанавливаем связь существа с гексом
                hexagon.setCreature(creature.creatureSpriteContainer);
                // Сохраняем ссылку на родительский гекс
                creature.creatureSpriteContainer.parentHex = hexagon;
            }
        })
    }

    handleStep() {
        if (this.store.activeCreature) {
            this.store.activeCreature.creatureSpriteContainer.setMonsterActive(false)
        }
        this.clearAttackIndicator()
        // вообще кнопки надо скрывать в конце прошлого раунда
        this.hideButtons()
        this.hexagonsArray.forEach(hexagonSprite => {
            hexagonSprite.setHexState(HEX_STATE_NORMAL)
        })
        this.store.handleRound()

        let {activeCreature, availableActions, selectedActionId, effects} = this.store.getTurn()
        activeCreature.creatureSpriteContainer.setMonsterActive(true)
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
                'regen': '💚',
                'poison': '☠️',
                'bleed': '💉',
                'burn': '🔥',
                'freeze': '🥶',
                'madness': '🤪',
            }[effect.effect] || ''
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
                    const hex = this.hexagonsArray.get(activeCreature.position.join(','));
                    if (hex) hex.removeCreature(); // Убираем при уничтожении
                    activeCreature.creatureSpriteContainer.destroy(true);
                    if (hex) hex.content = null;
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
            if (availableActions.length === 0) {
                this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                this.store.endTurn()
                this.handleStep()
            } else if (activeCreature.health <= 0 || availableActions.length === 0) {
                if (
                    this.store.battleState === BATTLE_STATE_BATTLE_OVER_WIN
                    || this.store.battleState === BATTLE_STATE_BATTLE_OVER_LOSE
                ) {

                    return this.scene.start('BattleOver');
                }
                this.handleStep()
            } else {
                let activeHexagonSprite = this.hexagonsArray.get(`${activeCreature.position[0]},${activeCreature.position[1]}`)

                activeHexagonSprite.setHexState(HEX_STATE_SELECTED)
                if (this.store.battleState === BATTLE_STATE_PLAYER_TURN) {
                    this.selectActionOutside(selectedActionId)

                    this.markActionAvailableHexs(false)
                } else {
                    this.handleAction(availableActions[0], availableActions[0].targets)
                }
            }
        })
        this.timeLineBySpeed(timeline)
        timeline.play()
    }

    markActionAvailableHexs(reset = true) {
        if (reset) {
            this.hexagonsArray.forEach(hexagonSprite => {
                hexagonSprite.setHexState(HEX_STATE_NORMAL)
            })
        }

        this.store.availableActions.forEach(({action, actionObject, targets}) => {
            if (action === 'move') {
                targets.forEach(([x, y]) => {
                    let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                    hexagonSprite.setHexState(HEX_STATE_MOVEABLE)
                })
                return
            }

            if (!this.selectedAction) {
                return
            }

            if (this.selectedAction.action?.id !== actionObject.id) {
                return
            }

            targets.forEach(([x, y]) => {
                let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                hexagonSprite.setHexState(action === 'attack' ? HEX_STATE_ATTACKABLE : HEX_STATE_TREATABLE)
            })
        })
    }

    handleHexagonClick(position, hexagonSprite, args) {
        if (this.store.battleState !== BATTLE_STATE_PLAYER_TURN || this.delayTurnModelOpened) {
            return
        }

        const targets = new Map
        this.store.availableActions.forEach((action) => {
            if (action.action !== 'move' && this.selectedAction.action.id !== action.actionObject.id) {
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
        const result = this.handleAction(action, position)
        if (result === undefined) {
            this.store.battleState !== BATTLE_STATE_PLAYER_TURN
        }
    }

    handleAction(action, position) {
        const prevState = this.store.battleState
        this.store.setBattleState(BATTLE_STATE_WAITING)

        if (action.action === 'skip') {
            return this.handleDefenseAction()
        }

        const timeline = this.add.timeline({});
        const targetCreature = this.store.getCreatureByCoords(position)
        let path = []
        switch (action.action) {
            case 'move':
                // Получаем путь от текущей позиции персонажа до выбранной клетки
                path = this.findPath(this.store.activeCreature.position, position);
                if (!path || path.length === 0) {
                    this.store.setBattleState(prevState)
                    return;
                }

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
                    this.store.setBattleState(prevState)
                    return
                }

                if (action.actionObject.pp > this.store.activeCreature.pp || action.actionObject.currentCooldown > 0) {
                    this.store.setBattleState(prevState)
                    //навык недоступен
                    return
                }

                let timelineStart = 0
                // для ближний атак, нужно еще перемещение
                if (action.actionObject.actionType === 'melee') {
                    // Получаем путь от текущей позиции персонажа до выбранной клетки
                    path = this.findPath(this.store.activeCreature.position, this.currentAttack.position);
                    if (!path || path.length === 0) {
                        this.store.setBattleState(prevState)
                        return;
                    }

                    if (path.length > 1) {
                        attackResult = this.store.playerActionMoveAndAttack(path, position, action.actionObject)
                        this.moveCreatureAlongPath(timeline, this.store.activeCreature, path)
                    } else {
                        attackResult = this.store.playerActionAttack(position, action.actionObject)
                    }
                } else {
                    attackResult = this.store.playerActionAttack(position, action.actionObject)
                }


                let attackDirection = this.store.activeCreature.position[1] < position[1]
                    ? 'right'
                    : 'left'

                let defenseDirection = this.store.activeCreature.position[1] < position[1]
                    ? 'left'
                    : 'right'

                timeline.add({
                    at: 200 * (path.length), //гомосятина
                    run: () => {
                        this.store.activeCreature.creatureSpriteContainer.setMonsterState('attack_' + attackDirection)
                    }
                });

                // надо бы в одном место выделить
                timeline.add({
                    at: 200 * (path.length) + 500, //гомосятина
                    run: () => {
                        this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                    }
                });

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
                    if (attackResult.backDamage) {
                        timeline.add({
                            at: 200 * (path.length) + 500, //гомосятина
                            run: () => {
                                this.store.activeCreature.creatureSpriteContainer.setMonsterState('hurt_' + attackDirection)
                                this.store.activeCreature.creatureSpriteContainer.updateVisual()
                                this.store.activeCreature.creatureSpriteContainer.playActionText("-" + attackResult.backDamage, 'red')
                            }
                        });
                        if (this.store.activeCreature.health) {
                            timeline.add({
                                at: 200 * (path.length) + 1000, //гомосятина
                                run: () => {
                                    this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                                }
                            });
                        } else {
                            timeline.add({
                                at: 200 * (path.length) + 1000, //гомосятина
                                run: () => {
                                    this.store.activeCreature.creatureSpriteContainer.setMonsterState('death_' + attackDirection)
                                    this.store.activeCreature.creatureSpriteContainer.updateVisual()
                                }
                            });
                            timeline.add({
                                at: 200 * (path.length + 1) + 1500, //гомосятина
                                run: () => {
                                    this.store.activeCreature.creatureSpriteContainer.destroy(true)
                                    this.hexagonsArray.get(this.store.activeCreature.position.join(',')).content = null
                                }
                            });
                        }
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
                    this.store.setBattleState(prevState)
                    return
                }


                if (action.actionObject.pp > this.store.activeCreature.pp || action.actionObject.currentCooldown > 0) {
                    //навык недоступен
                    this.store.setBattleState(prevState)
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
            case 'skip':
                this.handleDefenseAction()
                break
            default:
                // неизвестное действие
                this.store.setBattleState(prevState)
                return
        }


        timeline.on('complete', () => {
            // Обновляем связь после действия
            const currentHex = this.hexagonsArray.get(
                this.store.activeCreature.position.join(',')
            );
            if (currentHex && this.store.activeCreature.health > 0) {
                currentHex.setCreature(this.store.activeCreature.creatureSpriteContainer);
            }

            this.store.endTurn();
            if (
                this.store.battleState === BATTLE_STATE_BATTLE_OVER_WIN
                || this.store.battleState === BATTLE_STATE_BATTLE_OVER_LOSE
            ) {

                return this.scene.start('BattleOver');
            }
            this.store.activeCreature.creatureSpriteContainer.updateEffectsIcons()
            this.handleStep()
        })

        this.timeLineBySpeed(timeline)
        timeline.play()
    }

    moveCreatureAlongPath(timeline, activeCreature, path) {
        if (path.length < 2) return;

        // Получаем старый гекс перед перемещением
        const oldKey = activeCreature.position.join(',');
        const oldHex = this.hexagonsArray.get(oldKey);

        // Убираем существо со старого гекса в начале перемещения
        timeline.add({
            at: 0,
            run: () => {
                if (oldHex) oldHex.removeCreature();
            }
        });

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

                // Устанавливаем существо на новый гекс
                const newKey = lastPos.join(',');
                const newHex = this.hexagonsArray.get(newKey);
                if (newHex) {
                    newHex.setCreature(activeCreature.creatureSpriteContainer);
                    // Обновляем ссылку на родительский гекс
                    activeCreature.creatureSpriteContainer.parentHex = newHex;
                }
            }
        });


        return timeline
    }

    findPath(start, end) {
        return this.store.findPath(start, end)
    }

    update(time, delta) {
    }

    showButtons() {
        this.store.activeCreature.actions.forEach((action, i) => {
            // Создаем элементы кнопки
            const buttonBg = this.add.rectangle(0, 0, 200, 150, 0x3e5a4d)
                .setOrigin(0, 0)
                .setInteractive();

            const effects = (action.effects || []).map(effect => effect.effect).join(', ')
            let actionType = 'Тип атаки: ' + action.actionType + (action.actionType === 'ranged' ? ' (' + action.range + ')' : '');
            if (action.element) {
                actionType += ' (' + action.element + ')'
            }

            const reload = action.currentCooldown > 0
            const notEnoughtPP = action.pp > this.store.activeCreature.pp

            const buttonTexts = [
                this.add.text(20, 20, action.name + (reload > 0 ? ' Reload' + action.currentCooldown : ''), {
                    fontFamily: "arial",
                    fontSize: "14px"
                }).setOrigin(0, 0),

                this.add.text(20, 40, actionType, {
                    fontFamily: "arial",
                    fontSize: "12px"
                }).setOrigin(0, 0),
                this.add.text(20, 60, 'PP: ' + action.pp + ', CD: ' + action.cooldown, {
                    fontFamily: "arial",
                    fontSize: "12px",
                    color: notEnoughtPP ? 'red' : 'white'
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
            const buttonContainer = this.add.container(20 + i * 215, 20, [buttonBg, ...buttonTexts, activeCreatureText]);

            buttonContainer.action = action

            // Делаем весь контейнер интерактивным
            buttonContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 150), Phaser.Geom.Rectangle.Contains);

            // Сохраняем ссылку на background для удобства
            buttonContainer.buttonBg = buttonBg;
            buttonContainer.buttonTexts = buttonTexts;
            buttonContainer.isActive = false;
            this.buttons.push(buttonContainer)

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
                this.selectActionOutside(action.id)
            });
        });

        const defenseButtonBg = this.add.rectangle(0, 0, 120, 60, 0x3e5a4d)
            .setOrigin(0, 0)
            .setInteractive()
        const defenseButtonText = [this.add.text(20, 20, 'Защита', {fontFamily: "arial", fontSize: "14px"})]
        const defenseButtonContainer = this.add.container(880, 20, [defenseButtonBg, ...defenseButtonText])

        // Делаем весь контейнер интерактивным
        defenseButtonContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 120, 60), Phaser.Geom.Rectangle.Contains)

        // Сохраняем ссылку на background для удобства
        defenseButtonContainer.buttonBg = defenseButtonBg;
        defenseButtonContainer.buttonTexts = defenseButtonText;
        this.buttons.push(defenseButtonContainer)

        // Обработчики событий
        defenseButtonBg.on('pointerover', () => {
            defenseButtonBg.setFillStyle(0x5a7a6d); // Цвет при наведении
        });

        defenseButtonBg.on('pointerout', () => {
            defenseButtonBg.setFillStyle(0x3e5a4d); // Исходный цвет
        });

        defenseButtonBg.on('pointerdown', () => this.handleDefenseAction());

        if (this.store.queue.canDelayTurn()) {
            const delayButtonBg = this.add.rectangle(0, 0, 120, 60, 0x3e5a4d)
                .setOrigin(0, 0)
                .setInteractive()
            const delayButtonText = [this.add.text(20, 20, 'Отложить', {fontFamily: "arial", fontSize: "14px"})]
            const delayButtonContainer = this.add.container(880, 95, [delayButtonBg, ...delayButtonText])

            // Делаем весь контейнер интерактивным
            delayButtonContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 120, 60), Phaser.Geom.Rectangle.Contains)

            // Сохраняем ссылку на background для удобства
            delayButtonContainer.buttonBg = delayButtonBg;
            delayButtonContainer.buttonTexts = delayButtonText;
            this.buttons.push(delayButtonContainer)

            // Обработчики событий
            delayButtonBg.on('pointerover', () => {
                delayButtonBg.setFillStyle(0x5a7a6d); // Цвет при наведении
            });

            delayButtonBg.on('pointerout', () => {
                delayButtonBg.setFillStyle(0x3e5a4d); // Исходный цвет
            });

            delayButtonBg.on('pointerdown', () => {
                this.showDelayTurnOptions()
            });
        }
    }

    selectActionOutside(actionId) {
        if (!actionId) {
            return
        }
        if (actionId === 'skip') {
            return this.handleDefenseAction()
        }
        if (actionId === 'delay') {
            return this.showDelayTurnOptions()
        }

        // Ищем действие по ID
        let foundAction = this.store.availableActions.find(a => {
            if (!a.actionObject) {
                return false
            }
            return a.actionObject.id === actionId
        });

        if (foundAction) {
            // Устанавливаем выбранное действие
            this.selectedAction = {
                action: foundAction.actionObject,
                targets: foundAction.targets,
                actionDirections: foundAction.actionDirections,
            };
        } else {
            // Ищем действие по ID
            foundAction = this.store.activeCreature.actions.find(a => a.id === actionId);

            // Устанавливаем выбранное действие
            this.selectedAction = {
                action: foundAction
            };
        }


        // Помечаем доступные гексы
        this.markActionAvailableHexs();
        return
    }

    hideButtons() {
        // Очищаем только состояние гексов
        this.hexagonsArray.forEach(hexagonSprite => {
            if (
                hexagonSprite.hexState === HEX_STATE_ATTACKABLE ||
                hexagonSprite.hexState === HEX_STATE_TREATABLE
            ) {
                hexagonSprite.setHexState(HEX_STATE_NORMAL);
            }
        });

        // Сбрасываем выбранное действие
        this.selectedAction = null;
    }

    showDelayTurnOptions() {
        this.delayTurnModelOpened = true
        const currentCreature = this.store.activeCreature;

        // Создаем модальное окно
        const modal = this.add.rectangle(400, 300, 600, 400, 0x333333)
            .setStrokeStyle(2, 0xffffff);

        const title = this.add.text(400, 180, 'Выберите после кого ходить', {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const buttons = []

        // Создаем кнопки для каждого существа, которое может быть после текущего
        let yPosition = 230;
        const queue = this.store.queue.getNextQueue()
        for (let i = 0; i < queue.length; i++) {
            const targetCreature = queue[i];

            buttons.push(this.add.text(400, yPosition, `${targetCreature.name} (id: ${targetCreature.id}, Инициатива: ${CreatureAPI.getInitiative(targetCreature)})`, {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#444444',
                padding: {x: 10, y: 5}
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerup', () => {
                    this.handleDelayTurn(targetCreature);
                    modal.destroy();
                    title.destroy();
                    buttons.forEach(b => b.destroy())
                    this.delayTurnModelOpened = false
                }));

            yPosition += 40;
        }

        // Кнопка отмены
        buttons.push(this.add.text(400, yPosition + 20, 'Отмена', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#cc0000',
            padding: {x: 10, y: 5}
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerup', () => {
                modal.destroy();
                title.destroy();
                buttons.forEach(b => b.destroy())

                this.delayTurnModelOpened = false
            }));
    }

    handleDefenseAction() {
        this.store.playerActionDefense()
        const activeCreature = this.store.activeCreature
        const timeline = this.add.timeline({});
        timeline.add({
            run: () => {
                // для защиты можно и другой эффект
                activeCreature.creatureSpriteContainer.setMonsterState('hurt_' + activeCreature.direction)
                activeCreature.creatureSpriteContainer.updateVisual()
                activeCreature.creatureSpriteContainer.updateEffectsIcons()
            }
        })
        timeline.add({
            at: 500, //гомосятина
            run: () => {
                activeCreature.creatureSpriteContainer.setDefaultState()
            }
        })
        timeline.on('complete', () => {
            this.store.endTurn();
            this.handleStep()
        })

        this.timeLineBySpeed(timeline)
        timeline.play()
    }

    handleDelayTurn(targetCreature) {
        this.store.playerActionDelayedTurn(targetCreature)
        this.store.activeCreature.creatureSpriteContainer.updateVisual()
        this.store.endTurn(true);
        this.handleStep()
    }

    timeLineBySpeed(timeline) {
        timeline.events.forEach(event => {
            event.at /= this.gameSpeed;
            event.time /= this.gameSpeed;
        });
    }

    // New method to handle melee attack direction
    handleAttackDirection(pointer) {
        if (
            !this.selectedAction
            || !this.selectedAction.action
            || !this.selectedAction.actionDirections
            || this.selectedAction.action?.actionType !== 'melee'
        ) return;

        // Clear previous state
        this.clearAttackIndicator();

        if (!gameStore.hoveredCreatureId) {
            return
        }

        // Find hovered enemy
        const enemy = this.hoveredCreature;

        if (!enemy) {
            return
        }

        const availableDirections = this.selectedAction.actionDirections[enemy.position.join(',')]
        if (!availableDirections) return;

        // Calculate attack direction
        const hex = this.hexagonsArray.get(enemy.position.join(','));
        const angle = Phaser.Math.Angle.Between(
            hex.x, hex.y,
            pointer.worldX, pointer.worldY
        );

        const directions = hex.getSectorAngle();
        let direction = 5;
        let min = Infinity
        let minDiff = Math.PI * 2;

        // Если меньше минимального сектора, значит право
        if (angle < (directions[0] - Math.PI / 6)) {
            direction = 5
        } else {
            // Находим ближайший сектор
            for (let i = 0; i < directions.length; i++) {
                if (!availableDirections.some(availableDirection => availableDirection.direction === i)) {
                    continue;
                }
                const diff = Math.abs(Phaser.Math.Angle.Wrap(angle - directions[i]));
                if (diff < minDiff) {
                    minDiff = diff;
                    direction = i;
                }
            }
        }


        // Get attack position
        const positions = this.selectedAction.actionDirections[enemy.position.join(',')];
        const attackPosition = this.getPositionInDirection(
            enemy.position,
            direction
        );

        // Check if position is valid
        if (!positions.some(({position}) =>
            position[0] === attackPosition[0] && position[1] === attackPosition[1]
        )) return;

        // Store current attack
        this.currentAttack = {
            enemyId: enemy.id,
            direction,
            position: attackPosition
        };

        // Visual feedback
        this.showAttackDirection(hex, direction, attackPosition);
    }

    getPositionInDirection(targetPosition, direction) {
        const [x, y] = targetPosition;

        // Direction vectors based on hex grid orientation
        // For pointy-top hexagons (even-r offset coordinates)
        const [dx, dy] = this.store.getDirections(targetPosition)[direction];
        return [x + dx, y + dy];
    }


    // Helper to show attack direction
    showAttackDirection(enemyHex, direction, attackPosition) {
        // Highlight attack position
        const attackHex = this.hexagonsArray.get(attackPosition.join(','));
        attackHex.setHexState(HEX_STATE_SELECTED);

        // Create sword indicator
        const angle = enemyHex.getSectorAngle()[direction];
        const distance = enemyHex.radius * 0.7;
        const x = enemyHex.x + Math.cos(angle) * distance;
        const y = enemyHex.y + Math.sin(angle) * distance;

        this.attackIndicator = this.add.sprite(x, y, 'cursor_sword');
        this.attackIndicator.rotation = angle + Math.PI + Math.PI / 4;
        this.attackIndicator.setDepth(100);
        this.attackHex = attackHex
    }

// Clear previous indicators
    clearAttackIndicator() {
        if (this.attackIndicator) {
            this.attackIndicator.destroy();
            this.attackIndicator = null;

            this.attackHex.setHexState(HEX_STATE_MOVEABLE)


            this.currentAttack = {
                enemyId: null,
                direction: null,
                position: null
            };
        }
    }
}
