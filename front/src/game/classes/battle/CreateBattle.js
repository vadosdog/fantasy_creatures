// Класс который подбирает соперников
import {creaturesLib, getActionsByLevel, getCreature, getTeam2} from "../../../database/creaturesLib.js";
import {MediumAI} from "./AI/MediumAI.js";
import {calcCreatureStats} from "./Creature.js";
import {useGameStore} from "../../../store/game.js";

const gameStore = useGameStore();

export function getEnemiesByConfig(config) {
    switch (config.type) {
        case 'random_battle':
            return getRandomEnemies(config)
    }

    return []
}

function generateEnemyTeamLevels(playerCreatures, battleSize) {
    // 1. Проверка крайних случаев
    if (playerCreatures.length === 0) return Array(battleSize).fill(1);

    // 2. Выбор репрезентативных существ игрока
    const validCreatures = playerCreatures.filter(c => c.level > 0);
    const sortedCreatures = [...validCreatures].sort((a, b) => b.level - a.level);

    // 3. Расчет силы команды игрока
    const playerPower = calculatePlayerPower(sortedCreatures, battleSize);

    // 4. Определение базового уровня противника
    const baseLevel = Math.min(20, Math.max(1, Math.round(playerPower)));

    // 5. Генерация уровней команды противника
    return generateTeamLevels(baseLevel, battleSize);
}

// Расчет силы команды игрока
function calculatePlayerPower(creatures, battleSize) {
    // Берем топ-N существ игрока
    const topCreatures = creatures.slice(0, battleSize);

    // Если у игрока меньше существ, чем нужно для боя
    if (topCreatures.length < battleSize) {
        const filledCreatures = [
            ...topCreatures,
            ...Array(battleSize - topCreatures.length).fill({level: 1})
        ];
        return filledCreatures.reduce((sum, c) => sum + c.level, 0) / battleSize;
    }

    // Средний уровень топовых существ
    const avgLevel = topCreatures.reduce((sum, c) => sum + c.level, 0) / battleSize;

    // Учет прогресса игрока (макс. уровень существа)
    const maxLevel = Math.max(...creatures.map(c => c.level));
    const progressFactor = 1 + (maxLevel - 5) * 0.05;

    // Учет опыта игрока (общее кол-во существ)
    const countFactor = 1 + Math.min(0.3, creatures.length * 0.01);

    // Учет сложности режима
    const sizeFactor = 1 + (battleSize - 1) * 0.05;

    return avgLevel * progressFactor * countFactor * sizeFactor;
}

// Генерация уровней команды
function generateTeamLevels(baseLevel, size) {
    const levels = [];
    const teamPower = baseLevel * size;
    let remainingPower = teamPower;

    // Распределение уровней
    for (let i = 0; i < size; i++) {
        const maxPossible = Math.min(9, remainingPower - (size - i - 1));
        const minPossible = Math.max(1, remainingPower - 9 * (size - i - 1));

        // Весовое распределение: первые существа сильнее
        const weight = (size - i) / (size * (size + 1) / 2);
        const weightedLevel = Math.round(minPossible + weight * (maxPossible - minPossible));

        // Добавление случайности
        const level = Math.max(minPossible, Math.min(maxPossible,
            weightedLevel + Math.floor(Math.random() * 3) - 1));

        levels.push(level);
        remainingPower -= level;
    }

    // Перемешивание для разнообразия
    return levels;
}


function getRandomEnemies(config) {
    const levels = generateEnemyTeamLevels(gameStore.creatures, config.limit)
    const creatures = generateEmotions(config.limit).map((emotion, i) => {
        return createNewCreature(randomElement(), randomShape(), emotion, levels[i])
    })

    shuffleArray(creatures)

    return getTeam2('left', new MediumAI(), creatures)
}

function createNewCreature(element, shape, emotion, level) {

    let newCreature = Object.assign({}, creaturesLib[element + '-' + shape + '-' + emotion])

    // Присваиваем рандомный ИД
    newCreature.id = crypto.randomUUID();
    newCreature.level = level;

    const diffs = {
        rage: {
            baseMaxHealthStat: 15,
            baseAttackStat: 10,
            baseDefenseStat: 20,
            baseWillStat: 10,
            baseInitiativeStat: 20,
            baseSpeedStat: 0,
            baseMaxPP: 1,
            basePpRegen: 1,
        },
        passion: {
            baseMaxHealthStat: 10,
            baseAttackStat: 5,
            baseDefenseStat: 5,
            baseWillStat: 15,
            baseInitiativeStat: 20,
            baseSpeedStat: 0,
            baseMaxPP: 1,
            basePpRegen: 1,
        },
        hope: {
            baseMaxHealthStat: 10,
            baseAttackStat: 10,
            baseDefenseStat: 15,
            baseWillStat: 30,
            baseInitiativeStat: 20,
            baseSpeedStat: 0,
            baseMaxPP: 2,
            basePpRegen: 1,
        }
    }[newCreature.emotion]

    let winrate = 0
    let enemyWinrateMultiplier = 1
    if (gameStore.last5BattleResults.length !== 0) {
        const wins = gameStore.last5BattleResults.filter(result => result).length;
        winrate = wins / gameStore.last5BattleResults.length;
    }
    if (winrate > 0.7) {
        enemyWinrateMultiplier = 1.15
    } else if (winrate < 0.4) {
        enemyWinrateMultiplier = 0.85 //1972
    }
    
    for (let prop in diffs) {
        if (newCreature.hasOwnProperty(prop)) {
            const diffValue = diffs[prop];
            if (diffValue === 0) {
                continue
            }

            // Генерируем случайное число в диапазоне [-diffValue; +diffValue]
            const randomOffset = Math.floor(Math.random() * (2 * diffValue + 1)) - diffValue;

            // Применяем смещение
            newCreature[prop] += randomOffset;
            
            // Тк у соперника нет возможности ручной прокачки, мы ему вкинем это в базовые статы.
            // А бонус зависит от процента побед игрока.
            newCreature[prop] = Math.round(newCreature[prop] * enemyWinrateMultiplier)
        }
    }

    newCreature = calcCreatureStats(newCreature)
    newCreature.actions = getActionsByLevel(
        element,
        shape,
        emotion,
        level
    )

    return newCreature
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

function randomEmotion() {
    return ['rage', 'passion', 'hope'][Math.floor(Math.random() * 3)];
}

function generateEmotions(limit) {
    // Начальные веса: rage самый высокий, hope самый низкий
    const weights = {
        rage: 10,
        passion: 5,
        hope: 3
    };

    // Минимальный вес для предотвращения нулевых значений
    const minWeight = 0.5;

    // Коэффициент уменьшения веса после выбора
    const decayFactor = 0.7;

    const result = [];

    for (let i = 0; i < limit; i++) {
        // Рассчитываем общий вес
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

        // Случайный выбор с учетом весов
        const random = Math.random() * totalWeight;

        let current = 0;
        let selected;

        // Выбираем эмоцию на основе весов
        for (const [emotion, weight] of Object.entries(weights)) {
            current += weight;
            if (random <= current) {
                selected = emotion;
                break;
            }
        }

        result.push(selected);

        // Уменьшаем вес выбранной эмоции
        weights[selected] = Math.max(minWeight, weights[selected] * decayFactor);
    }

    return result;
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