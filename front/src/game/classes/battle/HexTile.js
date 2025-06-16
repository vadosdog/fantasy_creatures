export class HexTile extends Phaser.GameObjects.Container {
    static PULSE_DURATION = 5000; // Общая длительность пульсации для всех гексов
    static PULSE_X_MODIFIER = 150; // Смещение пульсации по горзонтали
    static PULSE_Y_MODIFIER = 25; // Смещение пульсации по вертикали
    static globalPulseStart = 0; // Глобальное время старта пульсации
    
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
        this.hexPoints = this.getHexPoints();

        // Основа гекса
        this.hexBase = scene.add.graphics();
        this.add(this.hexBase);

        // Контейнер для иконок и эффектов
        this.overlay = scene.add.container(0, 0);
        this.add(this.overlay);

        // События
        this.setInteractive(new Phaser.Geom.Polygon(this.hexPoints), Phaser.Geom.Polygon.Contains);
        this.on('pointerover', () => this.onHover(true));
        this.on('pointerout', () => this.onHover(false));
        this.on('pointerdown', () => this.onClick());

        this.posX = posX;
        this.posY = posY;

        // Применяем начальный стиль
        this.applyBaseStyle();

        // Инициализация пульсации
        this.isPulsating = false;
        this.pulseBaseColor = null;
        this.pulseGlowColor = null;
        this.currentAlpha = 1;
        this.borderColor = 0xffffff;
        this.isHover = false

        // Устанавливаем глобальное время старта при создании первого гекса
        if (HexTile.globalPulseStart === 0) {
            HexTile.globalPulseStart = scene.time.now;
        }
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
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, 0xffffff, 1);
        this.hexBase.strokePoints(this.hexPoints, true);
    }

    applyStateStyles() {
        // Останавливаем любую активную пульсацию перед сменой состояния
        this.stopSyncedPulse();

        switch (this.state) {
            case 'normal':
                this.applyNormalState();
                break
            case 'blocked':
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
    onHover(isHover) {
        this.isHover = isHover
        return
        if (isHover) {
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
                this.hexBase.fillPoints(this.hexPoints, true);
                this.hexBase.lineStyle(2, this.borderColor || 0xffffff, 1);
                this.hexBase.strokePoints(this.hexPoints, true);

                // Свечение
                this.glowBase.clear();
                this.glowBase.fillStyle(glowColor, currentAlpha);
                this.glowBase.fillPoints(this.hexPoints, true);
            }
        });
    }
    stopColorAnimation() {
        this.isPulsating = false;
        // Удаляем из списка обновления
        this.scene.events.off('update', this.updatePulse, this);

        if (this.glowBase) {
            this.glowBase.clear();
        }
    }

    // —————————————————————
    // 🧩 Состояния
    // —————————————————————
    applyNormalState() {
        this.stopSyncedPulse();
        this.hexBase.clear();
        this.hexBase.fillStyle(0x0C1017, 0.3);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, 0x8B0000, 0.3);
        this.hexBase.strokePoints(this.hexPoints, true);
    }
    applyBlockedState() {
        this.stopSyncedPulse();
        this.hexBase.clear();
        this.hexBase.fillStyle(0x0C1017, 0.7);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, 0x8B0000, 1);
        this.hexBase.strokePoints(this.hexPoints, true);
    }
    applyMoveableState() {
        this.currentAlpha = 0.4;
        this.borderColor = 0x3baaf6;
        this.startSyncedPulse(0x192850, 0x3a60a0);
    }

    applyActiveState() {
        this.stopSyncedPulse();
        this.hexBase.clear();
        this.hexBase.fillStyle(0xC34FFC, 1);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(4, 0xC34FFC, 1);
        this.hexBase.strokePoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, 0x66C7FF, 1);
    }

    applyAllyUnbuffableState() {
        this.stopSyncedPulse();
        this.hexBase.clear();
        this.hexBase.fillStyle(0x2A1E40, 1);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, 0x666666, 1);
        this.hexBase.strokePoints(this.hexPoints, true);

        const shield = this.scene.add.sprite(0, 0, 'shield_cracked');
        shield.setAlpha(0.5);
        this.overlay.add(shield);
    }

    applyAllyBuffableState() {
        this.currentAlpha = 0.3;
        this.borderColor = 0x8B45C1;
        this.startSyncedPulse(0xC34FFC, 0x9933FF);
    }

    applyEnemyAttackableState() {
        this.currentAlpha = 0.4;
        this.borderColor = 0xF05050;
        this.startSyncedPulse(0xF05050, 0xFF7070);
    }

    applyEnemyBlockedState() {
        this.stopSyncedPulse();
        this.hexBase.clear();
        this.hexBase.fillStyle(0x400000, 0.6);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, 0x220000, 1);
        this.hexBase.strokePoints(this.hexPoints, true);

        const sword = this.scene.add.sprite(0, 0, 'crossed_sword');
        sword.setAlpha(0.5);
        this.overlay.add(sword);
    }

    // —————————————————————
    // 🖱️ Эффекты
    // —————————————————————

    applyHoverEffect() {
        // Сохраняем текущее состояние пульсации
        this.wasPulsating = this.isPulsating;
        this.savedBaseColor = this.pulseBaseColor;
        this.savedGlowColor = this.pulseGlowColor;
        this.savedAlpha = this.currentAlpha;
        this.savedBorder = this.borderColor;

        // Останавливаем основную пульсацию
        this.stopSyncedPulse();

        // Применяем эффект ховера с синхронной пульсацией
        this.currentAlpha = 0.6;
        this.borderColor = 0x3baaf6;
        this.startSyncedPulse(0x3a60a0, 0x5080c0);
    }

    removeHoverEffect() {
        // Восстанавливаем исходное состояние
        this.stopSyncedPulse();

        if (this.wasPulsating) {
            this.currentAlpha = this.savedAlpha;
            this.borderColor = this.savedBorder;
            this.startSyncedPulse(this.savedBaseColor, this.savedGlowColor);
        } else {
            // Если не было пульсации, просто восстанавливаем состояние
            this.setHexState(this.state);
        }
    }

    applyClickEffect() {
        // Сохраняем текущее состояние
        this.wasPulsating = this.isPulsating;
        this.savedBaseColor = this.pulseBaseColor;
        this.savedGlowColor = this.pulseGlowColor;
        this.savedAlpha = this.currentAlpha;
        this.savedBorder = this.borderColor;

        // Останавливаем основную пульсацию
        this.stopSyncedPulse();

        // Быстрая анимация клика
        this.currentAlpha = 0.8;
        this.borderColor = 0x66C7FF;

        // Создаем временную графику для клика
        this.clickEffect = this.scene.add.graphics();
        this.add(this.clickEffect);

        this.clickEffect.fillStyle(0x66C7FF, 0.8);
        this.clickEffect.fillPoints(this.hexPoints, true);
        this.clickEffect.lineStyle(2, 0x66C7FF, 1);
        this.clickEffect.strokePoints(this.hexPoints, true);

        // Анимация исчезновения
        this.scene.tweens.add({
            targets: this.clickEffect,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                // Восстанавливаем исходное состояние
                if (this.clickEffect) {
                    this.clickEffect.destroy();
                    this.clickEffect = null;
                }

                if (this.wasPulsating) {
                    this.currentAlpha = this.savedAlpha;
                    this.borderColor = this.savedBorder;
                    this.startSyncedPulse(this.savedBaseColor, this.savedGlowColor);
                } else {
                    this.setHexState(this.state);
                }
            }
        });
    }

    // —————————————————————
    // 🎨 Синхронизированные методы анимации
    // —————————————————————
    startSyncedPulse(baseColor, glowColor) {
        this.isPulsating = true;
        this.pulseBaseColor = baseColor;
        this.pulseGlowColor = glowColor;

        // Создаем графику для свечения, если нужно
        if (!this.glowBase) {
            this.glowBase = this.scene.add.graphics();
            this.add(this.glowBase);
        }

        // Добавляем в список обновления сцены
        this.scene.events.on('update', this.updatePulse, this);
    }

    stopSyncedPulse() {
        this.isPulsating = false;
        // Удаляем из списка обновления
        this.scene.events.off('update', this.updatePulse, this);

        if (this.glowBase) {
            this.glowBase.clear();
        }
    }

    updatePulse() {
        if (!this.isPulsating) return;

        // Рассчитываем прогресс на основе глобального времени
        let elapsed = this.scene.time.now - HexTile.globalPulseStart;
        elapsed -= HexTile.PULSE_X_MODIFIER * this.posX + this.posY * HexTile.PULSE_Y_MODIFIER
        const progress = (elapsed % HexTile.PULSE_DURATION) / HexTile.PULSE_DURATION;
        let alphaValue = Math.abs(Math.sin(progress * Math.PI * 2)) * 0.3;
        if (this.isHover) {
            alphaValue += 0.6
        }

        // Основной цвет гекса
        const baseRGB = Phaser.Display.Color.ValueToColor(this.pulseBaseColor);
        const baseHex = Phaser.Display.Color.RGBToString(baseRGB.red, baseRGB.green, baseRGB.blue);

        // Обновляем графику
        this.hexBase.clear();
        this.hexBase.fillStyle(parseInt(baseHex.replace('#', '0x'), 16), this.currentAlpha || 1);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(2, this.borderColor, 1);
        this.hexBase.strokePoints(this.hexPoints, true);

        // Свечение
        this.glowBase.clear();
        this.glowBase.fillStyle(this.pulseGlowColor, alphaValue);
        this.glowBase.fillPoints(this.hexPoints, true);
    }
}