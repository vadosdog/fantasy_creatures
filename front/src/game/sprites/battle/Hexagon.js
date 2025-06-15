export const HEX_STATE_NORMAL = 'normal',
    HEX_STATE_INACTIVE = 'inactive',
    HEX_STATE_MOVEABLE = 'moveable',
    HEX_STATE_ATTACKABLE = 'attackable',
    HEX_STATE_TREATABLE = 'treat',
    HEX_STATE_SELECTED = 'selected'


export const INTERACTION_STATE_NORMAL = 'normal',
    INTERACTION_STATE_HOVERED = 'hovered',
    INTERACTION_STATE_PRESSED = 'pressed'

export const HEXAGON_ANIM_NORMAL = 'hex-normal',
    HEXAGON_ANIM_LIGHT_YELLOW = 'hex-light-yellow',
    HEXAGON_ANIM_LIGHT_RED = 'hex-light-red',
    HEXAGON_ANIM_LIGHT_GREEN = 'hex-light-green',
    HEXAGON_ANIM_YELLOW = 'hex-yellow',
    HEXAGON_ANIM_RED = 'hex-red',
    HEXAGON_ANIM_GREEN = 'hex-green',
    HEXAGON_ANIM_GREY = 'hex-grey'

export default class Hexagon extends Phaser.GameObjects.Sprite {
    // Состояния: inactive, selected, movable, attackable, treatable
    hexState = HEX_STATE_NORMAL
    // Взаимодействие: normal, hovered, pressed
    interactionState = INTERACTION_STATE_NORMAL

    constructor(scene, x, y, posX, posY) {
        super(scene, x, y, "hexagon");

        // без этого отображаться не будет
        scene.add.existing(this)

        this.setInteractive();

        this.on('pointerover', () => this.onHover());
        this.on('pointerout', () => this.onOut());
        this.on('pointerdown', () => this.onClick());
        this.on('pointerup', () => this.onHover());
        
        this.posX = posX
        this.posY = posY
    }

    setHexState(state) {
        if (this.hexState !== state) {
            this.hexState = state;
            this.updateVisual();
        }
    }

    setInteractionState(interactionState) {
        if (this.interactionState !== interactionState) {
            this.interactionState = interactionState;
            this.updateVisual();
        }
    }

    updateVisual() {
        this.setInteractive();

        if (this.interactionState === INTERACTION_STATE_NORMAL) {
            switch (this.hexState) {
                case HEX_STATE_INACTIVE:
                    this.anims.play(HEXAGON_ANIM_NORMAL)
                    this.disableInteractive();
                    break
                case HEX_STATE_SELECTED:
                    this.anims.play(HEXAGON_ANIM_YELLOW)
                    this.disableInteractive();
                    break
                case HEX_STATE_MOVEABLE:
                    this.anims.play(HEXAGON_ANIM_GREY)
                    break
                case HEX_STATE_ATTACKABLE:
                    this.anims.play(HEXAGON_ANIM_LIGHT_RED)
                    break
                case HEX_STATE_TREATABLE:
                    this.anims.play(HEXAGON_ANIM_LIGHT_GREEN)
                    break
                default:
                    this.anims.play(HEXAGON_ANIM_NORMAL)
            }
        } else if (this.interactionState === INTERACTION_STATE_HOVERED) {
            switch (this.hexState) {
                case HEX_STATE_INACTIVE:
                    this.anims.play(HEXAGON_ANIM_NORMAL)
                    this.disableInteractive();
                    break
                case HEX_STATE_SELECTED:
                    this.anims.play(HEXAGON_ANIM_YELLOW)
                    this.disableInteractive();
                    break
                case HEX_STATE_MOVEABLE:
                    this.anims.play(HEXAGON_ANIM_LIGHT_YELLOW)
                    break
                case HEX_STATE_ATTACKABLE:
                    this.anims.play(HEXAGON_ANIM_RED)
                    break
                case HEX_STATE_TREATABLE:
                    this.anims.play(HEXAGON_ANIM_GREEN)
                    break
                default:
                    this.anims.play(HEXAGON_ANIM_NORMAL)
            }
        } else if (this.interactionState === INTERACTION_STATE_PRESSED) {
            switch (this.hexState) {
                case HEX_STATE_INACTIVE:
                    this.anims.play(HEXAGON_ANIM_NORMAL)
                    this.disableInteractive();
                    break
                case HEX_STATE_SELECTED:
                    this.anims.play(HEXAGON_ANIM_YELLOW)
                    this.disableInteractive();
                    break
                case HEX_STATE_MOVEABLE:
                    this.anims.play(HEXAGON_ANIM_YELLOW)
                    break
                case HEX_STATE_ATTACKABLE:
                    this.anims.play(HEXAGON_ANIM_YELLOW)
                    break
                case HEX_STATE_TREATABLE:
                    this.anims.play(HEXAGON_ANIM_YELLOW)
                    break
                default:
                    this.anims.play(HEXAGON_ANIM_NORMAL)
                    
            }
        } else {
            this.anims.play(HEXAGON_ANIM_NORMAL)
        }
    }

    onHover() {
        this.setInteractionState(INTERACTION_STATE_HOVERED);
    }

    onOut() {
        this.setInteractionState(INTERACTION_STATE_NORMAL);
    }

    onClick() {
        this.setInteractionState(INTERACTION_STATE_PRESSED);
    }
}