// Класс который подбирает соперников
import {creaturesLib, getActionsByLevel, getCreature, getTeam2} from "../../../database/creaturesLib.js";
import {MediumAI} from "./AI/MediumAI.js";
import {calcCreatureStats} from "./Creature.js";

export function getEnemiesByConfig(config) {
    switch (config.type) {
        case 'random_battle':
            return getRandomEnemies(config)
    }
    
    return []
}

function getRandomEnemies(config) {
    const creatures = generateEmotions(config.limit).map(emotion => {
        return createNewCreature(randomElement(), randomShape(), emotion, 1)
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