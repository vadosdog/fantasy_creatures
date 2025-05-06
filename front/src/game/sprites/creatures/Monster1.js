export default class Monster1 extends Phaser.GameObjects.Sprite {
    texturePrefix
    defaultDirection

    constructor(texture, scene, x, y, defaultDirection) {
        super(scene, x, y, texture + '_stand');

        this.defaultDirection = defaultDirection
        this.texturePrefix = texture
        scene.add.existing(this);
        this.createAnimations();
    }

    createAnimations() {
        // Создаем анимации один раз (можно вынести в сцену и передавать сюда)
        if (!this.scene.anims.exists(this.texturePrefix + '_walk_right')) {
            this.scene.anims.create({
                key: this.texturePrefix + '_walk_right',
                frames: this.scene.anims.generateFrameNumbers(this.texturePrefix + '_walk', {start: 0, end: 5}),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists(this.texturePrefix + '_attack1_right')) {
            this.scene.anims.create({
                key: this.texturePrefix + '_attack1_right',
                frames: this.scene.anims.generateFrameNumbers(this.texturePrefix + '_attack1', {start: 0, end: 3}),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists(this.texturePrefix + '_hurt_right')) {
            this.scene.anims.create({
                key: this.texturePrefix + '_hurt_right',
                frames: this.scene.anims.generateFrameNumbers(this.texturePrefix + '_hurt', {start: 0, end: 3}),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists(this.texturePrefix + '_death_right')) {
            this.scene.anims.create({
                key: this.texturePrefix + '_death_right',
                frames: this.scene.anims.generateFrameNumbers(this.texturePrefix + '_death', {start: 0, end: 7}),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    setDefaultState() {
        return this.setState(this.defaultDirection)
    }

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;

        switch (newState) {
            case 'walk_right':
                this.setFlipX(false);
                this.play(this.texturePrefix + '_walk_right');
                break;
            case 'walk_left':
                this.setFlipX(true);
                this.play(this.texturePrefix + '_walk_right');
                break;
            case 'attack_right':
                this.setFlipX(false);
                this.play(this.texturePrefix + '_attack1_right');
                break;
            case 'attack_left':
                this.setFlipX(true);
                this.play(this.texturePrefix + '_attack1_right');
                break;
            case 'hurt_right':
                this.setFlipX(false);
                this.play(this.texturePrefix + '_hurt_right');
                break;
            case 'hurt_left':
                this.setFlipX(true);
                this.play(this.texturePrefix + '_hurt_right');
                break;
            case 'death_right':
                this.setFlipX(false);
                this.play(this.texturePrefix + '_death_right');
                break;
            case 'death_left':
                this.setFlipX(true);
                this.play(this.texturePrefix + '_death_right');
                break;
            case 'stand_right':
                this.setFlipX(false);
                this.stop();
                this.setTexture(this.texturePrefix + '_stand');
                break;
            case 'stand_left':
                this.setFlipX(true);
                this.stop();
                this.setTexture(this.texturePrefix + '_stand');
                break;
        }
    }

    // Можно добавить метод для обновления позиции или логики
    update(time, delta) {
        // Логика движения или состояния
    }
}
