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
}
