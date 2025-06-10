import {Boot} from './scenes/Boot';
import {Game} from './scenes/Game';
import {BattleOver} from './scenes/BattleOver.js';
import {MainMenu} from './scenes/MainMenu';
import {Battle} from './scenes/Battle';
import {BattleAutoTest} from './scenes/BattleAutoTest';
import Phaser from 'phaser';
import {Preloader} from './scenes/Preloader';
// import {CraftGameCrucibleOfSouls} from "./scenes/CraftGameCrucibleOfSouls";
// import {ExplorationLevel} from "./scenes/ExplorationLevel";
import EasyStar from 'easystarjs';

console.log(window.innerHeight)
console.log(window.innerWidth)

const StartGame = (parent) => {
    // Find out more information about the Game Config at:
    // https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
    const config = {
        type: Phaser.AUTO,
        width: '100%',  // Используем 100% контейнера
        height: '100%', // Используем 100% контейнера
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
            // CraftGameCrucibleOfSouls,
            // ExplorationLevel,
            Game,
            BattleOver,
            Battle,
            BattleAutoTest,
        ],
        plugins: {
            scene: [
                {
                    key: 'EasyStar',
                    plugin: EasyStar,
                    mapping: 'easystar'
                }
            ]
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
    }
    return new Phaser.Game({...config, parent});
}

export default StartGame;
