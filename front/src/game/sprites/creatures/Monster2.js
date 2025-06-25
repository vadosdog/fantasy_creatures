export default class Monster2 extends Phaser.GameObjects.Sprite {
    constructor(texture, scene, x, y, defaultDirection) {
        super(scene, x, y, texture + '_stand');
        scene.add.existing(this);

        this.defaultDirection = defaultDirection;
        this.state = null;
        this.direction = null;
        this.currentTweens = [];

        // Точка вращения у основания карточки
        this.setOrigin(0.5, 0.85);
        this.setScale(1.7); // Стандартный масштаб

        this.setMonsterState(defaultDirection);
    }

    stopAllTweens() {
        this.currentTweens.forEach(tween => tween.stop());
        this.currentTweens = [];
        this.angle = 0;
        this.x = 0
        this.y = 0
    }

    setMonsterState(newState) {
        if (this.state === newState) return;
        this.state = newState;

        // Определяем действие и направление
        const [action, direction] = newState.split('_');
        this.direction = direction;

        this.stopAllTweens();
        this.setFlipX(direction === 'left');

        switch (action) {
            case 'idle':
                this.playIdle();
                break;
            case 'walk':
                this.playIdle();
                break;
            case 'attack':
                this.playAttack();
                break;
            case 'hurt':
                this.playHurt();
                break;
            case 'death':
                this.playDeath();
                break;
            case 'stand':
                // Без анимации
                break;
        }
    }

    playIdle() {
        // const tween = this.scene.tweens.add({
        //     targets: this,
        //     angle: {from: -8, to: 8},
        //     y: {from: this.y - 3, to: this.y + 3},
        //     duration: 2000,
        //     yoyo: true,
        //     repeat: -1,
        //     ease: 'Sine.easeInOut'
        // });
        const startY = 0;
        const duration = 800

        const timeline = this.scene.tweens.chain({
            targets: this,
            loop: -1,
            tweens: [
                {
                    targets: this,
                    angle: -8,
                    y: startY,
                    duration: duration / 4,
                },
                {
                    targets: this,
                    angle: 0,
                    y: startY - 8,
                    duration: duration / 4,
                    ease: 'Sine.easeInOut'
                },
                {
                    targets: this,
                    angle: 8,
                    y: startY,
                    duration: duration / 4,
                    ease: 'Power1'
                },
                {
                    targets: this,
                    angle: 0,
                    y: startY - 8,
                    duration: duration / 4,
                    ease: 'Sine.easeInOut'
                }
            ]
        });

        this.currentTweens.push(timeline);
    }

    playWalk() {
        const timeline = this.scene.tweens.chain({
            targets: this,
            loop: -1,
            tweens: [
                {
                    targets: this,
                    angle: -10,
                    y: this.y - 10,
                    duration: 200,
                    ease: 'Power1'
                },
                {
                    targets: this,
                    angle: 0,
                    y: this.y,
                    duration: 200,
                    ease: 'Power1'
                },
                {
                    targets: this,
                    angle: 10,
                    y: this.y - 10,
                    duration: 200,
                    ease: 'Power1'
                },
                {
                    targets: this,
                    angle: 0,
                    y: this.y,
                    duration: 200,
                    ease: 'Power1'
                }
            ]
        })

        this.currentTweens.push(timeline);
    }

    playAttack() {
        const sign = this.direction === 'right' ? 1 : -1;
        const timeline = this.scene.tweens.chain({
            targets: this,
            tweens: [{
                targets: this,
                x: this.x + (20 * sign),
                angle: 15 * sign,
                duration: 150,
                ease: 'Power2'
            },
                {
                    targets: this,
                    x: this.x,
                    angle: 0,
                    duration: 300,
                    ease: 'Power2'
                }
            ]
        });
        this.currentTweens.push(timeline);
    }

    playHurt() {
        const sign = this.direction === 'right' ? 1 : -1;
        const timeline = this.scene.tweens.chain({
            targets: this,
            tweens: [
                {
                    targets: this,
                    x: this.x - (15 * sign),
                    angle: -15 * sign,
                    duration: 150,
                    ease: 'Power2'
                },
                {
                    targets: this,
                    x: this.x,
                    angle: 0,
                    duration: 300,
                    ease: 'Power2'
                }
            ],
        });

        this.currentTweens.push(timeline);
    }

    playDeath() {
        const sign = this.direction === 'right' ? 1 : -1;
        const timeline = this.scene.tweens.chain({
            targets: this,
            onComplete: () => {
                console.log('deathComplete')
                this.emit('deathComplete');
            },
            tweens: [{
                angle: 90 * sign,
                y: this.y + 100,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
            }]
        });

        this.currentTweens.push(timeline);
    }

    setDefaultState() {
        this.setMonsterState(this.defaultDirection);
    }
}