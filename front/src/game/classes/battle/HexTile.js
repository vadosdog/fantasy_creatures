export class HexTile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}, posX, posY) {
        const {
            width = null,
            height = null,
            orientation = 'pointy', // 'pointy' или 'flat'
        } = options;

        let radius = 30; // по умолчанию

        if (width !== null && height !== null) {
            console.warn('Укажите либо width, либо height, но не оба');
        }

        const sqrt3 = Math.sqrt(3);

        if (width !== null) {
            // Расчёт радиуса через ширину
            if (orientation === 'pointy') {
                radius = width / 2;
            } else {
                radius = (width / 2) * sqrt3 / 2;
            }
        } else if (height !== null) {
            // Расчёт радиуса через высоту
            if (orientation === 'pointy') {
                radius = height / sqrt3;
            } else {
                radius = height / 2;
            }
        }

        super(scene, x, y);
        scene.add.existing(this);

        this.radius = radius;
        this.orientation = orientation;
        this.state = null;

        // Основа гекса
        this.hexBase = scene.add.graphics();
        this.add(this.hexBase);

        // Контейнер для иконок и эффектов
        this.overlay = scene.add.container(0, 0);
        this.add(this.overlay);

        // События
        this.setInteractive(new Phaser.Geom.Polygon(this.getHexPoints()), Phaser.Geom.Polygon.Contains);
        this.on('pointerover', () => this.onHover(true));
        this.on('pointerout', () => this.onHover(false));
        this.on('pointerdown', () => this.onClick());

        this.posX = posX;
        this.posY = posY;

        // Применяем начальный стиль
        this.applyBaseStyle();
    }    
    // Исправленный метод - теперь возвращает локальные координаты
    getHexPoints() {
        const points = [];
        const angleOffset = this.orientation === 'pointy' ? -Math.PI / 6 : 0;

        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i + angleOffset;
            points.push({
                x: this.radius * Math.cos(angle), // Локальная координата X
                y: this.radius * Math.sin(angle)  // Локальная координата Y
            });
        }
        return points;
    }

    setHexState(state) {
        this.state = state;
        this.clearEffects();
        this.applyBaseStyle();
        this.applyStateStyles();
    }

    clearEffects() {
        this.overlay.removeAll(true);
        this.scene.tweens.killTweensOf(this); // Останавливаем все анимации
        this.hexBase.clear();
    }

    applyBaseStyle() {
        this.hexBase.fillStyle(0x000000, 0);
        this.hexBase.fillPoints(this.getHexPoints(), true);
        this.hexBase.lineStyle(2, 0xffffff, 1);
        this.hexBase.strokePoints(this.getHexPoints(), true);
    }

    applyStateStyles() {
        switch (this.state) {
            case 'blocked':
            case 'normal':
            case 'inactive':
                this.applyBlockedState();
                break;
            case 'moveable':
                this.applyMoveableState();
                break;
            case 'active':
            case 'selected':
                this.applyActiveState();
                break;
            case 'ally_unbuffable':
                this.applyAllyUnbuffableState();
                break;
            case 'ally_buffable':
            case 'treat':
                this.applyAllyBuffableState();
                break;
            case 'enemy_attackable':
            case 'attackable':
                this.applyEnemyAttackableState();
                break;
            case 'enemy_blocked':
                this.applyEnemyBlockedState();
                break;
        }
    }

    onHover(isOver) {
        if (isOver) {
            this.applyHoverEffect();
        } else {
            this.removeHoverEffect();
        }
    }

    onClick() {
        this.applyClickEffect();
    }

    // —————————————————————
    // 🎨 Методы для анимаций цвета
    // —————————————————————

    animateColor(baseColor, glowColor, duration = 2000, repeat = -1) {
        // Основной цвет гекса
        const baseRGB = Phaser.Display.Color.ValueToColor(baseColor);
        const baseHex = Phaser.Display.Color.RGBToString(baseRGB.red, baseRGB.green, baseRGB.blue);

        // Цвет свечения
        const glowRGB = Phaser.Display.Color.ValueToColor(glowColor);

        // Создаем отдельный Graphics для свечения
        if (!this.glowBase) {
            this.glowBase = this.scene.add.graphics();
            this.add(this.glowBase);
        }

        // Анимация прозрачности свечения
        this.colorTween = this.scene.tweens.add({
            targets: { alphaValue: 0 },
            alphaValue: { from: 0, to: 0.6 },
            ease: 'Sine.InOut',
            duration,
            repeat,
            yoyo: true,
            onUpdate: (tween) => {
                const currentAlpha = tween.targets[0].alphaValue; // ✅ Исправлено: используем targets[0]

                // Основной гекс (не меняется)
                this.hexBase.clear();
                this.hexBase.fillStyle(parseInt(baseHex.replace('#', '0x'), 16), this.currentAlpha || 1);
                this.hexBase.fillPoints(this.getHexPoints(), true);
                this.hexBase.lineStyle(2, this.borderColor || 0xffffff, 1);
                this.hexBase.strokePoints(this.getHexPoints(), true);

                // Свечение
                this.glowBase.clear();
                this.glowBase.fillStyle(glowColor, currentAlpha);
                this.glowBase.fillPoints(this.getHexPoints(), true);
            }
        });
    }
    stopColorAnimation() {
        if (this.colorTween) {
            this.colorTween.stop();
            this.colorTween = null;
        }
    }

    // —————————————————————
    // 🧩 Состояния
    // —————————————————————

    applyBlockedState() {
        this.hexBase.clear();
        this.hexBase.fillStyle(0x0C1017, 0.7);
        this.hexBase.fillPoints(this.getHexPoints(), true);
        this.hexBase.lineStyle(2, 0x8B0000, 1);
        this.hexBase.strokePoints(this.getHexPoints(), true);
    }

    applyMoveableState() {
        this.currentAlpha = 0.4;
        this.borderColor = 0x3baaf6;
        this.animateColor(0x192850, 0x3a60a0, 1000, -1);
    }

    applyActiveState() {
        this.hexBase.clear();
        this.hexBase.fillStyle(0xC34FFC, 1);
        this.hexBase.fillPoints(this.getHexPoints(), true);
        this.hexBase.lineStyle(4, 0xC34FFC, 1);
        this.hexBase.strokePoints(this.getHexPoints(), true);
        this.hexBase.lineStyle(2, 0x66C7FF, 1);
        this.hexBase.strokePoints(this.getHexPoints(), true, 0, 4); // Внешняя линия

        // Частицы рун (пример)
        const rune = this.scene.add.sprite(0, -this.radius + 5, 'rune_texture');
        rune.setScale(0.5);
        this.overlay.add(rune);
        this.scene.tweens.add({
            targets: rune,
            y: rune.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    applyAllyUnbuffableState() {
        this.hexBase.clear();
        this.hexBase.fillStyle(0x2A1E40, 1);
        this.hexBase.fillPoints(this.getHexPoints(), true);
        this.hexBase.lineStyle(2, 0x666666, 1);
        this.hexBase.strokePoints(this.getHexPoints(), true);

        // Иконка щита с трещиной
        const shield = this.scene.add.sprite(0, 0, 'shield_cracked');
        shield.setAlpha(0.5);
        this.overlay.add(shield);
    }

    applyAllyBuffableState() {
        this.currentAlpha = 0.3;
        this.borderColor = 0x8B45C1;
        this.animateColor(0xC34FFC, 0x9933FF, 700, -1);

        const shield = this.scene.add.sprite(0, 0, 'shield_icon');
        shield.setScale(0.5);
        this.overlay.add(shield);
    }

    applyEnemyAttackableState() {
        this.currentAlpha = 0.4;
        this.borderColor = 0xF05050;
        this.animateColor(0xF05050, 0xFF7070, 600, -1);
    }

    applyEnemyBlockedState() {
        this.hexBase.clear();
        this.hexBase.fillStyle(0x400000, 0.6);
        this.hexBase.fillPoints(this.getHexPoints(), true);
        this.hexBase.lineStyle(2, 0x220000, 1);
        this.hexBase.strokePoints(this.getHexPoints(), true);

        // Перечеркнутый меч (иконка)
        const sword = this.scene.add.sprite(0, 0, 'crossed_sword');
        sword.setAlpha(0.5);
        this.overlay.add(sword);
    }

    // —————————————————————
    // 🖱️ Эффекты
    // —————————————————————

    applyHoverEffect() {
        this.currentAlpha = 0.6;
        this.borderColor = 0x3baaf6;
        this.animateColor(0x3a60a0, 0x5080c0, 1000, -1);
    }

    removeHoverEffect() {
        this.stopColorAnimation();
        this.setHexState(this.state); // Восстановить состояние
    }

    applyClickEffect() {
        this.currentAlpha = 0.8;
        this.borderColor = 0x66C7FF;
        this.animateColor(0x66C7FF, 0xffffff, 150, 0);
        this.scene.time.delayedCall(150, () => {
            this.setHexState(this.state);
        });
    }
}