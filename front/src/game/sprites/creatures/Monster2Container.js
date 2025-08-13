import {CreatureAPI} from "../../classes/battle/Creature.js";
import Monster2 from "./Monster2.js";
import {useBattleStore} from "../../../store/battle.js";

const battleStore = useBattleStore()

export default class Monster2Container extends Phaser.GameObjects.Container {
    creatureSprite
    creature
    creatureText

    levelText
    levelShape
    healthBarBg
    healthBarFill

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
            -2, // Чутка опускаем
            this.defaultDirection
        );

        this.add(this.creatureSprite);
        this.setupEventHandlers();
        this.createGlowSprite();
        this.createCreatureText();

        this.updateDepth()
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
        const barWidth = 60;
        const barHeight = 8; // чуть выше для текста
        const barY = 16; // ниже спрайта

        // --- Health Bar: фон (чёрный) ---
        this.healthBarBg = this.scene.add.rectangle(0, barY, barWidth, barHeight, 0x000000)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x444444);

        // --- Текущее здоровье (зелёная полоса) ---
        this.healthBarFill = this.scene.add.rectangle(
            -barWidth / 2,
            barY,
            0,
            barHeight - 2,
            0x21BA45
        ).setOrigin(0, 0.5);

        // --- Добавляем полосы в контейнер ---
        this.add(this.healthBarBg);
        this.add(this.healthBarFill);

        // --- Уровень: фигура рядом с полосой слева ---
        const levelSize = 12;
        const levelX = -barWidth / 2 + levelSize; // вплотную к левому краю полосы
        const levelY = 4;

        let levelShape;

        switch (this.creature.emotion) {
            case 'hope':
                levelShape = this.scene.add.circle(levelX, levelY, levelSize, 0x64698e);

                levelShape.setOrigin(0.5);
                break;
            case 'passion':
                levelShape = this.scene.add.polygon(levelX, levelY, [
                    0, -levelSize - 4,
                    levelSize, levelSize - 4,
                    -levelSize, levelSize - 4
                ], 0xa1c7c6);
                levelShape.setOrigin(0);
                break;
            case 'range':
            default:
                levelShape = this.scene.add.polygon(levelX, levelY, [
                    0, -levelSize,
                    levelSize, 0,
                    0, levelSize,
                    -levelSize, 0
                ], 0xea768b);
                levelShape.setOrigin(0);
        }
        this.levelShape = levelShape;

        // --- Текст уровня (12px) ---
        this.levelText = this.scene.add.text(
            levelShape.x,
            levelShape.y,
            `${this.creature.level}`,
            {
                fontSize: '12px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.add(levelShape);
        this.add(this.levelText);

        // === Важно: сразу обновляем визуализацию (без анимации) ===
        this.updateVisual(true); // true = force, без анимации
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

    updateVisual(force = false) {
        const maxHealth = CreatureAPI.getMaxHealth(this.creature);
        const currentHealth = Math.max(0, Math.min(maxHealth, Math.ceil(this.creature.health)));
        const ratio = currentHealth / maxHealth;

        const barWidth = this.healthBarBg.width - 2;
        const targetWidth = barWidth * ratio;

        const targets = {
            width: targetWidth,
            fillColor: this.getHealthColor(ratio)
        };

        // Без анимации при первом вызове
        if (force) {
            this.healthBarFill.width = targetWidth;
            this.healthBarFill.setFillStyle(targets.fillColor);
        } else {
            this.scene.tweens.add({
                targets: this.healthBarFill,
                ...targets,
                duration: 200,
                ease: 'Linear'
            });
        }
    }

// Вспомогательная функция для цвета
    getHealthColor(ratio) {
        if (ratio > 0.6) return 0x21BA45;
        if (ratio > 0.3) return 0xF2C037;
        return 0xC10015;
    }

    playDamageHealEffect(amount, isHeal = false, isCrit = false) {
        const barWidth = this.healthBarBg.width - 2;
        const fullHealth = CreatureAPI.getMaxHealth(this.creature);
        const pxPerHealth = barWidth / fullHealth;

        if (isHeal) {
            amount = Math.min(amount, fullHealth - this.creature.health)
        } else {
            amount = Math.min(amount, this.creature.health)
        }

        const effectBar = this.scene.add.rectangle(
            this.healthBarFill.x + this.healthBarFill.width - (isHeal ? 0 : Math.abs(amount) * pxPerHealth),
            this.healthBarFill.y,
            Math.abs(amount) * pxPerHealth,
            this.healthBarFill.height,
            isHeal ? 0x00aaff : (isCrit ? 0xffcc00 : 0xff3333)
        ).setOrigin(0, 0.5);

        this.add(effectBar);

        if (isHeal) {
            // Хил: полоска появляется и плавно "врастает"
            effectBar.setAlpha(0);
            this.scene.tweens.add({
                targets: effectBar,
                alpha: 0.8,
                duration: 100,
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: effectBar,
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => effectBar.destroy()
                    });
                }
            });
        } else {
            // Урон: полоска "отваливается" влево
            this.scene.tweens.add({
                targets: effectBar,
                alpha: 0,
                duration: 800,
                ease: 'Power1',
                onComplete: () => {
                    effectBar.destroy();
                }
            });
        }
        this.updateVisual()
    }

    // Можно добавить метод для обновления позиции или логики
    update(time, delta) {
        // Логика движения или состояния
    }

    /**
     * Показывает текстовое действие (урон, хил, баф и т.д.) с иконкой эффекта (если указано)
     * @param {string} text - Текст для отображения (например, "15", "Промах")
     * @param {string} type - Тип действия: 'damage', 'crit', 'heal', 'buff', 'debuff', 'miss', 'energy'
     * @param {string|null} [effectName] - Название эффекта (например, 'burn', 'regen'), чтобы показать иконку
     */
    playActionText(text, type = 'damage', effectName = null) {
        // === Стили для текста ===
        const styles = {
            damage: {color: '#ff3333', stroke: '#1d1d1d', strokeThickness: 4, fontSize: '16px'},
            crit: {color: '#F2C037', stroke: '#332200', strokeThickness: 6, fontSize: '24px', fontWeight: 'bold'},
            heal: {color: '#00ff88', stroke: '#004422', strokeThickness: 4, fontSize: '16px'},
            buff: {color: '#66ccff', stroke: '#003366', strokeThickness: 4, fontSize: '16px'},
            debuff: {color: '#ff66ff', stroke: '#660066', strokeThickness: 4, fontSize: '16px'},
            energy: {color: '#ffffff', stroke: '#333333', strokeThickness: 4, fontSize: '16px'},
            miss: {color: '#aaaaaa', stroke: '#222222', strokeThickness: 4, fontSize: '16px', fontStyle: 'italic'}
        };
        const style = styles[type] || styles.damage;

        // === Глобальные координаты ===
        const worldX = this.x;
        const worldY = this.y;

        // === Создаём текст ===
        const actionText = this.scene.add.text(worldX, worldY - 25, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: style.fontSize,
            fontWeight: style.fontWeight || 'bold',
            fontStyle: style.fontStyle || 'normal',
            color: style.color,
            align: 'center',
            stroke: style.stroke,
            strokeThickness: style.strokeThickness,
            shadow: {offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true}
        }).setOrigin(0.5).setDepth(1000);

        // Масштабируем текст
        actionText.setScale(0.5);

        // === Иконка эффекта (если указано) ===
        let effectIcon = null;
        if (effectName) {
            // Маппинг: effectName → ключ текстуры
            const effectKeys = {
                'empower': 'effect_upgrade',
                'haste': 'effect_wingfoot',
                'luck': 'effect_clover',
                'regen': 'effect_heart-plus',
                'thorns': 'effect_spiked-tail',
                'aegis': 'effect_armor-upgrade',
                'defense': 'effect_armor-upgrade',
                'poison': 'effect_death-juice',
                'bleed': 'effect_bleeding-wound',
                'burn': 'effect_flamer',
                'freeze': 'effect_snowflake-2',
                'chill': 'effect_sticky-boot',
                'blind': 'effect_sight-disabled',
                'curse': 'effect_cursed-star',
                'taunt': 'effect_duality-mask',
                'madness': 'effect_mouth-watering',
                'fear': 'effect_terror',
                'confusion': 'effect_knockout'
            };

            const textureKey = effectKeys[effectName];
            if (textureKey && this.scene.textures.exists(textureKey)) {
                effectIcon = this.scene.add.image(20, -25, textureKey)
                    .setDisplaySize(16, 16) // размер иконки
                    .setOrigin(0.5)
                    .setAlpha(0)
                    .setDepth(1001); // чуть выше текста

                this.add(effectIcon); // добавляем в контейнер
            }
        }

        // === Управление активными текстами ===
        if (!this.activeTexts) this.activeTexts = [];
        this.activeTexts.push(actionText);
        if (effectIcon) this.activeTexts.push(effectIcon);

        // Удаление через 1200 мс
        this.scene.time.delayedCall(1200, () => {
            [actionText, effectIcon].forEach(obj => {
                if (obj && this.activeTexts.includes(obj)) {
                    const index = this.activeTexts.indexOf(obj);
                    if (index > -1) this.activeTexts.splice(index, 1);
                    obj.destroy();
                }
            });
        });

        // === Анимация ===
        const timeline = this.scene.add.timeline();

        // Этап 1: появление текста и иконки
        timeline.add({
            at: 0,
            run: () => {
                this.scene.tweens.add({
                    targets: actionText,
                    scale: 1.1,
                    y: actionText.y - 30,
                    alpha: 1,
                    duration: 700,
                    ease: 'Back.easeOut',
                    easeParams: [1.2]
                });

                if (effectIcon) {
                    this.scene.tweens.add({
                        targets: effectIcon,
                        alpha: 1,
                        y: effectIcon.y - 30,
                        scale: 1.2,
                        duration: 600,
                        ease: 'Power2'
                    });
                }
            }
        });

        // Этап 2: плавное исчезновение
        timeline.add({
            at: 700,
            run: () => {
                this.scene.tweens.add({
                    targets: actionText,
                    alpha: 0,
                    y: actionText.y - 35,
                    scale: 1.2,
                    duration: 500,
                    ease: 'Power2'
                });

                if (effectIcon) {
                    this.scene.tweens.add({
                        targets: effectIcon,
                        alpha: 0,
                        y: effectIcon.y - 35,
                        scale: 1.3,
                        duration: 500,
                        ease: 'Power2'
                    });
                }
            }
        });

        // Запуск анимации
        timeline.play();

        // === Особые эффекты для крита ===
        if (type === 'crit') {
            this.scene.tweens.add({
                targets: actionText,
                scale: {from: 1.1, to: 1.3},
                duration: 80,
                yoyo: true,
                repeat: 1,
                ease: 'Sine.easeInOut'
            });
        }

        // === Промах: чуть иначе ===
        if (type === 'miss' || type === 'energy') {
            this.scene.tweens.add({
                targets: actionText,
                y: actionText.y - 25,
                alpha: 0,
                duration: 800,
                delay: 200,
                ease: 'Power2'
            });
        }
    }

    updateEffectsIcons() {
        // Удаляем старые иконки эффектов
        this.effectIcons?.forEach(icon => icon.destroy());
        this.effectIcons = [];

        // Если у существа нет эффектов — выходим
        if (!this.creature?.effects?.length) return;

        // Маппинг: effectName → Phaser-ключ текстуры
        const effectKeys = {
            // Бафы
            'empower': 'effect_upgrade',
            'haste': 'effect_wingfoot',
            'luck': 'effect_clover',
            'regen': 'effect_heart-plus',
            'thorns': 'effect_spiked-tail',
            'aegis': 'effect_armor-upgrade',
            'defense': 'effect_armor-upgrade',

            // Дебафы
            'poison': 'effect_death-juice',
            'bleed': 'effect_bleeding-wound',
            'burn': 'effect_flamer',
            'freeze': 'effect_snowflake-2',
            'chill': 'effect_sticky-boot',
            'blind': 'effect_sight-disabled',
            'curse': 'effect_cursed-star',
            'taunt': 'effect_duality-mask',
            'madness': 'effect_mouth-watering',
            'fear': 'effect_terror',
            'confusion': 'effect_knockout'
        };

        // Параметры иконок
        const iconSize = 16;        // Размер иконки (в пикселях)
        const padding = 6;          // Отступ между иконками
        const maxPerRow = 4;        // Максимум иконок в строке

        // Позиция: над существом
        const startX = -((Math.min(this.creature.effects.length, maxPerRow) - 1) * (iconSize + padding)) / 2;
        const startY = -44;         // Немного выше существа

        // Создаём новые иконки
        this.creature.effects.forEach((effect, i) => {
            const key = effectKeys[effect.effect];
            if (!key || !this.scene.textures.exists(key)) {
                console.warn(`Texture not found for effect: ${effect.effect}`);
                return;
            }

            const row = Math.floor(i / maxPerRow);
            const col = i % maxPerRow;

            const x = startX + col * (iconSize + padding);
            const y = startY + row * (iconSize + padding);

            // Создаём изображение
            const icon = this.scene.add.image(x, y, key)
                .setDisplaySize(iconSize, iconSize)
                .setOrigin(0.5)
                .setDepth(this.depth + 1); // Поверх существа

            // Добавляем в контейнер
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

    updateDepth() {
        // Умножаем на большой шаг (например, 100), чтобы гарантировать порядок
        const baseDepth = this.creature.position[0] * 100 + ((this.creature.position[1] % 2) * 50) + this.creature.position[1];
        this.setDepth(baseDepth);
    }
}
