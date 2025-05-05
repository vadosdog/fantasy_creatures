import {EventBus} from '../EventBus';
import {Scene} from 'phaser';
import Hexagon, {
    GAME_STATE_MOVABLE, GAME_STATE_NORMAL,
    GAME_STATE_SELECTED,
    HEXAGON_ANIM_GREEN, HEXAGON_ANIM_GREY,
    HEXAGON_ANIM_LIGHT_GREEN,
    HEXAGON_ANIM_LIGHT_RED,
    HEXAGON_ANIM_LIGHT_YELLOW,
    HEXAGON_ANIM_NORMAL,
    HEXAGON_ANIM_RED,
    HEXAGON_ANIM_YELLOW
} from "../sprites/battle/Hexagon.js";
import {GAME_STATE_PLAYER_TURN} from "../../store/battle.js";

export class Battle extends Scene {
    showGridIndexes = true
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

        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
        });
        this.anims.create({
            key: 'moveLeft',
            frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turnLeft',
            frames: [{key: 'dude', frame: 0}],
        });

        this.anims.create({
            key: 'moveRight',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turnRight',
            frames: [{key: 'dude', frame: 5}],
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

            // hexagon.anims.play(HEXAGON_ANIM_YELLOW)
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
                let creatureSprite = this.add.sprite(
                    hexagon.x,
                    hexagon.y - 30,
                    creature.sprite
                );
                if (creature.direction === 'left') {
                    creature.defaultDirection = 'turnLeft'
                } else {
                    creature.defaultDirection = 'turnRight'
                }
                creatureSprite.anims.play(creature.defaultDirection)
                creatureSprite.setScale(1.7, 1.7)
                creature.creatureSprite = creatureSprite
                // scaleX = this.cameras.main.width / battleground.width
                // scaleY = this.cameras.main.height / battleground.height
                // scale = Math.max(scaleX, scaleY)
                // battleground.setScale(scale).setScrollFactor(0)

                this.store.creatures.add(creature)
            }
        })
    }

    handleStep() {
        this.hexagonsArray.forEach(hexagonSprite => {
            hexagonSprite.setGameState(GAME_STATE_NORMAL)
        })
        this.store.nextRound()
        let {activeCreature, availableActions} = this.store.getTurn()
        let creatureSprite = this.hexagonsArray.get(`${activeCreature.position[0]},${activeCreature.position[1]}`)
        creatureSprite.setGameState(GAME_STATE_SELECTED)
        availableActions.forEach(({action, targets}) => {
            switch (action) {
                case 'move':
                    targets.forEach(([x, y]) => {
                        let hexagonSprite = this.hexagonsArray.get(`${x},${y}`)
                        hexagonSprite.setGameState(GAME_STATE_MOVABLE)
                    })
            }
        })
    }

    handleHexagonClick(position, hexagonSprite, args) {
        if (this.store.gameState !== GAME_STATE_PLAYER_TURN) {
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
        let timeline
        switch (action) {
            case 'move':
                // Получаем путь от текущей позиции персонажа до выбранной клетки
                const path = this.findPath(this.store.activeCreature.position, position);
                if (!path || path.length === 0) return;

                this.store.playerActionMoveTo(path)
                timeline = this.moveCreatureAlongPath(this.store.activeCreature, path)
                break
            default:
                // неизвестное действие
                return
        }

        timeline.on('complete', () => {
            this.store.endOfRound();
            this.handleStep()
        })
    }

    moveCreatureAlongPath(activeCreature, path) {
        if (path.length < 2) return;

        const totalDuration = 2000; // 2 секунды на весь путь
        const segmentDuration = 200;

        const timeline = this.add.timeline({});

        for (let i = 1; i < path.length; i++) {
            const [x, y] = path[i];
            const key = `${x},${y}`;
            const cellSprite = this.hexagonsArray.get(`${x},${y}`);
            if (!cellSprite) continue;

            // if (path[i - 1][1] < y) {
            //     activeCreature.creatureSprite.anims.play('moveLeft', true);
            // } else {
            //     activeCreature.creatureSprite.anims.play('moveRight', true);
            // }

            let direction = path[i - 1][1] < y ? 'moveRight' : 'moveLeft'
            timeline.add({
                at: i * segmentDuration,
                run: () => activeCreature.creatureSprite.anims.play(direction, true)
            });
            timeline.add({
                at: i * segmentDuration,
                tween: {
                    targets: activeCreature.creatureSprite,
                    x: cellSprite.x,
                    y: cellSprite.y - 30,
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
                activeCreature.creatureSprite.anims.play(activeCreature.defaultDirection, true)
            }
        })

        timeline.play();

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
        if (!start || !end) {
            throw new Error("Start or end point not found.");
        }

        // Очередь для BFS: элементы вида [x, y, path]
        const queue = [];
        queue.push([start[0], start[1], []]);

        const visited = new Set();
        let obstacles = new Set(this.store.queue.map(item => {
            return item.position.join(',')
        }))

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
