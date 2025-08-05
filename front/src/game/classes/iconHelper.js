// src/assets/icons/iconHelper.js

const ICON_PATH = './assets/icons';

// Иконки эффектов
const EFFECT_ICONS = {
    empower: 'upgrade.png',
    haste: 'wingfoot.png',
    luck: 'clover.png',
    regen: 'heart-plus.png',
    thorns: 'spiked-tail.png',
    aegis: 'armor-upgrade.png',
    defense: 'armor-upgrade.png',
    poison: 'death-juice.png',
    bleed: 'bleeding-wound.png',
    burn: 'flamer.png',
    freeze: 'snowflake-2.png',
    chill: 'sticky-boot.png',
    blind: 'sight-disabled.png',
    curse: 'cursed-star.png',
    taunt: 'duality-mask.png',
    madness: 'mouth-watering.png',
    fear: 'terror.png',
    confusion: 'knockout.png'
};

// Иконки элементов (включая цвет)
const ELEMENT_ICONS = {
    fire: 'flamer.png',
    water: 'drop.png',
    grass: 'three-leaves.png'
};

// Иконки форм
const SHAPE_ICONS = {
    beast: 'flat-paw-print.png',
    bird: 'feather.png',
    reptile: 'poison.png'
};

// Иконки эмоций
const EMOTION_ICONS = {
    rage: 'fist.png',
    hope: 'cross-flare.png',
    passion: 'horned-reptile.png'
};

// Вспомогательная функция для формирования пути
const getIconPath = (iconName) => {
    return `${ICON_PATH}/${iconName}`
};

// Экспортируем функции для получения путей
export const getEffectIcon = (effectName) => {
    return EFFECT_ICONS[effectName] ? getIconPath(EFFECT_ICONS[effectName]) : null
};

export const getElementIcon = (elementName) => ELEMENT_ICONS[elementName] ? getIconPath(ELEMENT_ICONS[elementName]) : null;

export const getShapeIcon = (shapeName) => SHAPE_ICONS[shapeName] ? getIconPath(SHAPE_ICONS[shapeName]) : null;

export const getEmotionIcon = (emotionName) => EMOTION_ICONS[emotionName] ? getIconPath(EMOTION_ICONS[emotionName]) : null;