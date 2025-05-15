import Phaser from 'phaser';
import EasyStar from 'easystarjs';
import {ExplorationObject} from "../classes/exploration/ExplorationObject.js";

export class ExplorationLevel extends Phaser.Scene {
    constructor() {
        super('ExplorationLevel');
        this.tileSize = 32;
        this.moveSpeed = 300; // Пикселей в секунду
        this.path = [];
        this.familiarPath = [];
        this.isMoving = false;
        this.roomMinSize = 3;
        this.roomMaxSize = 6;
        this.corridorWidth = 1;
        this.currentPathIndex = 0;
        this.currentDepth = 1;
        this.enemies = null;
        this.portals = null;
        this.traps = null;
        this.resources = null;
        this.currentLevelConfig = null
        this.objectPositions = {} // нужен, чтобы объекты не находились друг на друге

        this.levelSizes = [
            {rooms: 5, type: 'small', mapSize: 20},   // Уровни 1-5
            {rooms: 10, type: 'medium', mapSize: 30}, // Уровни 6-10
            {rooms: 25, type: 'large', mapSize: 45}   // Уровни 11-15
        ];

    }

    preload() {
    }

    create() {
        // Создаем группы для объектов
        this.enemies = new Set();
        this.portals = new Set();
        this.resources = new Set();
        this.traps = new Set();
        this.playerGold = 0;
        this.objectPositions = {}


        this.createWorld();
        this.initPathfinding();
        this.createPlayer();
        this.createFamiliar();
        this.setupCamera();

        this.addObjectsToRooms();

        // Добавляем отображение текущей глубины
        this.depthText = this.add.text(
            20, 20,
            `Глубина: ${this.currentDepth}`,
            {font: '20px Arial', fill: '#ffffff'}
        ).setScrollFactor(0);

        // Отображение глубины
        this.depthText = this.add.text(20, 20, `Глубина: ${this.currentDepth}`,
            {font: '20px Arial', fill: '#ffffff'}
        ).setScrollFactor(0);

        // Создаем UI
        this.createUI();
    }

    addObjectsToRooms() {
        //TODO добавить объекты в коридоры

        this.rooms.forEach(room => {
            switch (room.type) {
                case 'start':
                    // Портал назад (только если не на первом уровне)
                    if (this.currentDepth > 1) {
                        this.addReturnPortal(room);
                    }
                    break;
                case 'exit':
                    this.addExitPortal(room);
                    break;
                case 'normal':
                    this.addEnemies(room);
                    this.addResources(room);
                    break;
                case 'treasure':
                    this.addTraps(room);
                    this.addChests(room);
                    this.addEnemies(room);
                    break;
                case 'boss':
                    this.addBoss(room);
                    break;
            }
        });
    }

    getFreePositionInRoom(room) {
        let x, y
        let attempts = 0
        // смотрим, чтобы оъекты не пересекались
        do {
            // сначала пробуем поставить посреди комнаты
            if (attempts === 0) {
                x = room.x
                y = room.y
            } else {
                x = room.x + 1 + Math.floor(Math.random() * (room.width - 1));
                y = room.y + 1 + Math.floor(Math.random() * (room.height - 1));
            }
        } while (attempts++ < 100 && this.objectPositions[`${x}-${y}`]);
        return [x, y]
    }

    addBoss(room) {
        const [x, y] = this.getFreePositionInRoom(room)
        const boss = this.add.sprite(
            (x + Math.floor(room.width / 2)) * this.tileSize,
            (y + Math.floor(room.height / 2)) * this.tileSize,
            'boss'
        ).setOrigin(0.5);

        this.enemies.add(new ExplorationObject({
            sprite: boss,
            x, y,
            type: 'boss'
        }));
        this.objectPositions[`${x}-${y}`] = true
    }

    addEnemies(room) {
        const count = Phaser.Math.Between(1, 3 + Math.floor(this.currentDepth / 3));
        for (let i = 0; i < count; i++) {
            const [x, y] = this.getFreePositionInRoom(room)

            const enemy = this.add.sprite(
                x * this.tileSize + this.tileSize / 2,
                y * this.tileSize + this.tileSize / 2,
                'enemy'
            ).setOrigin(0.5).setInteractive();

            this.enemies.add(new ExplorationObject({
                sprite: enemy,
                x, y,
                type: 'enemy'
            }));
            this.objectPositions[`${x}-${y}`] = true
        }
    }

    addResources(room) {
        const count = Phaser.Math.Between(1, 3 + Math.floor(this.currentDepth / 3));

        for (let i = 0; i < count; i++) {
            const [x, y] = this.getFreePositionInRoom(room)

            const resource = this.add.sprite(
                x * this.tileSize + this.tileSize / 2,
                y * this.tileSize + this.tileSize / 2,
                'reward'
            ).setOrigin(0.5).setInteractive();

            this.resources.add(new ExplorationObject({
                sprite: resource,
                x, y,
                type: 'chest'
            }));
            this.objectPositions[`${x}-${y}`] = true
        }
    }

    addTraps(room) {
        const count = Phaser.Math.Between(1, 2);

        for (let i = 0; i < count; i++) {
            const [x, y] = this.getFreePositionInRoom(room)

            const trap = this.add.sprite(
                x * this.tileSize + this.tileSize / 2,
                y * this.tileSize + this.tileSize / 2,
                'trap'
            ).setOrigin(0.5).setTint(0xff0000).setInteractive();

            this.traps.add(new ExplorationObject({
                sprite: trap,
                x, y,
                type: 'trap'
            }));
            this.objectPositions[`${x}-${y}`] = true
        }
    }

    addChests(room) {
        const [x, y] = this.getFreePositionInRoom(room)

        const chest = this.add.sprite(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'chest'
        ).setOrigin(0.5).setInteractive();

        this.resources.add(new ExplorationObject({
            sprite: chest,
            x, y,
            type: 'chest'
        }));
        this.objectPositions[`${x}-${y}`] = true
    }


    createWorld() {
        this.currentLevelConfig = this.levelSizes[Math.floor(Math.random() * 3)]
        this.walls = this.physics.add.staticGroup();

        // 1. Заполняем всю карту стенами
        for (let y = 0; y < this.currentLevelConfig.mapSize; y++) {
            for (let x = 0; x < this.currentLevelConfig.mapSize; x++) {
                this.walls.create(
                    x * this.tileSize + this.tileSize / 2,
                    y * this.tileSize + this.tileSize / 2,
                    'wall'
                ).setOrigin(0.5).refreshBody();
            }
        }

        // 2. Генерируем стартовую комнату
        const startRoom = this.generateRoom('start');
        const [centerX, centerY] = this.createRoom(startRoom, 'start');
        // Стартовая позиция игрока
        this.playerStartX = centerX;
        this.playerStartY = centerY;
        this.rooms = [startRoom];

        // Босс-комната на нужных уровнях
        if ([5, 10, 15].includes(this.currentDepth)) {
            const bossRoom = this.generateRoom('boss');
            this.createRoom(bossRoom, 'boss')
            this.rooms.push(bossRoom);
        }

        // 3. Генерируем конечную комнату (гарантируем размещение)
        let exitRoom;
        let attempts = 0;
        do {
            exitRoom = this.generateRoom('exit');
        } while (attempts++ < 100 && (!this.canPlaceRoom(exitRoom) ||
            Phaser.Math.Distance.Between(
                startRoom.x + startRoom.width / 2,
                startRoom.y + startRoom.height / 2,
                exitRoom.x + exitRoom.width / 2,
                exitRoom.y + exitRoom.height / 2
            ) < this.currentLevelConfig.mapSize / 2));

        if (exitRoom && this.canPlaceRoom(exitRoom)) {
            this.createRoom(exitRoom, 'exit');
            this.rooms.push(exitRoom);
        }

        // Остальные комнаты
        for (let i = 0; i < this.currentLevelConfig.rooms - 2; i++) {
            const type = Phaser.Math.RND.pick(['normal', 'treasure', 'enemies']);
            const room = this.generateRoom(type);
            this.createRoom(room, type);
            this.rooms.push(room);
        }

        // 5. Соединяем все комнаты
        this.connectRooms();

        this.walls.refresh();
    }

    generateRoom(type) {
        const width = Phaser.Math.Between(this.roomMinSize, this.roomMaxSize);
        const height = Phaser.Math.Between(this.roomMinSize, this.roomMaxSize);
        const x = Phaser.Math.Between(1, this.currentLevelConfig.mapSize - width - 1);
        const y = Phaser.Math.Between(1, this.currentLevelConfig.mapSize - height - 1);

        return {x, y, width, height, type};
    }

    canPlaceRoom(room) {
        // Проверяем выход за границы карты
        if (room.x < 1 || room.y < 1 ||
            room.x + room.width >= this.currentLevelConfig.mapSize - 1 ||
            room.y + room.height >= this.currentLevelConfig.mapSize - 1) {
            return false;
        }

        // Проверяем пересечение с существующими комнатами
        return !this.rooms.some(existingRoom =>
            room.x < existingRoom.x + existingRoom.width + this.corridorWidth &&
            room.x + room.width + this.corridorWidth > existingRoom.x &&
            room.y < existingRoom.y + existingRoom.height + this.corridorWidth &&
            room.y + room.height + this.corridorWidth > existingRoom.y
        );
    }

    createRoom(room) {
        // Удаляем стены в области комнаты
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.walls.getChildren().forEach(wall => {
                    if (Math.floor(wall.x / this.tileSize) === x &&
                        Math.floor(wall.y / this.tileSize) === y) {
                        wall.destroy();
                    }
                });

                // Добавляем пол
                this.add.image(
                    x * this.tileSize + this.tileSize / 2,
                    y * this.tileSize + this.tileSize / 2,
                    'floor'
                ).setOrigin(0.5);
            }
        }

        // Очищаем область комнаты
        this.fillArea(room.x, room.y, room.width, room.height, null);

        // Добавляем пол
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.add.image(
                    x * this.tileSize + this.tileSize / 2,
                    y * this.tileSize + this.tileSize / 2,
                    'floor'
                ).setOrigin(0.5);
            }
        }

        // Центр комнаты
        const centerX = room.x + Math.floor(room.width / 2);
        const centerY = room.y + Math.floor(room.height / 2);
        return [centerX, centerY]
    }

    addReturnPortal(x, y) {
        const portal = this.add.sprite(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'portal'
        ).setOrigin(0.5).setInteractive();


        this.portals.add(new ExplorationObject({
            sprite: this.exitPortal,
            x, y,
            type: 'returnPortal'
        }));

        this.objectPositions[`${x}-${y}`] = true
    }


    addExitPortal(room) {
        const x = room.x + Math.floor(room.width / 2);
        const y = room.y + Math.floor(room.height / 2);

        this.exitPortal = this.add.sprite(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'portal'
        ).setOrigin(0.5).setInteractive().setTint(0x00ff00);

        this.portals.add(new ExplorationObject({
            sprite: this.exitPortal,
            x, y,
            type: 'exitPortal'
        }));
        this.objectPositions[`${x}-${y}`] = true
    }

    collectResource(resourceObject) {
        resourceObject.sprite.destroy();
        this.resources.delete(resourceObject)
        // Добавляем ресурсы игроку
        this.playerGold += Phaser.Math.Between(10, 50);
        this.updateUI();
    }

    catchInTrap(resourceObject) {
        resourceObject.sprite.destroy();
        this.traps.delete(resourceObject)
        // Добавляем ресурсы игроку
        this.playerGold -= Phaser.Math.Between(10, 50);
        this.updateUI();
    }

    connectRooms() {
        // Соединяем все комнаты минимальным количеством коридоров
        for (let i = 1; i < this.rooms.length; i++) {
            const prev = this.rooms[i - 1];
            const current = this.rooms[i];

            // Вертикальный коридор
            this.createCorridor(
                prev.x + Math.floor(prev.width / 2),
                current.x + Math.floor(current.width / 2),
                prev.y + Math.floor(prev.height / 2),
                this.corridorWidth
            );

            // Горизонтальный коридор
            this.createCorridor(
                current.y + Math.floor(current.height / 2),
                prev.y + Math.floor(prev.height / 2),
                current.x + Math.floor(current.width / 2),
                this.corridorWidth,
                true
            );
        }
    }

    createCorridor(start, end, fixedPos, width, isVertical = false) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);

        for (let pos = min; pos <= max; pos++) {
            const x = isVertical ? fixedPos : pos;
            const y = isVertical ? pos : fixedPos;

            // Удаляем стены в коридоре
            this.walls.getChildren().forEach(wall => {
                if (Math.floor(wall.x / this.tileSize) === x &&
                    Math.floor(wall.y / this.tileSize) === y) {
                    wall.destroy();
                }
            });

            // Добавляем пол
            this.add.image(
                x * this.tileSize + this.tileSize / 2,
                y * this.tileSize + this.tileSize / 2,
                'floor'
            ).setOrigin(0.5);
        }
    }

    fillArea(x, y, width, height, tile) {
        for (let row = y; row < y + height; row++) {
            for (let col = x; col < x + width; col++) {
                if (tile) {
                    this.walls.create(
                        col * this.tileSize + this.tileSize / 2,
                        row * this.tileSize + this.tileSize / 2,
                        tile
                    ).setOrigin(0.5);
                } else {
                    // Удаляем стену если она есть
                    this.walls.getChildren().forEach(wall => {
                        if (wall.x === col * this.tileSize + this.tileSize / 2 &&
                            wall.y === row * this.tileSize + this.tileSize / 2) {
                            wall.destroy();
                        }
                    });
                }
            }
        }
    }

    createPlayer() {
        // Находим центр стартовой комнаты
        const startX = this.rooms[0].x + Math.floor(this.rooms[0].width / 2);
        const startY = this.rooms[0].y + Math.floor(this.rooms[0].height / 2);

        this.player = this.add.sprite(
            startX * this.tileSize + this.tileSize / 2,
            startY * this.tileSize + this.tileSize / 2,
            'player'
        ).setOrigin(0.5);

        // Обработка кликов
        this.input.on('pointerdown', (pointer) => {
            if (!this.isMoving) {
                this.movePlayerTo(pointer.worldX, pointer.worldY);
                this.drawPath()
            }
        });
    }

    setupCamera() {
        this.cameras.main.setBounds(
            0,
            0,
            this.currentLevelConfig.mapSize * this.tileSize,
            this.currentLevelConfig.mapSize * this.tileSize
        );
        this.cameras.main.startFollow(this.player);
    }

    initPathfinding() {
        this.easystar = new EasyStar.js();

        // Создаем карту проходимости (0 - проходимо, 1 - непроходимо)
        const grid = [];
        for (let y = 0; y < this.currentLevelConfig.mapSize; y++) {
            grid[y] = [];
            for (let x = 0; x < this.currentLevelConfig.mapSize; x++) {
                grid[y][x] = this.isTileWalkable(x, y) ? 0 : 1;
            }
        }

        this.easystar.setGrid(grid);
        this.easystar.setAcceptableTiles([0]);
        this.easystar.enableDiagonals(false); // Только ортогональное движение
    }

    isTileWalkable(x, y) {
        // Проверяем, есть ли стена в этих координатах
        return !this.walls.getChildren().some(wall =>
            Math.floor(wall.x / this.tileSize) === x &&
            Math.floor(wall.y / this.tileSize) === y
        );
    }


    movePlayerTo(worldX, worldY) {
        const targetX = Math.floor(worldX / this.tileSize);
        const targetY = Math.floor(worldY / this.tileSize);
        const startX = Math.floor(this.player.x / this.tileSize);
        const startY = Math.floor(this.player.y / this.tileSize);

        // Останавливаем текущее движение
        this.isMoving = false;
        this.tweens.killTweensOf(this.player);
        this.tweens.killTweensOf(this.familiar);

        // Ищем путь
        this.easystar.findPath(startX, startY, targetX, targetY, path => {
            if (path && path.length > 1) {
                this.path = path;
                this.currentPathIndex = 1; // Начинаем с первого шага

                // Формируем путь фамильяра (на 1 шаг позади)
                this.familiarPath = [];
                for (let i = 0; i < this.path.length; i++) {
                    if (i === 0) {
                        // Первая позиция фамильяра - текущая позиция игрока минус 1 клетка
                        const dirX = this.path[1].x - this.path[0].x;
                        const dirY = this.path[1].y - this.path[0].y;
                        this.familiarPath.push({
                            x: this.path[0].x - dirX,
                            y: this.path[0].y - dirY
                        });
                    } else {
                        this.familiarPath.push(this.path[i - 1]);
                    }
                }

                this.moveBothCharacters();
            }
        });
        this.easystar.calculate();
    }

    moveBothCharacters() {
        if (this.currentPathIndex >= this.path.length) {
            this.isMoving = false;
            return;
        }

        this.isMoving = true;

        // Целевые позиции
        const playerTarget = this.path[this.currentPathIndex];
        const playerTargetX = playerTarget.x * this.tileSize + this.tileSize / 2;
        const playerTargetY = playerTarget.y * this.tileSize + this.tileSize / 2;

        const familiarTarget = this.familiarPath[this.currentPathIndex];
        const familiarTargetX = familiarTarget.x * this.tileSize + this.tileSize / 2;
        const familiarTargetY = familiarTarget.y * this.tileSize + this.tileSize / 2;

        // Движение игрока
        this.tweens.add({
            targets: this.player,
            x: playerTargetX,
            y: playerTargetY,
            duration: this.tileSize / this.moveSpeed * 1000,
            ease: 'Linear',
            onComplete: () => {
                if (this.checkPlayerInteractWithObject(playerTarget)) {
                    this.path = []
                    this.currentPathIndex = 0
                    this.isMoving = false
                } else {
                    this.currentPathIndex++;
                    this.moveBothCharacters();
                }
            }
        });

        // Движение фамильяра
        this.tweens.add({
            targets: this.familiar,
            x: familiarTargetX,
            y: familiarTargetY,
            duration: this.tileSize / this.moveSpeed * 1000,
            ease: 'Linear',
        });
    }

    checkPlayerInteractWithObject(target) {
        if (!this.objectPositions[`${target.x}-${target.y}`]) {
            return false
        }

        const interactObject = [
            ...this.enemies,
            ...this.traps,
            ...this.portals,
            ...this.resources
        ].find(obj => (obj.x === target.x) && (obj.y === target.y));
        if (!interactObject) {
            return false
        }

        switch (interactObject.type) {
            case 'chest':
                this.collectResource(interactObject)
                break
            case 'enemy':
                this.startCombat(interactObject)
                break
            case 'boss':
                this.startBossFight(interactObject)
                break
            case 'returnPortal':
                this.goToPreviousLevel()
                break
            case 'exitPortal':
                this.goToNextLevel()
                break
            case 'trap':
                this.catchInTrap(interactObject)
                break
            default:
                console.log('not found', interactObject)
        }
        console.log(interactObject, target)

        return true
    }

    drawPath() {
        return
        if (this.pathGraphics) this.pathGraphics.destroy();

        this.pathGraphics = this.add.graphics();
        this.pathGraphics.lineStyle(2, 0x00ff00, 0.5);
        this.pathGraphics.fillStyle(0x00ff00, 0.2);

        // Рисуем линии между точками пути
        let prevPoint = {
            x: this.player.x,
            y: this.player.y
        };

        for (const point of this.path) {
            const x = point.x * this.tileSize + this.tileSize / 2;
            const y = point.y * this.tileSize + this.tileSize / 2;

            this.pathGraphics.moveTo(prevPoint.x, prevPoint.y);
            this.pathGraphics.lineTo(x, y);
            this.pathGraphics.fillCircle(x, y, 5);

            prevPoint = {x, y};
        }
    }

    goToNextLevel() {
        this.currentDepth++;
        this.scene.restart();
    }

    goToPreviousLevel() {
        if (this.currentDepth > 1) {
            this.currentDepth--;
            this.scene.restart();
        }
    }

    startCombat(enemy) {
        // Создаем простой UI боя
        const combatUI = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );

        const bg = this.add.graphics()
            .fillStyle(0x222222, 0.9)
            .fillRoundedRect(-150, -100, 300, 200, 10)
            .setInteractive();
        combatUI.add(bg);

        const text = this.add.text(0, -50, 'Бой!',
            {font: '24px Arial', fill: '#ffffff'}
        ).setOrigin(0.5);
        combatUI.add(text);

        const attackBtn = this.add.text(0, 30, 'Атаковать',
            {font: '20px Arial', fill: '#ff5555'}
        ).setOrigin(0.5).setInteractive();
        combatUI.add(attackBtn);

        // Обработчик атаки
        attackBtn.on('pointerdown', () => {
            enemy.sprite.destroy();
            combatUI.destroy();
            this.enemies.delete(enemy)
            this.playerGold += 100;
            this.updateUI();
        });

        // Закрытие при клике вне окна
        bg.on('pointerdown', (pointer) => {
            if (pointer.y < -100 || pointer.y > 100 ||
                pointer.x < -150 || pointer.x > 150) {
                combatUI.destroy();
            }
        });
    }

    createFamiliar() {
        // Размещаем фамильяра позади игрока
        const startX = Math.floor(this.player.x / this.tileSize);
        const startY = Math.floor(this.player.y / this.tileSize);

        this.familiar = this.add.sprite(
            (startX - 1) * this.tileSize + this.tileSize / 2,
            startY * this.tileSize + this.tileSize / 2,
            'familiar'
        ).setOrigin(0.5);
    }

    openChest(chest, x, y) {
        // Анимация открытия
        this.tweens.add({
            targets: chest,
            scaleX: 1.2,
            scaleY: 1.2,
            yoyo: true,
            duration: 300,
            onComplete: () => {
                chest.destroy();
                // Создаем эффект получения предмета
                const reward = this.add.sprite(
                    x * this.tileSize + this.tileSize / 2,
                    y * this.tileSize + this.tileSize / 2,
                    'reward'
                ).setOrigin(0.5);

                this.tweens.add({
                    targets: reward,
                    y: reward.y - 50,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => reward.destroy()
                });

                // Добавляем награду (золото/предметы)
                this.updateScore(100);
            }
        });
    }

    startBossFight(boss) {
        const combatUI = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );

        const bg = this.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRect(-200, -150, 400, 300);

        const text = this.add.text(0, -50, 'БОСС БИТВА!',
            {font: '32px Arial', fill: '#ff0000'}
        ).setOrigin(0.5);

        const attackBtn = this.add.text(0, 50, 'АТАКОВАТЬ',
            {font: '24px Arial', fill: '#ffffff'}
        ).setOrigin(0.5).setInteractive();

        combatUI.add([bg, text, attackBtn]);

        attackBtn.on('pointerdown', () => {
            // Упрощенная механика боя
            boss.sprite.destroy();
            this.enemies.delete(boss)
            combatUI.destroy();

            // Награда за победу
            this.updateScore(500);
            this.add.text(
                boss.x,
                boss.y - 50,
                'ПОБЕДА! +500',
                {font: '24px Arial', fill: '#ffff00'}
            ).setOrigin(0.5);
        });
    }

    updateScore(points) {
        // Здесь будет логика обновления счета игрока
        console.log(`Игрок получил ${points} очков`);
    }

    update() {
    }

    checkObjectVisibility() {
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);

        // Проверяем все объекты в радиусе 5 клеток
        [this.enemies, this.traps, this.portals].forEach(obj => {
            const objTileX = Math.floor(obj.x / this.tileSize);
            const objTileY = Math.floor(obj.y / this.tileSize);

            const distance = Phaser.Math.Distance.Between(
                playerTileX, playerTileY,
                objTileX, objTileY
            );

            obj.setVisible(distance < 5);
        });
    }


    createUI() {
        this.goldText = this.add.text(20, 50, 'Золото: 0',
            {font: '18px Arial', fill: '#ffd700'}
        ).setScrollFactor(0);
    }

    updateUI() {
        this.goldText.setText(`Золото: ${this.playerGold}`);
    }
}