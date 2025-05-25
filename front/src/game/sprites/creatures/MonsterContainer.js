import Monster1 from "./Monster1.js";

export default class MonsterContainer extends Phaser.GameObjects.Container {
    creatureSprite
    creature
    creatureText

    constructor(creature, scene, x, y) {
        super(scene, x, y)
        scene.add.existing(this);

        this.creature = creature


        this.defaultDirection
        if (creature.direction === 'left') {
            this.defaultDirection = 'stand_left'
        } else {
            this.defaultDirection = 'stand_right'
        }


        this.creatureSprite = new Monster1(creature.texture, scene, 0, -20, this.defaultDirection);
        this.creatureSprite.setScale(1.7, 1.7)
        this.add(this.creatureSprite)
        this.creatureSprite.setDefaultState()

        this.creatureText = scene.add.text(
            0,
            12,
            creature.name + "\n" + Math.ceil(creature.health) + "/" + creature.getMaxHealth(),
            {
                fontFamily: "arial",
                fontSize: "11px",
                align: "center"
            }
        )
        this.creatureText.x = this.creatureText.x - (this.creatureText.width / 2)
        this.add(this.creatureText)
    }

    setMonsterState(newState) {
        this.creatureSprite.setMonsterState(newState)
    }

    setDefaultState() {
        this.creatureSprite.setDefaultState()
    }

    updateVisual() {
        this.creatureText.setText(this.creature.name + "\n" + this.creature.health + "/" + this.creature.getMaxHealth());
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
}
