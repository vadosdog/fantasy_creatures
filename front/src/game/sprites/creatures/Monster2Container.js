import {CreatureAPI} from "../../classes/battle/Creature.js";
import Monster2 from "./Monster2.js";
import {useBattleStore} from "../../../store/battle.js";

const battleStore = useBattleStore()

export default class Monster2Container extends Phaser.GameObjects.Container {
    creatureSprite
    creature
    creatureText

    constructor(creature, scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);

        this.creature = creature;
        this.defaultDirection = creature.direction === 'left' ? 'stand_left' : 'stand_right';

        // Создаем анимированную карточку
        this.creatureSprite = new Monster2(
            creature.texture,
            scene,
            0,
            0,
            this.defaultDirection
        );

        this.add(this.creatureSprite);
        this.setupEventHandlers();
        this.createGlowSprite();
        this.createCreatureText();
    }

    setupEventHandlers() {
        // Обработка завершения смерти
        this.creatureSprite.on('deathComplete', () => {
            this.destroy();
        });
    }

    createGlowSprite() {
        this.glowSprite = this.scene.add.sprite(0, 0, 'glowTexture')
            .setVisible(false)
            .setTint(0xFFD900)
            .setAlpha(0.8);

        this.glowSprite.setDisplaySize(
            this.creatureSprite.width * 0.25,
            this.creatureSprite.height * 0.25
        );

        this.addAt(this.glowSprite, 0);
    }

    createCreatureText() {
        this.creatureText = this.scene.add.text(
            0,
            12,
            `${this.creature.name}\n${Math.ceil(this.creature.health)}/${CreatureAPI.getMaxHealth(this.creature)}`,
            {
                fontFamily: "arial",
                fontSize: "11px",
                align: "center"
            }
        ).setOrigin(0.5, 0);

        this.add(this.creatureText);
    }

    setMonsterState(newState) {
        this.creatureSprite.setMonsterState(newState);
    }

    setMonsterActive(active) {
        // Выставляем свечение для активного существа
        this.glowSprite.setVisible(active);
    }

    setDefaultState() {
        this.creatureSprite.setDefaultState()
    }

    updateVisual() {
        this.creatureText.setText(
            `${this.creature.name}\n${Math.ceil(this.creature.health)}/${CreatureAPI.getMaxHealth(this.creature)}`
        );
    }

    // Можно добавить метод для обновления позиции или логики
    update(time, delta) {
        // Логика движения или состояния
    }

    playActionText(text, color) {
        let actionText = this.scene.add.text(
            0,
            12,
            text,
            {
                fontFamily: "arial",
                fontSize: "16px",
                fontWeight: "bold",
                align: "center",
                color
            }
        )
        actionText.x = this.creatureText.x - (this.creatureText.width / 2)
        this.add(actionText)

        this.scene.tweens.add({
            targets: actionText,
            y: actionText.y - 40,
            alpha: 0,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                actionText.destroy(); // удаляем текст после анимации
            }
        });
    }

    updateEffectsIcons() {
        // Удаляем старые иконки эффектов
        this.effectIcons?.forEach(icon => icon.destroy());
        this.effectIcons = [];

        // Если у существа нет эффектов - выходим
        if (!this.creature?.effects?.length) return;

        // Эмодзи для эффектов (бафы и дебафы)
        const effectEmojis = {
            // Бафы
            'empower': '💪',
            'haste': '⚡',
            'luck': '🍀',
            'regen': '💚',
            'thorns': '🌵',
            'aegis': '🛡️',
            'defense': '🛡️', // можно какой-то другой

            // Дебафы
            'poison': '☠️',
            'bleed': '💉',
            'burn': '🔥',
            'freeze': '🥶',
            'chill': '❄️',
            'blind': '👁️‍🗨️',
            'curse': '📛',
            'madness': '🤪',
            'fear': '😱',
            'confusion': '😖' // нужно какой-то другой
        };

        // Создаем новые иконки
        const iconSize = 10; // Размер иконки
        const padding = 5;   // Отступ между иконками
        let offsetX = -20;     // Смещение по X

        this.creature.effects.forEach((effect, i) => {
            const emoji = effectEmojis[effect.effect];
            if (!emoji) return; // Пропускаем неизвестные эффекты

            // Создаем текстовый объект для эмодзи
            const icon = this.scene.add.text(
                offsetX + i % 4 * (iconSize + padding),
                -30 + Math.floor(i / 4) * (iconSize + padding), // Размещаем над существом
                emoji,
                {
                    fontSize: iconSize + 'px',
                    padding: {x: 2, y: 2}
                }
            ).setOrigin(0.5);

            // Добавляем иконку в контейнер
            this.add(icon);
            this.effectIcons.push(icon);
        });
    }

    // Метод для визуального выделения
    setHovered(isHighlighted) {
        if (isHighlighted) {
            battleStore.setHoveredCreature(this.creature.id)
            this.creatureSprite.setTint(0xffff00);
        } else {
            this.creatureSprite.clearTint();
            battleStore.setHoveredCreature(null);
        }
    }
}
