import {BattleCell} from "./BattleCell.js";

export class BattleMap extends Map {
    battleMap
    gridSizeX
    gridSizeY

    static create(gridSizeX, gridSizeY, contents) {
        const battleMap = new BattleMap()
        battleMap.gridSizeX = gridSizeX
        battleMap.gridSizeY = gridSizeY


        for (let i = 0; i < gridSizeY / 2; i++) {
            for (let j = 0; j < gridSizeX; j++) {
                if (gridSizeY % 2 === 0 || i + 1 < gridSizeY / 2 || j % 2 === 0) {
                    const battleCell = new BattleCell(i, j, contents.get(`${i},${j}`))
                    battleMap.set(`${i},${j}`, battleCell)
                }
            }
        }

        return battleMap
    }

    hasByCoords(x, y) {
        return this.has(`${x},${y}`)
    }

    isMovable(x, y) {
        return this.get(`${x},${y}`).content === undefined
    }

    removeContent(x, y) {
        return this.get(`${x},${y}`).content = undefined
    }

    setContent(x, y, content) {
        return this.get(`${x},${y}`).content = content
    }
    
    getContent(x, y) {
        return this.get(`${x},${y}`)?.content
    }

    // Добавляем в класс Battle новые методы:

    // Эвристическая функция (манхэттенское расстояние для гексов)
    heuristic(a, b) {
        const dx = Math.abs(a[0] - b[0]);
        const dy = Math.abs(a[1] - b[1]);
        return (dx + dy) / 2;
    }

    // Получение стоимости перемещения между клетками
    getMoveCost(from, to) {
        // Можно добавить разные стоимости для разных типов местности
        return 1;
    }

    findPath(start, end, obstacles) {
        if (!obstacles) {
            obstacles = new Set()
        }
        if (!start || !end) {
            throw new Error("Start or end point not found.");
        }

        const openSet = new Set();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        // Инициализация
        const startKey = `${start[0]},${start[1]}`;
        const endKey = `${end[0]},${end[1]}`;

        openSet.add(startKey);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, end));

        while (openSet.size > 0) {
            // Находим узел с наименьшей fScore
            let currentKey = null;
            let lowestFScore = Infinity;

            for (const key of openSet) {
                const score = fScore.get(key) || Infinity;
                if (currentKey === null) {
                    lowestFScore = score
                    currentKey = key
                    continue
                }
                if (score < lowestFScore) {
                    lowestFScore = score;
                    currentKey = key;
                }
            }

            // Если достигли цели
            if (currentKey === endKey) {
                return this.reconstructPath(cameFrom, currentKey);
            }

            openSet.delete(currentKey);
            closedSet.add(currentKey);

            const [x, y] = currentKey.split(',').map(Number);
            const directions = this.getDirections([x, y]);

            for (const [dx, dy] of directions) {
                const neighborX = x + dx;
                const neighborY = y + dy;
                const neighborKey = `${neighborX},${neighborY}`;

                // Пропускаем непроходимые клетки
                if (
                    neighborX < 0 || neighborY < 0 ||
                    !this.hasByCoords(neighborX, neighborY) ||
                    obstacles.has(neighborKey) ||
                    closedSet.has(neighborKey)
                ) {
                    continue;
                }

                // Рассчитываем временную gScore
                const tentativeGScore = (gScore.get(currentKey) || 0) +
                    this.getMoveCost([x, y], [neighborX, neighborY]);

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                // Это лучший путь
                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic([neighborX, neighborY], end));
            }
        }

        return []
    }

    // Вспомогательный метод для восстановления пути
    reconstructPath(cameFrom, currentKey) {
        const path = [];
        while (cameFrom.has(currentKey)) {
            const [x, y] = currentKey.split(',').map(Number);
            path.unshift([x, y]);
            currentKey = cameFrom.get(currentKey);
        }
        const [x, y] = currentKey.split(',').map(Number);
        path.unshift([x, y]);
        return path;
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
}
