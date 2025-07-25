import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import {useBattleStore} from "../../store/battle.js";

export class BattleOver extends Scene
{
    store
    constructor ()
    {
        super('BattleOver');
        this.store = useBattleStore()
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Battle Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
}
