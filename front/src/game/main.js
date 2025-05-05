import {Boot} from './scenes/Boot';
import {Game} from './scenes/Game';
import {GameOver} from './scenes/GameOver';
import {MainMenu} from './scenes/MainMenu';
import {Battle} from './scenes/Battle';
import Phaser from 'phaser';
import {Preloader} from './scenes/Preloader';


const StartGame = (parent, store) => {
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
            Game,
            GameOver,
            new Battle(store),
        ]
    }
    return new Phaser.Game({...config, parent});
}

export default StartGame;
