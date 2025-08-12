// Класс который подбирает соперников
import {creaturesLib, getActionsByLevel, getCreature, getTeam2} from "../../../database/creaturesLib.js";
import {MediumAI} from "./AI/MediumAI.js";
import {calcCreatureStats} from "./Creature.js";
import {useGameStore} from "../../../store/game.js";
import {HardAI} from "./AI/HardAI.js";

const gameStore = useGameStore();

export function getEnemiesByConfig(config) {
    switch (config.type) {
        case 'random_battle':
            return getRandomEnemies(config)
        case 'exploration_battle':
            return getExplorationEnemies(config)
    }

    return []
}

// Функция которая подстраивает силу существ под игрока
function generateEnemyTeamLevels(playerCreatures, battleSize, levelLimit) {
    // 1. Проверка крайних случаев
    if (playerCreatures.length === 0) return Array(battleSize).fill(1);

    // 2. Выбор репрезентативных существ игрока
    const validCreatures = playerCreatures.filter(c => c.level > 0);
    const sortedCreatures = [...validCreatures].sort((a, b) => b.level - a.level);

    // 3. Расчет силы команды игрока
    const playerPower = calculatePlayerPower(sortedCreatures, battleSize, levelLimit);

    // 4. Определение базового уровня противника
    const baseLevel = Math.min(20, Math.max(1, Math.round(playerPower)));

    // 5. Генерация уровней команды противника
    return generateTeamLevels(baseLevel, battleSize, levelLimit);
}

// Расчет силы команды игрока
function calculatePlayerPower(creatures, battleSize, levelLimit) {
    // Берем топ-N существ игрока (в рамках лимита)
    const topCreatures = creatures.filter(c => c.level <= levelLimit).slice(0, battleSize);

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

    return Math.min(avgLevel * progressFactor * countFactor * sizeFactor, 9); //TODO исправить после добавления эволюций
}

// Генерация уровней команды
function generateTeamLevels(baseLevel, size, levelLimit = 9) {
    const levels = [];
    let remainingPower = baseLevel * size;

    // Распределение уровней
    for (let i = 0; i < size; i++) {
        const maxPossible = Math.min(levelLimit, remainingPower - (size - i - 1));//TODO исправить после добавления эволюций
        const minPossible = Math.max(1, remainingPower - levelLimit * (size - i - 1));//TODO исправить после добавления эволюций

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


function getRandomEnemies({count, levelLimit}) {
    const levels = generateEnemyTeamLevels(gameStore.creatures, count, levelLimit)
    const creatures = levels.map(level => createNewCreature(randomElement(), randomShape(), randomEmotion(), level))

    shuffleArray(creatures)

    return getTeam2('left', new HardAI(), creatures)
}

function getRandomInt([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getComposition(config = []) {
    const result = []
    config.forEach(item => {
        let count = 1
        if (item.count) {
            count = getRandomInt(item.count)
        }
        for (let i = 0; i < count; i++) {
            const preset = Object.assign({}, item)
            if (preset.level) {
                preset.level = getRandomInt(preset.level)
            }
            result.push(preset)
        }
    })
    return result
}

// Создает команду случайного размера и случайных уровней (в границах конфига)
function getExplorationEnemies(config) {
    const size = getRandomInt(config.enemyCount)
    const levels = []
    for (let i = 0; i < size; i++) {
        levels.push(getRandomInt(config.enemyLevel))
    }
    const composition = getComposition(config.composition)

    const creatures = levels.map((level, i) => {
        const preset = ((composition[i]) || {});
        const element = preset.element || randomElement(config.dominantElement ? [config.dominantElement] : []);
        const shape = preset.shape || randomShape(config.dominantShape ? [config.dominantShape] : []);
        const emotion = preset.emotion || randomEmotion(config.dominantEmotion ? [config.dominantEmotion] : []);
        let rarity = preset.rarity || 'common'
        if (rarity === 'epic' || rarity === 'legendary') {
            rarity = 'rare'
        }

        if (preset.level) {
            level = preset.level
        }
        
        return createNewCreature(element, shape, emotion, level, rarity)
    })
    shuffleArray(creatures)

    return getTeam2('left', new HardAI(), creatures)
}

function createNewCreature(element, shape, emotion, level, rarity = 'common') {

    let newCreature = Object.assign({}, creaturesLib[element + '-' + shape + '-' + emotion + '-' + rarity])

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

function randomEmotion(chances = []) {
    return randomByChances(chances, ['rage', 'passion', 'hope']);
}

function generateEmotions(limit) {
    // Сбалансированные начальные веса
    const weights = {
        rage: 6,
        passion: 6,
        hope: 4
    };

    const minWeight = 0.5;
    const decayFactor = 0.65; // умеренное затухание

    const result = [];

    for (let i = 0; i < limit; i++) {
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        const random = Math.random() * totalWeight;

        let current = 0;
        let selected = null;

        for (const [emotion, weight] of Object.entries(weights)) {
            current += weight;
            if (random <= current) {
                selected = emotion;
                break;
            }
        }

        if (!selected) selected = Object.keys(weights)[0]; // fallback

        result.push(selected);

        // Уменьшаем вес выбранной эмоции
        weights[selected] = Math.max(minWeight, weights[selected] * decayFactor);
    }

    return result;
}

function randomShape(chances = []) {
    return randomByChances(chances, ['beast', 'bird', 'reptile']);
}

function randomElement(chances = []) {
    return randomByChances(chances, ['fire', 'water', 'grass']);
}

function randomByChances(config = [], allElements) {
    // Если конфиг пустой, возвращаем случайный элемент с равной вероятностью
    if (!config || config.length === 0) {
        return allElements[Math.floor(Math.random() * allElements.length)];
    }

    // Создаём карту шансов из конфига
    const chanceMap = new Map();
    let totalSpecifiedChance = 0;

    config.forEach(({ element, chance }) => {
        if (allElements.includes(element)) {
            chanceMap.set(element, chance);
            totalSpecifiedChance += chance;
        }
    });

    // Проверка: сумма шансов не должна превышать 1
    if (totalSpecifiedChance > 1) {
        console.error('Сумма шансов не может превышать 1');
        return allElements[Math.floor(Math.random() * allElements.length)];
    }

    // Элементы, которые не указаны в конфиге
    const unspecifiedElements = allElements.filter(el => !chanceMap.has(el));
    const remainingChance = 1 - totalSpecifiedChance;
    const distributedChance = unspecifiedElements.length > 0
        ? remainingChance / unspecifiedElements.length
        : 0;

    // Формируем финальные вероятности
    const probabilities = allElements.map(element => {
        const chance = chanceMap.has(element)
            ? chanceMap.get(element)
            : distributedChance;
        return { element, chance };
    });

    // Выбираем случайный элемент по вероятностям
    const rand = Math.random();
    let cumulative = 0;

    for (const { element, chance } of probabilities) {
        cumulative += chance;
        if (rand < cumulative) {
            return element;
        }
    }

    // На случай погрешности (например, из-за float)
    return probabilities[probabilities.length - 1].element;
}