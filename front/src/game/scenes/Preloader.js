import {Scene} from 'phaser';
import {useGameStore} from "../../store/game.js";

const gameStore = useGameStore()

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('./assets');
        
        /**
         * BATTLE
         */
        // Battle backgrounds
        this.load.image('battle-background-1-back_land', 'battle/backgrounds/game_background_1/layers/back_land.png');
        this.load.image('battle-background-1-battleground', 'battle/backgrounds/game_background_1/layers/battleground.png');
        this.load.spritesheet('hexagon', 'battle/hexagon/hexagon3.png', {frameWidth: 95, frameHeight: 110});
        
        
        // basic creatures
        const basicCreatures = [
            "001",
            "004",
            "007",
            "010",
            "013",
            "016",
            "019",
            "022",
            "025",
            "028",
            "031",
            "034",
            "037",
            "040",
            "043",
            "046",
            "049",
            "052",
            "055",
            "058",
            "061",
            "064",
            "067",
            "070",
            "073",
            "076",
            "079",
        ]
        for (const basicCreature of basicCreatures) {
            this.load.image(basicCreature + '_stand', 'creatures/basic/' + basicCreature + '.png')
        }
        
        // Cursors        
        this.load.image('cursor_sword', 'battle/cursors/sword.png');
        

        // Создаем текстуру для свечения (если ещё не создана)
        if (!this.textures.exists('glowTexture')) {
            // 1. Создаем временный canvas
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // 2. Рисуем радиальный градиент
            const gradient = ctx.createRadialGradient(
                size / 2, size / 2, 0,
                size / 2, size / 2, size / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();

            // 3. Добавляем текстуру в менеджер текстур Phaser
            this.textures.addCanvas('glowTexture', canvas);
        }
        
        // Craft
        this.load.image('blacksmith', 'craft/blacksmith.png');
        this.load.image('parchment', 'craft/parchment.png');
        this.load.image('rune_frame', 'runes/rune_frame.png');
        this.load.image('fire_shard', 'runes/fire_shard.png');
        this.load.image('water_shard', 'runes/water_shard.png');
        this.load.image('grass_shard', 'runes/grass_shard.png');
        this.load.image('beast_shard', 'runes/beast_shard.png');
        this.load.image('bird_shard', 'runes/bird_shard.png');
        this.load.image('reptile_shard', 'runes/reptile_shard.png');
        this.load.image('hope_shard', 'runes/hope_shard.png');
        this.load.image('rage_shard', 'runes/rage_shard.png');
        this.load.image('passion_shard', 'runes/passion_shard.png');
        this.load.image('lock', 'craft/lock.png');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start(gameStore.currentSceneName);
    }
}
