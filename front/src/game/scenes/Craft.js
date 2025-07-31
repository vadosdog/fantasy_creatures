import {EventBus} from '../EventBus';
import {Scene} from 'phaser';
import {useCraftStore} from "../../store/craft.js";
import {useGameStore} from "../../store/game.js";

const craftStore = useCraftStore();
const gameStore = useGameStore();

export class Craft extends Phaser.Scene {
    constructor() {
        super({key: 'Craft'});
        this.slots = [];
        this.uiElements = {
            instruction: null,
            slots: [],
            bottomPanel: null
        };

        this.components = [];
        this.unsubscribe = null;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x070809);
        this.createUI();
        this.scale.on('resize', this.handleResize, this);
        EventBus.emit('current-scene-ready', this);

        // Подписка на изменения хранилища
        this.unsubscribe = craftStore.$subscribe(() => {
            if (this.scene && this.scene.isActive()) {
                this.updateSlotsFromStore();
            }
        });

        // Первоначальное обновление слотов
        this.updateSlotsFromStore();

        // Обработчик для безопасного уничтожения
        this.game.events.on('before-destroy', this.safeDestroy, this);
    }
    
    createUI() {
        this.clearUI();
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;

        this.uiElements.instruction = this.createInstructionPanel(centerX, height * 0.05, width * 0.8);
        this.uiElements.slots = this.createSlotsArea(centerX, height * 0.4);
        this.uiElements.bottomPanel = this.createBottomPanel(centerX, height * 0.85, width * 0.8);

        this.tweens.killTweensOf(this.components);
    }

    clearUI() {
        for (const component of this.components) {
            component.destroy()
        }
        this.components = []


        this.slots = [];
        this.uiElements.slots = [];
    }

    handleResize(gameSize) {
        this.createUI();
    }

    createInstructionPanel(x, y, width) {
        const panel = this.add.graphics()
            .fillStyle(0x21262C, 0.8)
            .fillRoundedRect(x - width / 2, y - 30, width, 60, 15)
            .lineStyle(3, 0xcc66ff)
            .strokeRoundedRect(x - width / 2, y - 30, width, 60, 15);
        this.components.push(panel)

        const text = this.add.text(x, y, 'Соберите три осколка: Стихия + Форма + Эмоция', {
            fontFamily: 'Scada',
            fontSize: '16pt',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        this.components.push(text)

        return {panel, text};
    }

    createSlotsArea(centerX, centerY) {
        const slotTypes = [
            {type: 'element', label: 'Стихия'},
            {type: 'shape', label: 'Форма'},
            {type: 'emotion', label: 'Эмоция'}
        ];

        const slots = [];
        for (let i = 0; i < 3; i++) {
            const x = centerX + (i - 1) * 220;
            const slot = this.createSlot(x, centerY, slotTypes[i]);
            slot.position = {x, y: centerY};
            slots.push(slot);
            this.slots.push(slot);
        }

        this.tweens.add({
            targets: this,
            duration: 2000,
            repeat: -1,
            onUpdate: () => this.drawEnergyConnections()
        });

        return slots;
    }

    createSlot(x, y, slotType) {
        const container = this.add.graphics()
            .fillStyle(0x21262C)
            .fillRoundedRect(x - 90, y - 90, 180, 180, 10)
            .lineStyle(3, 0xcc66ff)
            .strokeRoundedRect(x - 90, y - 90, 180, 180, 10);
        this.components.push(container)

        const typeText = this.add.text(x, y - 75, slotType.label, {
            fontFamily: 'Scada',
            fontSize: '14pt',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.components.push(typeText)

        const placeholder = this.add.text(x, y + 20, '???', {
            fontFamily: 'Scada',
            fontSize: '14pt',
            color: '#AAAAAA',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        this.components.push(placeholder)

        container.setInteractive(new Phaser.Geom.Rectangle(x - 90, y - 90, 180, 180), Phaser.Geom.Rectangle.Contains);

        const slotObj = {
            container,
            typeText,
            placeholder,
            type: slotType.type,
            shard: null,
            glow: null,
            constantGlow: null,
            nameText: null,
            position: {x, y}
        };

        container
            .on('pointerover', () => this.highlightSlot(slotObj))
            .on('pointerout', () => this.unhighlightSlot(slotObj))
            .on('pointerdown', () => this.handleSlotClick(slotObj));

        return slotObj;
    }

    handleSlotClick(slot) {
        // Если слот пустой - эмитируем событие для подсветки секции
        if (!slot.shard) {
            // EventBus.emit('highlight-shard-type', slot.type);
        }
    }


    highlightSlot(slot) {
        if (!slot || !slot.position) return;
        const {x, y} = slot.position;

        if (!slot.glow) {
            slot.glow = this.add.graphics()
                .lineStyle(4, 0xFFFF00, 0.7)
                .strokeRoundedRect(x - 90, y - 90, 180, 180, 10)
                .setDepth(-1);
            this.components.push(slot.glow)
        }
    }

    unhighlightSlot(slot) {
        if (slot.glow) {
            slot.glow.destroy();
            slot.glow = null;
        }
    }

    drawEnergyConnections() {
        if (this.energyLines) this.energyLines.destroy();

        const filledSlots = this.slots.filter(slot => slot.shard);
        if (filledSlots.length < 2) return;

        this.energyLines = this.add.graphics();
        this.components.push(this.energyLines)
        const alpha = 0.3 + Math.sin(this.time.now * 0.002) * 0.2;

        for (let i = 0; i < filledSlots.length - 1; i++) {
            const start = filledSlots[i];
            const end = filledSlots[i + 1];
            const color = this.getElementColor(start.shard);

            this.energyLines.lineStyle(3, color, alpha)
                .beginPath()
                .moveTo(start.position.x, start.position.y)
                .lineTo(end.position.x, end.position.y)
                .strokePath();
        }
    }

    createBottomPanel(x, y, width) {
        this.craftButton = this.add.graphics()
            .fillGradientStyle(0x444444, 0x222222, 0x444444, 0x222222)
            .fillRoundedRect(x - 150, y - 30, 300, 60, 15)
            .lineStyle(3, 0xCC66FF)
            .strokeRoundedRect(x - 150, y - 30, 300, 60, 15);
        this.components.push((this.craftButton))

        this.craftButtonText = this.add.text(x, y, 'ВЫБЕРИ ОСКОЛКИ', {
            fontFamily: 'Neucha',
            fontSize: '24pt',
            fontWeight: 'bold',
            color: '#AAAAAA'
        }).setOrigin(0.5);
        this.components.push(this.craftButtonText)

        this.craftButton.setInteractive(new Phaser.Geom.Rectangle(x - 150, y - 30, 300, 60), Phaser.Geom.Rectangle.Contains);

        this.craftButton
            .on('pointerover', () => {
                if (this.isCraftAvailable()) {
                    this.createParticles(x, y);
                }
            })
            .on('pointerout', () => {
                if (this.particles) this.particles.destroy();
            })
            .on('pointerdown', () => {
                if (this.isCraftAvailable()) {
                    this.craftCreature();
                }
            });

        return {button: this.craftButton, text: this.craftButtonText};
    }

    createParticles(x, y) {
        this.particles = this.add.particles(x, y, 'fire_icon', {
            x, y,
            speed: {min: -50, max: 50},
            scale: {start: 0.2, end: 0},
            blendMode: 'ADD',
            frequency: 50,
            lifespan: 1000
        });
        this.components.push(this.particles)
    }

    isCraftAvailable() {
        return craftStore.selectedElement &&
            craftStore.selectedShape &&
            craftStore.selectedEmotion;
    }

    updateCraftButton() {
        if (!this.craftButton || !this.craftButtonText) return;

        const isAvailable = this.isCraftAvailable();
        const x = this.craftButtonText.x;
        const y = this.craftButtonText.y;

        this.craftButton.clear();

        if (isAvailable) {
            this.craftButton
                .fillGradientStyle(0x66CCFF, 0xCC66FF, 0x66CCFF, 0xCC66FF)
                .fillRoundedRect(x - 150, y - 30, 300, 60, 15)
                .lineStyle(3, 0x8B4513)
                .strokeRoundedRect(x - 150, y - 30, 300, 60, 15);

            this.craftButtonText.setText('ОБЪЕДИНИТЬ ОСКОЛКИ!').setColor('#FFFFFF');
        } else {
            this.craftButton
                .fillGradientStyle(0x444444, 0x222222, 0x444444, 0x222222)
                .fillRoundedRect(x - 150, y - 30, 300, 60, 15)
                .lineStyle(3, 0xCC66FF)
                .strokeRoundedRect(x - 150, y - 30, 300, 60, 15);

            this.craftButtonText.setText('ВЫБЕРИТЕ ОСКОЛКИ').setColor('#AAAAAA');
        }

    }

    craftCreature() {
        const camera = this.cameras.main;
        const width = this.scale.width;
        const height = this.scale.height;

        // Увеличиваем размеры flash, чтобы покрыть возможные смещения при дрожании
        const margin = 100;
        const flashWidth = width + margin * 2;
        const flashHeight = height + margin * 2;

        // Запускаем дрожание
        camera.shake(500, 0.02);

        // Создаём flash больше экрана и центрируем
        const flash = this.add.graphics()
            .setDepth(1000) // Поверх всего
            .fillStyle(0xFFFFFF)
            .fillRect(-margin, -margin, flashWidth, flashHeight) // Рисуем с отрицательных координат
            .setAlpha(0);

        // Анимация осколков
        const centerX = width / 2;
        const centerY = height / 2;

        this.tweens.add({
            targets: Object.values(craftStore.selectedShards),
            x: centerX,
            y: centerY,
            scale: 0.2,
            alpha: 0,
            duration: 1000
            // Без onComplete — всё параллельно
        });

        // Анимация вспышки — одновременно с дрожанием и анимацией
        this.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 100,
            onComplete: () => {
                const newCreature = craftStore.createNewCreature();
                this.resetSlots();
                this.updateCraftButton();
                flash.destroy(); // Удаляем после
            }
        });
    }
    
    resetSlots() {
        for (const slot of this.slots) {
            if (slot.shard) {
                slot.shard.destroy();
                slot.shard = null;
            }
            if (slot.nameText) slot.nameText.destroy();
            if (slot.constantGlow) slot.constantGlow.destroy();
            slot.placeholder.visible = true;
        }

        this.updateCraftButton();
    }

    getElementColor(shard) {
        const colors = {
            fire: 0xFF4500,
            water: 0x1E90FF,
            earth: 0x8B4513,
            air: 0x87CEEB
        };
        return colors[shard.data.get('element')] || 0xFFFFFF;
    }

    updateSlotsFromStore() {
        const store = craftStore;

        this.slots.forEach(slot => {
            let shardData = null;
            switch (slot.type) {
                case 'element':
                    shardData = store.selectedElement;
                    break;
                case 'shape':
                    shardData = store.selectedShape;
                    break;
                case 'emotion':
                    shardData = store.selectedEmotion;
                    break;
            }

            if (shardData) {
                this.addShardToSlot(slot, shardData);
            } else {
                this.clearSlot(slot);
            }
        });

        this.updateCraftButton();
    }

    // Новый метод: добавление осколка в слот
    addShardToSlot(slot, shardData) {
        if (!this.scene || !this.scene.isActive()) return;

        if (slot?.shard?.texture?.key === shardData?.texture) {
            return
        }

        // Очищаем слот
        this.clearSlot(slot);

        // Скрываем плейсхолдер
        slot.placeholder.visible = false;

        // Создаем спрайт осколка
        slot.shard = this.add.image(
            slot.position.x,
            slot.position.y,
            shardData.texture
        ).setDisplaySize(100, 100);
        this.components.push(slot.shard);

        // Добавляем текст названия
        slot.nameText = this.add.text(
            slot.position.x,
            slot.position.y + 80,
            shardData.name,
            {
                fontFamily: 'Scada',
                fontSize: '12pt',
                color: '#FFFFFF',
                wordWrap: {width: 180}
            }
        ).setOrigin(0.5);
        this.components.push(slot.nameText);

        // Добавляем постоянное свечение
        slot.constantGlow = this.add.graphics()
            .lineStyle(4, 0x00FF00, 0.5)
            .strokeRoundedRect(
                slot.position.x - 90,
                slot.position.y - 90,
                180, 180, 10
            );
        this.components.push(slot.constantGlow);

        // Добавляем кнопку удаления (крестик)
        slot.closeButton = this.add.image(
            slot.position.x + 70,
            slot.position.y - 70,
            'close_icon'
        ).setDisplaySize(20, 20)
            .setInteractive({
                useHandCursor: true
            })
            .setDepth(1);

        slot.closeButton.on('pointerdown', () => {
            craftStore.selectShard(slot.type, null);
        });

        this.components.push(slot.closeButton);
    }

    // Новый метод: очистка слота
    clearSlot(slot) {
        if (slot.shard) {
            slot.shard.destroy();
            slot.shard = null;
        }
        if (slot.nameText) {
            slot.nameText.destroy();
            slot.nameText = null;
        }
        if (slot.constantGlow) {
            slot.constantGlow.destroy();
            slot.constantGlow = null;
        }
        if (slot.closeButton) {
            slot.closeButton.destroy();
            slot.closeButton = null;
        }
        slot.placeholder.visible = true;
    }


    safeDestroy() {
        try {
            // Останавливаем анимации
            this.tweens.tweens.forEach(tween => {
                try {
                    tween.stop();
                    tween.remove();
                } catch (tweenError) {
                    console.warn('Error removing tween:', tweenError);
                }
            });

            // Отписываемся от событий
            this.scale.off('resize', this.handleResize, this);

            // Отписываемся от хранилища
            if (this.unsubscribe) {
                try {
                    this.unsubscribe();
                } catch (unsubscribeError) {
                    console.warn('Error unsubscribing:', unsubscribeError);
                }
                this.unsubscribe = null;
            }

            // Очищаем объекты
            this.clearUI();
            this.slots = [];

            // Освобождаем ресурсы
            if (this.energyLines) {
                this.energyLines.destroy();
                this.energyLines = null;
            }

            if (this.particles) {
                this.particles.destroy();
                this.particles = null;
            }
        } catch (error) {
            console.error('Craft safeDestroy error:', error);
        }
    }

    // Добавляем обработчик уничтожения сцены
    destroy() {
        this.safeDestroy();
        super.destroy();
    }
}