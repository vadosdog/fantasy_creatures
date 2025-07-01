import {EventBus} from '../EventBus';
import {Scene} from 'phaser';

export class Craft extends Phaser.Scene {
    constructor() {
        super({ key: 'Craft' });
        this.slots = [];
        this.selectedShards = {
            element: null,
            shape: null,
            emotion: null
        };
        this.uiElements = {
            instruction: null,
            slots: [],
            bottomPanel: null
        };
        
        this.components = []
    }

    create() {
        this.cameras.main.setBackgroundColor(0x3a281f);
        this.createUI();
        this.scale.on('resize', this.handleResize, this);
        EventBus.emit('current-scene-ready', this);
    }

    createUI() {
        this.clearUI();
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;

        this.uiElements.instruction = this.createInstructionPanel(centerX, height * 0.05, width * 0.8);
        this.uiElements.slots = this.createSlotsArea(centerX, height * 0.4);
        this.uiElements.bottomPanel = this.createBottomPanel(centerX, height * 0.85, width * 0.8);
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
            .fillStyle(0x3A281F, 0.8)
            .fillRoundedRect(x - width/2, y - 30, width, 60, 15)
            .lineStyle(3, 0x8B4513)
            .strokeRoundedRect(x - width/2, y - 30, width, 60, 15);
        this.components.push(panel)

        const blacksmith = this.add.image(x - width/2 + 40, y, 'blacksmith').setDisplaySize(50, 50);
        this.components.push(blacksmith)

        const text = this.add.text(x, y, '[КУЗНЕЦ] Соберите три осколка: Стихия + Форма + Эмоция', {
            fontFamily: 'Scada',
            fontSize: '16pt',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        this.components.push(text)

        return { panel, text };
    }

    createSlotsArea(centerX, centerY) {
        const slotTypes = [
            { type: 'element', icon: 'fire_icon', label: 'Стихия' },
            { type: 'shape', icon: 'wolf_icon', label: 'Форма' },
            { type: 'emotion', icon: 'heart_icon', label: 'Эмоция' }
        ];

        const slots = [];
        for (let i = 0; i < 3; i++) {
            const x = centerX + (i - 1) * 220;
            const slot = this.createSlot(x, centerY, slotTypes[i]);
            slot.position = { x, y: centerY };
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
            .fillStyle(0x3A281F)
            .fillRoundedRect(x - 90, y - 90, 180, 180, 10)
            .lineStyle(3, 0x8B4513)
            .strokeRoundedRect(x - 90, y - 90, 180, 180, 10);
        this.components.push(container)

        const icon = this.add.image(x, y - 50, slotType.icon)
            .setDisplaySize(40, 40)
            .setAlpha(0.7);
        this.components.push(icon)

        const typeText = this.add.text(x, y - 75, slotType.label, {
            fontFamily: 'Scada',
            fontSize: '14pt',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.components.push(typeText)

        const placeholder = this.add.text(x, y + 20, 'Перетащите сюда', {
            fontFamily: 'Scada',
            fontSize: '14pt',
            color: '#8B4513',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        this.components.push(placeholder)

        container.setInteractive(new Phaser.Geom.Rectangle(x - 90, y - 90, 180, 180), Phaser.Geom.Rectangle.Contains);

        const slotObj = {
            container,
            icon,
            typeText,
            placeholder,
            type: slotType.type,
            shard: null,
            glow: null,
            constantGlow: null,
            nameText: null,
            position: { x, y }
        };

        container
            .on('pointerover', () => this.highlightSlot(slotObj))
            .on('pointerout', () => this.unhighlightSlot(slotObj));

        return slotObj;
    }

    highlightSlot(slot) {
        if (!slot || !slot.position) return;
        const { x, y } = slot.position;

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
        this.createQualityBar(x, y - 40, width * 0.7);

        this.summonButton = this.add.graphics()
            .fillGradientStyle(0x444444, 0x222222, 0x444444, 0x222222)
            .fillRoundedRect(x - 150, y - 30, 300, 60, 15)
            .lineStyle(3, 0x8B4513)
            .strokeRoundedRect(x - 150, y - 30, 300, 60, 15);
        this.components.push((this.summonButton))

        this.summonText = this.add.text(x, y, 'ВЫБЕРИТЕ ОСКОЛКИ', {
            fontFamily: 'Neucha',
            fontSize: '24pt',
            fontWeight: 'bold',
            color: '#AAAAAA'
        }).setOrigin(0.5);
        this.components.push(this.summonText)

        this.lockIcon = this.add.image(x + 120, y, 'lock').setVisible(true);
        this.components.push(this.lockIcon)

        this.summonButton.setInteractive(new Phaser.Geom.Rectangle(x - 150, y - 30, 300, 60), Phaser.Geom.Rectangle.Contains);

        this.summonButton
            .on('pointerover', () => {
                if (this.isSummonAvailable()) {
                    this.summonButton.setScale(1.05);
                    this.createParticles(x, y);
                }
            })
            .on('pointerout', () => {
                this.summonButton.setScale(1);
                if (this.particles) this.particles.destroy();
            })
            .on('pointerdown', () => {
                if (this.isSummonAvailable()) {
                    this.summonButton.setScale(0.95);
                    this.summonCreature();
                }
            });

        return { button: this.summonButton, text: this.summonText };
    }

    createQualityBar(x, y, width) {
        this.components.push(this.add.graphics()
            .fillStyle(0x2A1810)
            .fillRoundedRect(x - width/2, y - 10, width, 20, 10));

        this.qualityBar = this.add.graphics();
        this.components.push(this.qualityBar)
        this.qualityText = this.add.text(x, y - 30, 'Базовая комбинация: +0%', {
            fontFamily: 'Scada',
            fontSize: '14pt',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.components.push(this.qualityText)

        this.qualityVisual = this.add.text(x, y, '░░░░░░░░░░░░░░░░░░░░ +0%', {
            fontFamily: 'Courier',
            fontSize: '16pt',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.components.push(this.qualityVisual)
    }

    updateQualityBar() {
        const shards = Object.values(this.selectedShards).filter(Boolean);
        const rareCount = shards.filter(s => s.data.get('rarity') === 'rare').length;
        const legendaryCount = shards.filter(s => s.data.get('rarity') === 'legendary').length;

        const quality = Math.min(100, rareCount * 10 + legendaryCount * 25);
        const barWidth = this.qualityVisual.width * (quality / 100);

        let color;
        if (quality <= 15) color = 0x1E90FF;
        else if (quality <= 30) color = 0x9370DB;
        else color = 0xFFD700;

        this.qualityBar.clear()
            .fillStyle(color)
            .fillRoundedRect(
                this.qualityVisual.x - this.qualityVisual.width/2,
                this.qualityVisual.y - 12,
                barWidth,
                24,
                12
            );

        const filled = Math.floor(quality / 5);
        const empty = 20 - filled;
        this.qualityVisual.setText(`${'█'.repeat(filled)}${'░'.repeat(empty)} +${quality}%`);

        let text;
        if (quality === 0) text = 'Базовая комбинация: +0%';
        else if (quality <= 25) text = `Мощная энергия! +${quality}%`;
        else text = `Легендарный потенциал! +${quality}%`;

        this.qualityText.setText(text);
    }

    createParticles(x, y) {
        this.particles = this.add.particles('fire_icon');
        this.components.push(this.particles)
        this.particles.createEmitter({
            x, y,
            speed: { min: -50, max: 50 },
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            frequency: 50,
            lifespan: 1000
        });
    }

    isSummonAvailable() {
        return this.selectedShards.element &&
            this.selectedShards.shape &&
            this.selectedShards.emotion;
    }

    updateSummonButton() {
        if (!this.summonButton || !this.summonText) return;

        const isAvailable = this.isSummonAvailable();
        const x = this.summonText.x;
        const y = this.summonText.y;

        this.summonButton.clear();

        if (isAvailable) {
            this.summonButton
                .fillGradientStyle(0xF9D71C, 0xFFA500, 0xF9D71C, 0xFFA500)
                .fillRoundedRect(x - 150, y - 30, 300, 60, 15)
                .lineStyle(3, 0x8B4513)
                .strokeRoundedRect(x - 150, y - 30, 300, 60, 15);

            this.summonText.setText('ПРИЗВАТЬ СУЩЕСТВО!').setColor('#FFFFFF');
            this.lockIcon.setVisible(false);
        } else {
            this.summonButton
                .fillGradientStyle(0x444444, 0x222222, 0x444444, 0x222222)
                .fillRoundedRect(x - 150, y - 30, 300, 60, 15)
                .lineStyle(3, 0x8B4513)
                .strokeRoundedRect(x - 150, y - 30, 300, 60, 15);

            this.summonText.setText('ВЫБЕРИТЕ ОСКОЛКИ').setColor('#AAAAAA');
            this.lockIcon.setVisible(true);
        }

        this.updateQualityBar();
    }

    summonCreature() {
        this.cameras.main.shake(500, 0.02);
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.tweens.add({
            targets: Object.values(this.selectedShards),
            x: centerX,
            y: centerY,
            scale: 0.2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                const flash = this.add.graphics()
                    .fillStyle(0xFFFFFF)
                    .fillRect(0, 0, this.scale.width, this.scale.height)
                    .setAlpha(0);

                this.tweens.add({
                    targets: flash,
                    alpha: 1,
                    yoyo: true,
                    duration: 300,
                    onComplete: () => flash.destroy()
                });

                this.resetSlots();
            }
        });
    }

    resetSlots() {
        for (const slot of this.slots) {
            console.log(slot)
            if (slot.shard) {
                slot.shard.destroy();
                slot.shard = null;
            }
            if (slot.nameText) slot.nameText.destroy();
            if (slot.constantGlow) slot.constantGlow.destroy();
            slot.placeholder.visible = true;
        }

        this.selectedShards = { element: null, shape: null, emotion: null };
        this.updateSummonButton();
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
}