import {EventBus} from '../EventBus';
import {Scene} from 'phaser';
import Hexagon, {
    HEX_STATE_ATTACKABLE,
    HEX_STATE_MOVABLE, HEX_STATE_NORMAL,
    HEX_STATE_SELECTED,
    HEXAGON_ANIM_GREEN, HEXAGON_ANIM_GREY,
    HEXAGON_ANIM_LIGHT_GREEN,
    HEXAGON_ANIM_LIGHT_RED,
    HEXAGON_ANIM_LIGHT_YELLOW,
    HEXAGON_ANIM_NORMAL,
    HEXAGON_ANIM_RED,
    HEXAGON_ANIM_YELLOW
} from "../sprites/battle/Hexagon.js";
import Monster1 from "../sprites/creatures/Monster1.js";
import MonsterContainer from "../sprites/creatures/MonsterContainer.js";
import {
    BATTLE_STATE_BATTLE_OVER_LOSE,
    BATTLE_STATE_BATTLE_OVER_WIN,
    BATTLE_STATE_PLAYER_TURN,
    BATTLE_STATE_WAITING
} from "../../store/battle.js";

export class Battle extends Scene {
    showGridIndexes = false
    hexagonGroup;
    store
    hexagonsArray;

    constructor(store) {
        super('Battle');
        this.store = store
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

                let creatureContainer = new MonsterContainer(
                    creature,
                    this,
                    hexagon.x,
                    hexagon.y,
                )

                creature.creatureSpriteContainer = creatureContainer
                this.store.creatures.add(creature)
            }
        })
    }

    handleStep() {
        this.hexagonsArray.forEach(hexagonSprite => {
            hexagonSprite.setHexState(HEX_STATE_NORMAL)
        })
        this.store.handleRound()
        let {activeCreature, availableActions} = this.store.getTurn()
        let activeHexagonSprite = this.hexagonsArray.get(`${activeCreature.position[0]},${activeCreature.position[1]}`)

        activeHexagonSprite.setHexState(HEX_STATE_SELECTED)
        activeCreature.creatureSpriteContainer.setState('idle_' + activeCreature.direction)
        if (this.store.battleState === BATTLE_STATE_PLAYER_TURN) {
            availableActions.forEach(({action, targets}) => {
                switch (action) {
                    case 'move':
                        targets.forEach(([x, y]) => {
                            let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                            hexagonSprite.setHexState(HEX_STATE_MOVABLE)
                        })
                        break;
                    case 'attack':
                        targets.forEach(([x, y]) => {
                            let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                            hexagonSprite.setHexState(HEX_STATE_ATTACKABLE)
                        })
                }
            })
        } else {
            if (availableActions.length === 0) {
                this.scene.start('BattleOver');
                return
            }
            this.handleAction(availableActions[0].action, availableActions[0].targets)
        }
    }

    handleHexagonClick(position, hexagonSprite, args) {
        if (this.store.battleState !== BATTLE_STATE_PLAYER_TURN) {
            return
        }

        const targets = new Map
        this.store.availableActions.forEach(({targets: actionTargets, action}) => {
            actionTargets.forEach(target => {
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
        let path
        switch (action) {
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
                const targetCreature = this.store.getCreatureByCoords(position)
                if (!targetCreature) {
                    return
                }
                // Получаем путь от текущей позиции персонажа до выбранной клетки
                path = this.findPath(this.store.activeCreature.position, position);
                if (!path || path.length === 0) return;
                path = path.slice(0, path.length - 1)

                let attackResult
                if (path.length > 1) {
                    attackResult = this.store.playerActionMoveAndAttack(path, position)
                    this.moveCreatureAlongPath(timeline, this.store.activeCreature, path)
                } else {
                    attackResult = this.store.playerActionAttack(position)
                }

                timeline.add({
                    at: 200 * (path.length), //гомосятина
                    run: () => {
                        let attackDirection = this.store.activeCreature.position[1] < position[1]
                            ? 'attack_right'
                            : 'attack_left'
                        this.store.activeCreature.creatureSpriteContainer.setState(attackDirection)
                    }
                });

                // надо бы в одном место выделить
                timeline.add({
                    at: 200 * (path.length) + 500, //гомосятина
                    run: () => {
                        this.store.activeCreature.creatureSpriteContainer.setDefaultState()
                    }
                });

                let attackDirection = this.store.activeCreature.position[1] < position[1]
                    ? 'left'
                    : 'right'
                if (attackResult.success) {
                    timeline.add({
                        at: 200 * (path.length), //гомосятина
                        run: () => {
                            targetCreature.creatureSpriteContainer.setState('hurt_' + attackDirection)
                            targetCreature.creatureSpriteContainer.updateVisual()
                            targetCreature.creatureSpriteContainer.playActionText("-" + attackResult.damage)
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
                                targetCreature.creatureSpriteContainer.setState('death_' + attackDirection)
                                targetCreature.creatureSpriteContainer.updateVisual()
                            }
                        });
                        timeline.add({
                            at: 200 * (path.length + 1) + 1000, //гомосятина
                            run: () => {
                                targetCreature.creatureSpriteContainer.destroy()
                            }
                        });
                    }
                } else {
                    timeline.add({
                        at: 200 * (path.length), //гомосятина
                        run: () => {
                            targetCreature.creatureSpriteContainer.playActionText("Промах...")
                        }
                    });
                }

                break
            default:
                // неизвестное действие
                return
        }


        timeline.on('complete', () => {
            this.store.endOfRound();
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
                run: () => activeCreature.creatureSpriteContainer.setState(direction)
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

    findAccessibleCells(start, step) {
        const visited = new Set();
        let currentPositions = [start];
        visited.add(start.join(','));
        let obstacles = new Set(this.store.queue.map(item => {
            return item.position.join(',')
        }))

        for (let s = 0; s < step; s++) {
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
                        this.hexagonsArray.has(`${newX},${newY}`) &&
                        !visited.has(key) &&
                        !obstacles.has(key)
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
    }

    findPath(start, end) {
        // Плохо что есть две разные точки поиска пути, надобы объеденить

        if (!start || !end) {
            throw new Error("Start or end point not found.");
        }

        // Очередь для BFS: элементы вида [x, y, path]
        const queue = [];
        queue.push([start[0], start[1], []]);

        const visited = new Set();
        let obstacles = new Set()

        this.store.queue.forEach(item => {
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


    changeScene() {
        this.scene.start('Game');
    }

}
