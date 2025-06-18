import polygonClipping from 'polygon-clipping';

export const HEX_STATE_NORMAL = 'normal',
    HEX_STATE_INACTIVE = 'inactive',
    HEX_STATE_MOVEABLE = 'moveable',
    HEX_STATE_ATTACKABLE = 'attackable',
    HEX_STATE_TREATABLE = 'treat',
    HEX_STATE_SELECTED = 'selected'

const palette = {
    'normal': {
        'normal': {
            fillStyleColor: 0x0C1017,
            fillStyleAlpha: 0.3,
            lineStyleWidth: 2,
            lineStyleColor: 0x1A222D,
            lineStyleAlpha: 0.5,
        },
        'hover': {},
        'click': {}
    },

    // Недоступные для перемещения
    'inactive': {
        'normal': {
            fillStyleColor: 0x0C1017,
            fillStyleAlpha: 0.3,
            lineStyleWidth: 2,
            lineStyleColor: 0x8B0000,
            lineStyleAlpha: 0.7,
            texture: "stone_crack" // Текстура трещин
        },
        'hover': {},
        'click': {}
    },

    // Доступные для перемещения
    'moveable': {
        'normal': {
            fillStyleColor: 0x192850,
            fillStyleAlpha: 0.3,
            lineStyleWidth: 2,
            lineStyleColor: 0x3B82F6,
            lineStyleAlpha: 0.3,
            glowColor: 0x3B82F6,
            glowIntensity: 0.3
        },
        'hover': {
            fillStyleColor: 0x254B8F,
            fillStyleAlpha: 0.6,
            lineStyleWidth: 3,
            lineStyleColor: 0x66C7FF,
            lineStyleAlpha: 0.8,
            glowColor: 0x3B82F6,
            glowIntensity: 0.6,
            pulse: true // Анимация пульсации
        },
        'click': {
            fillStyleColor: 0x66C7FF,
            fillStyleAlpha: 0.8,
            lineStyleWidth: 4,
            lineStyleColor: 0xFFFFFF,
            lineStyleAlpha: 1,
            flash: true // Эффект вспышки
        }
    },

    // Враги доступные для атаки
    'attackable': {
        'normal': {
            fillStyleColor: 0xF05050,
            fillStyleAlpha: 0.3,
            lineStyleWidth: 2,
            lineStyleColor: 0xF05050,
            lineStyleAlpha: 0.4,
            glowColor: 0xFF7070,
            glowIntensity: 0.4
        },
        'hover': {
            fillStyleColor: 0xF05050,
            fillStyleAlpha: 0.4,
            lineStyleWidth: 3,
            lineStyleColor: 0xFF0000,
            lineStyleAlpha: 0.5,
            glowColor: 0xFF3030,
            glowIntensity: 0.7,
            shake: true // Анимация дрожания
        },
        'click': {
            fillStyleColor: 0xFF3030,
            fillStyleAlpha: 0.8,
            lineStyleWidth: 4,
            lineStyleColor: 0xFFFFFF,
            lineStyleAlpha: 1,
            splash: true // Эффект брызг
        }
    },

    // Союзники доступные для бафа
    'treat': {
        'normal': {
            fillStyleColor: 0xC34FFC,
            fillStyleAlpha: 0.3,
            lineStyleWidth: 2,
            lineStyleColor: 0x8B45C1,
            lineStyleAlpha: 0.5,
            glowColor: 0x9933FF,
            glowIntensity: 0.4
        },
        'hover': {
            fillStyleColor: 0xD36AFF,
            fillStyleAlpha: 0.5,
            lineStyleWidth: 3,
            lineStyleColor: 0xC34FFC,
            lineStyleAlpha: 0.8,
            glowColor: 0x8B45C1,
            glowIntensity: 0.7,
            float: true // Эффект левитации
        },
        'click': {
            fillStyleColor: 0xE080FF,
            fillStyleAlpha: 0.8,
            lineStyleWidth: 4,
            lineStyleColor: 0xFFFFFF,
            lineStyleAlpha: 1,
            particles: true // Фиолетовые частицы
        }
    },

    // Союзники недоступные для бафа
    'ally_unbuffable': {
        'normal': {
            fillStyleColor: 0x2A1E40,
            fillStyleAlpha: 1,
            lineStyleWidth: 2,
            lineStyleColor: 0x666666,
            lineStyleAlpha: 1,
            icon: "shield_crack" // Иконка щита с трещиной
        },
        'hover': {
            icon: "locked" // Иконка замка при наведении
        },
        'click': {}
    },

    // Враги недоступные для атаки
    'enemy_blocked': {
        'normal': {
            fillStyleColor: 0x400000,
            fillStyleAlpha: 0.6,
            lineStyleWidth: 2,
            lineStyleColor: 0x220000,
            lineStyleAlpha: 1,
            icon: "sword_crossed" // Перечеркнутый меч
        },
        'hover': {
            filter: "grayscale" // Ч/б фильтр
        },
        'click': {}
    },

    // Активное существо (выбранное)
    'selected': {
        'normal': {
            fillStyleColor: 0xC34FFC,
            fillStyleAlpha: 0.2,
            lineStyleWidth: 4,
            lineStyleColor: 0x66C7FF,
            lineStyleAlpha: 1,
            innerGlow: 0xC34FFC, // Внутренняя обводка
            outerGlow: 0x66C7FF,  // Внешняя обводка
            particles: "rune"     // Парящие руны
        },
        'hover': {},
        'click': {}
    }
};

export const ATTACK_DIRECTION = {
    NE: 0,
    E: 1,
    SE: 2,
    SW: 3,
    W: 4,
    NW: 5
};

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
        // this.setInteractive(new Phaser.Geom.Polygon(this.hexPoints), Phaser.Geom.Polygon.Contains);
        this.updateInteractive();
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

        this.creatureHitArea = null; // Добавляем поле для хранения хитовой области монстра
        this.creature = null; // Ссылка на контейнер с монстром
        this.creatureHighlighted = false; // Флаг, что существо подсвечено
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

    applyStateStyles(style = 'normal') {
        const statePalette = (palette[this.state] || palette[HEX_STATE_NORMAL])[style]
        if (Object.values(statePalette).length === 0) {
            return;
        }

        this.stopSyncedPulse();
        this.hexBase.clear();
        this.hexBase.fillStyle(statePalette.fillStyleColor, statePalette.fillStyleAlpha);
        this.hexBase.fillPoints(this.hexPoints, true);
        this.hexBase.lineStyle(statePalette.lineStyleWidth, statePalette.lineStyleColor, statePalette.lineStyleAlpha);
        this.hexBase.strokePoints(this.hexPoints, true)

        if (statePalette.glowColor) {
            this.currentAlpha = statePalette.fillStyleAlpha;
            this.borderColor = statePalette.lineStyleColor;
            this.startSyncedPulse(statePalette.fillStyleColor, statePalette.glowColor);
        }

        return
        switch (this.state) {
            case HEX_STATE_NORMAL:
                this.applyNormalState();
                break
            case HEX_STATE_INACTIVE:
                this.applyBlockedState();
                break;
            case HEX_STATE_MOVEABLE:
                this.applyMoveableState();
                break;
            case 'active':
            case HEX_STATE_SELECTED:
                this.applyActiveState();
                break;
            case 'ally_unbuffable':
                this.applyAllyUnbuffableState();
                break;
            case 'ally_buffable':
            case HEX_STATE_TREATABLE:
                this.applyAllyBuffableState();
                break;
            case 'enemy_attackable':
            case HEX_STATE_ATTACKABLE:
                this.applyEnemyAttackableState();
                break;
            case 'enemy_blocked':
                this.applyEnemyBlockedState();
                break;
        }
    }

    onHover(isHover) {
        this.isHover = isHover;

        if (isHover) {
            this.applyHoverEffect();

            // Подсвечиваем существо при наведении
            if (this.creature) {
                this.creature.setHovered(true);
            }
        } else {
            this.removeHoverEffect();

            // Снимаем подсветку с существа
            if (this.creature) {
                this.creature.setHovered(false);
            }
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
            targets: {alphaValue: 0},
            alphaValue: {from: 0, to: 0.6},
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
        this.applyStateStyles('hover');
    }

    removeHoverEffect() {
        // Если не было пульсации, просто восстанавливаем состояние
        this.setHexState(this.state);
    }

    applyClickEffect() {
        const statePalette = (palette[this.state] || palette[HEX_STATE_NORMAL])['click']

        if (Object.values(statePalette).length === 0) {
            return;
        }

        // Создаем временную графику для клика
        this.clickEffect = this.scene.add.graphics();
        this.add(this.clickEffect);

        this.clickEffect.fillStyle(statePalette.fillStyleColor, statePalette.fillStyleAlpha);
        this.clickEffect.fillPoints(this.hexPoints, true);
        this.clickEffect.lineStyle(statePalette.lineStyleWidth, statePalette.lineStyleColor, statePalette.lineStyleAlpha);
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

                this.setHexState(this.state);
            }
        });

        return
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

    // Рассчитываем хитовую область монстра
    calculateCreatureHitArea() {
        if (!this.creature) return null;

        // Получаем глобальные координаты монстра
        const creatureBounds = this.creature.getBounds();

        // Рассчитываем локальные координаты относительно гекса
        return new Phaser.Geom.Rectangle(
            creatureBounds.x - this.x,
            creatureBounds.y - this.y,
            creatureBounds.width,
            creatureBounds.height
        );
    }

    // Обновляем интерактивность
    updateInteractive() {
        // Создаем объединенную хитовую область
        const combinedArea = this.createCombinedHitArea();

        if (!this.input?.hitArea) {
            this.setInteractive({
                hitArea: combinedArea,
                hitAreaCallback: Phaser.Geom.Polygon.Contains,
                useHandCursor: true
            });
        }

        this.input.hitArea = combinedArea
    }

    createCombinedHitArea() {
        // Создаем базовый полигон гекса
        const hexPolygon = new Phaser.Geom.Polygon(this.hexPoints);

        // Если существо отсутствует, возвращаем полигон гекса
        if (!this.creature) {
            return hexPolygon;
        }

        // Получаем глобальные границы существа
        const creatureBounds = this.creature.getBounds();

        // Конвертируем координаты в локальную систему относительно текущего объекта
        const localX = creatureBounds.x - this.x;
        const localY = creatureBounds.y - this.y;

        // Создаем полигон существа вручную
        const creaturePolygon = new Phaser.Geom.Polygon([
            localX, localY,
            localX + creatureBounds.width, localY,
            localX + creatureBounds.width, localY + creatureBounds.height,
            localX, localY + creatureBounds.height
        ]);

        // Функция конвертации Phaser.Polygon в формат polygon-clipping
        const convertToClipperFormat = (polygon) => {
            const points = [];

            // Собираем все точки полигона
            for (const point of polygon.points) {
                points.push([point.x, point.y]);
            }

            // Замыкаем полигон, если требуется
            if (points.length > 0) {
                const first = points[0];
                const last = points[points.length - 1];

                if (first[0] !== last[0] || first[1] !== last[1]) {
                    points.push([first[0], first[1]]);
                }
            }

            return [points];
        };

        // Конвертируем оба полигона
        const clipperHex = convertToClipperFormat(hexPolygon);
        const clipperCreature = convertToClipperFormat(creaturePolygon);

        // Выполняем объединение полигонов
        let unionResult;
        try {
            unionResult = polygonClipping.union(clipperHex, clipperCreature);
        } catch (error) {
            console.error("Polygon union error:", error);
            return hexPolygon;
        }

        // Обрабатываем результаты объединения
        const processUnionResult = (result) => {
            if (result.length === 0) return null;

            // Выбираем самый большой полигон по количеству точек
            let largestRing = null;
            let maxPoints = -1;

            for (const poly of result) {
                if (poly.length === 0) continue;

                // Берем только внешний контур (первое кольцо)
                const outerRing = poly[0];
                if (outerRing.length > maxPoints) {
                    maxPoints = outerRing.length;
                    largestRing = outerRing;
                }
            }

            if (!largestRing) return null;

            // Создаем финальный полигон (удаляем дублирующую точку)
            const finalPoints = [];
            for (let i = 0; i < largestRing.length - 1; i++) {
                finalPoints.push(largestRing[i][0], largestRing[i][1]);
            }

            return new Phaser.Geom.Polygon(finalPoints);
        };

        // Возвращаем результат или исходный полигон при ошибке
        return processUnionResult(unionResult) || hexPolygon;
    }

    // При перемещении гекса обновляем хитовую область
    setPosition(x, y) {
        super.setPosition(x, y);
        if (this.creature) {
            this.creatureHitArea = this.calculateCreatureHitArea();
        }
    }

    // Устанавливаем существо на гекс
    setCreature(creatureContainer) {
        this.creature = creatureContainer;
        this.creatureHitArea = this.calculateCreatureHitArea();
        this.updateInteractive();
        this.drawDebugBounds()
    }

    // Убираем существо с гекса
    removeCreature() {
        this.creature = null;
        this.creatureHitArea = null;
        this.updateInteractive();
        this.drawDebugBounds()
    }

    // Обновленный метод проверки попадания
    containsPoint(x, y) {
        // 1. Проверка попадания в сам гекс
        const localPoint = this.getLocalPoint(x, y);
        const hexPolygon = new Phaser.Geom.Polygon(this.hexPoints);

        if (Phaser.Geom.Polygon.Contains(hexPolygon, localPoint.x, localPoint.y)) {
            return true;
        }

        // 2. Проверка попадания в существо
        if (this.creature) {
            // Преобразуем глобальные координаты в локальные относительно существа
            const creaturePoint = this.creature.getLocalPoint(x, y);

            // Проверяем попадание в спрайт существа
            if (this.creature.creatureSprite.getBounds().contains(creaturePoint.x, creaturePoint.y)) {
                return true;
            }
        }

        return false;
    }

    getLocalPoint(x, y) {
        // Используем встроенный метод Phaser для преобразования координат
        return this.parentContainer ?
            this.parentContainer.getLocalPoint(x, y) :
            {x: x - this.x, y: y - this.y};
    }

    updateCreatureHitArea() {
        if (this.creature) {
            this.creatureHitArea = this.calculateCreatureHitArea();
            this.updateInteractive();
        }
    }

    drawDebugBounds() {
        return //отключил
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }

        this.debugGraphics = this.scene.add.graphics();
        this.add(this.debugGraphics);

        if (this.input?.hitArea) {
            // Рисуем хитовую область
            const hitArea = this.input.hitArea;
            this.debugGraphics.lineStyle(2, 0xff0000);
            this.debugGraphics.strokePoints(hitArea.points, true);
        }

        return
        // Подписываем координаты
        hitArea.points.forEach((point, i) => {
            const text = this.scene.add.text(point.x, point.y, `${i}:(${Math.round(point.x)},${Math.round(point.y)})`, {
                fontSize: '10px',
                color: '#ff0000'
            });
            this.debugGraphics.add(text);
        });
    }

    getSectorAngle() {
        // Показывает центры секторов
        return [
            -Math.PI / 2 - Math.PI / 6,    // Лево верх
            -Math.PI / 2 + Math.PI / 6,   // Правый верх
            0,     // Право
            Math.PI / 2 - Math.PI / 6,     // Право низ
            Math.PI / 2 + Math.PI / 6,      // Лево низ
            Math.PI // Остаток
        ];
    }

}