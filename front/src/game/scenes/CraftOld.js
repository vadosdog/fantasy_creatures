import {EventBus} from '../EventBus';
import {Scene} from 'phaser';

export class Craft extends Scene {
    constructor() {
        super('Craft');


        // Game state variables
        this.temperature = 20;
        this.progress = 0;
        this.hammerPosition = 0;
        this.hammerVelocity = 0.5;
        this.hammerDirection = 1;
        this.perfectHits = 0;
        this.totalHits = 0;
        this.missHits = 0;
        this.gameActive = false;
        this.progressText = ''
        this.score = 0
    }

    create() {
        this.createBackground()
        this.createGameElements()
        EventBus.emit('current-scene-ready', this);


        // Start the game
        this.startForging();
    }


    createBackground() {
        let scaleX = 1
        let scaleY = 1
        let scale = 1
        // Battleground
        let battleground = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'craft-game-crucible-of-souls-background'
        );
        scaleX = this.cameras.main.width / battleground.width
        scaleY = this.cameras.main.height / battleground.height
        scale = Math.max(scaleX, scaleY)
        battleground.setScale(scale)
    }

    createGameElements() {
        // Crucible - brown circle with orange border
        this.crucible = this.add.circle(400, 400, 60, 0x8B4513)
            .setStrokeStyle(5, 0xFFA500);

        // Shards in the crucible - colored triangles
        this.shards = [
            this.createShard(370, 380, 0xFF0000), // Red
            this.createShard(400, 370, 0x00FF00), // Green
            this.createShard(430, 380, 0x0000FF)  // Blue
        ];

        // Hammer - gray rectangle with brown handle
        this.hammerContainer = this.add.container(470, 300, [
            // молот
            this.add.rectangle(-80, 0, 20, 80, 0x808080)
                .setOrigin(0, 0.5),
            // ручка
            this.add.rectangle(-60, 0, 60, 10, 0x8B4513)
                .setOrigin(0, 0.5)
        ]);

        // Temperature bar - vertical gradient rectangle
        this.tempBar = this.add.rectangle(250, 300, 30, 200, 0x000000)
            .setOrigin(0.5, 0.5)
            .setStrokeStyle(2, 0xFFFFFF);

        // Temperature indicator - small white rectangle
        this.tempIndicator = this.add.rectangle(250, 400, 40, 10, 0xFFFFFF)
            .setOrigin(0.5, 1);

        // Progress bar background
        this.add.rectangle(400, 100, 300, 20, 0x666666)
            .setOrigin(0);

        // Progress fill
        this.progressFill = this.add.rectangle(400, 100, 0, 18, 0x00FF00)
            .setOrigin(0);

        // Instructions text
        this.instructionsText = this.add.text(400, 600, 'Дождитесь повышения температуры', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {x: 10, y: 5}
        }).setOrigin(0.5);

        this.progressText = this.add.text(700, 200, '', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {x: 10, y: 5},
            align: 'left'
        }).setOrigin(0)
        this.updateProgressText()

        // Input
        this.input.on('pointerdown', this.strikeHammer, this);
    }

    updateProgressText() {
        this.progressText.setText(
            "Ударов: " + this.totalHits
            + "\nИдеально: " + this.perfectHits
            + "\nПромахов: " + this.missHits
            + "\nПрогресс: " + Phaser.Math.Clamp(this.progress, 0, 100)
            + "\nScore: " + Math.floor(this.score)
        )
    }

    createShard(x, y, color) {
        const points = '30 0 0 60 60 60';
        return this.add.polygon(x, y, points, color)
            .setScale(0.5);
    }

    startForging() {
        this.gameActive = true;
        this.temperature = 20;
        this.progress = 0;
        this.perfectHits = 0;
        this.totalHits = 0;
        this.missHits = 0;
        this.score = 0

        // Animate shards
        this.tweens.add({
            targets: this.shards,
            y: '+=20',
            scale: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    update(time, delta) {
        if (!this.gameActive) return;

        // Update hammer position
        this.hammerPosition += this.hammerVelocity * this.hammerDirection * 0.2;

        // Reverse direction at limits
        if (this.hammerPosition > 1) {
            this.hammerPosition = 1;
            this.hammerDirection = -1;
        } else if (this.hammerPosition < -1) {
            this.hammerPosition = -1;
            this.hammerDirection = 1;
        }

        // Update hammer rotation and position
        const hammerAngle = -45 * this.hammerPosition + 45;
        this.hammerContainer.angle = hammerAngle;

        // Update temperature
        this.temperature = Phaser.Math.Clamp(this.temperature + 0.2, 0, 100);

        // Update temperature indicator position
        this.tempIndicator.y = 400 - (this.temperature * 2);

        // Меняем текст инструкции
        if (this.temperature < 30) {
            this.instructionsText.setText('Дождитесь повышения температуры!')
        } else {
            this.instructionsText.setText('Ударьте молотом, когда он над тиглем!')
        }

        // Update temperature indicator color
        if (this.temperature < 30) {
            this.tempIndicator.setFillStyle(0x0000FF); // Blue (cold)
        } else if (this.temperature < 60) {
            this.tempIndicator.setFillStyle(0x00FF00); // Green (perfect)
        } else if (this.temperature < 80) {
            this.tempIndicator.setFillStyle(0xFFFF00); // Yellow (warning)
        } else {
            this.tempIndicator.setFillStyle(0xFF0000); // Red (danger)
        }

        // Check for overheating
        if (this.temperature >= 95) {
            this.overheat();
        }
    }

    strikeHammer() {
        if (!this.gameActive) return;

        this.totalHits++;
        const hammerAngle = Math.abs(this.hammerContainer.angle);

        // Если жерло слишком холодное, то считаем как промах
        if (this.temperature > 30) {
            // Determine hit quality
            if (hammerAngle < 5) { // Perfect hit
                this.perfectHits++;

                this.score += this.temperature * 2
                this.temperature = Phaser.Math.Clamp(this.temperature - 25, 0, 100);
                this.progress += 20;

                // Visual feedback
                this.cameras.main.shake(100, 0.01);
                this.createParticles(0xFFFF00);

                this.playActionText("perfect", '#00ff00')
            } else if (hammerAngle < 25) { // Good hit
                this.score += this.temperature
                this.temperature = Phaser.Math.Clamp(this.temperature - 15, 0, 100);
                this.progress += 10;
                this.playActionText("good", '#ffff00')
            } else { // Poor hit
                this.missHits++
                this.playActionText("промах", '#ff6600')
            }
        } else {
            this.missHits++
            this.playActionText("Слишком холодно", '#0000FF')
        }

        // Update progress bar
        this.progressFill.width = this.progress * 3;

        // Check for completion
        if (this.progress >= 100) {
            this.completeForging();
        }


        this.updateProgressText()
    }

    createParticles(color) {
        for (let i = 0; i < 10; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(380, 420),
                Phaser.Math.Between(380, 420),
                Phaser.Math.Between(2, 5),
                color
            );

            this.tweens.add({
                targets: particle,
                y: '+=50',
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    overheat() {
        this.gameActive = false;

        // Visual effects
        this.cameras.main.flash(200, 255, 0, 0);
        this.createParticles(0xFF0000);

        // Show failure message
        this.add.text(400, 200, 'ПЕРЕГРЕВ!', {
            fontSize: '48px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: {x: 20, y: 10}
        }).setOrigin(0.5);

        // Restart after delay
        this.time.delayedCall(2000, this.resert, [], this);
    }

    resert() {
        this.scene.start('Craft')
    }

    completeForging() {
        this.gameActive = false;

        // Determine quality
        const quality = this.perfectHits / this.totalHits;
        let qualityText, qualityColor;

        if (quality >= 0.8) {
            qualityText = 'S-РАНГ: Идеально!';
            qualityColor = '#00ff00';
        } else if (quality >= 0.6) {
            qualityText = 'A-РАНГ: Хорошо';
            qualityColor = '#ffff00';
        } else {
            qualityText = 'B-РАНГ: Посредственно';
            qualityColor = '#ff6600';
        }

        // Show result
        this.add.text(400, 200, qualityText, {
            fontSize: '36px',
            color: qualityColor,
            backgroundColor: '#000000',
            padding: {x: 20, y: 10}
        }).setOrigin(0.5);

        // Animate creation
        this.tweens.add({
            targets: this.shards,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            onComplete: () => {
                // Show the created creature (simple circle for demo)
                const creature = this.add.circle(400, 400, 40, 0xFF00FF)
                    .setAlpha(0);

                this.tweens.add({
                    targets: creature,
                    alpha: 1,
                    scale: 1.5,
                    duration: 500
                });
            }
        });

        // Restart after delay
        this.time.delayedCall(2000, this.resert, [], this);
    }

    playActionText(text, color) {
        let actionText = this.add.text(
            400,
            200,
            text,
            {
                fontSize: '36px',
                color: color,
                backgroundColor: '#000000',
                padding: {x: 20, y: 10}
            }
        )

        this.tweens.add({
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
}
