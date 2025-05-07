import {Boot} from './scenes/Boot';
import {Game} from './scenes/Game';
import {BattleOver} from './scenes/BattleOver.js';
import {MainMenu} from './scenes/MainMenu';
import {Battle} from './scenes/Battle';
import Phaser from 'phaser';
import {Preloader} from './scenes/Preloader';
import {CraftGameCrucibleOfSouls} from "./scenes/CraftGameCrucibleOfSouls";


const StartGame = (parent) => {
    // Find out more information about the Game Config at:
    // https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
    const config = {
        type: Phaser.AUTO,
        width: 1024,
        height: 800,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 300},
                debug: false
            }
        },
        parent: 'game-container',
        backgroundColor: '#028af8',
        scene: [
            Boot,
            Preloader,
            MainMenu,
            CraftGameCrucibleOfSouls,
            Game,
            BattleOver,
            Battle,
        ]
    }
    return new Phaser.Game({...config, parent});
}

export default StartGame;
