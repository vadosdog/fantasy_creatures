import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class CraftGameCrucibleOfSouls extends Scene
{
    constructor ()
    {
        super('CraftGameCrucibleOfSouls');
    }

    create ()
    {
        console.log('123')
        this.cameras.main.setBackgroundColor(0x00ff00);
        EventBus.emit('current-scene-ready', this);
        return

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

    }
}
