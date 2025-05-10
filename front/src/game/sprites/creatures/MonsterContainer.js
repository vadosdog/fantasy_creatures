import Monster1 from "./Monster1.js";

export default class MonsterContainer extends Phaser.GameObjects.Container {
    creatureSprite
    creature
    creatureText

    constructor(creature, scene, x, y) {
        super(scene, x, y)
        scene.add.existing(this);

        this.creature = creature


        let defaultDirection
        if (creature.direction === 'left') {
            defaultDirection = 'stand_left'
        } else {
            defaultDirection = 'stand_right'
        }


        this.creatureSprite = new Monster1(creature.texture, scene, 0, -20, defaultDirection);
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

    playActionText(text) {
        let actionText = this.scene.add.text(
            0,
            12,
            text,
            {
                fontFamily: "arial",
                fontSize: "16px",
                fontWeight: "bold",
                align: "center",
                color: "red"
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
}
