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
        this.load.setPath('/assets');

        this.load.image('logo', 'logo.png');
        this.load.image('sky', 'sky.png');
        this.load.image('star', 'star.png');
        this.load.image('bomb', 'bomb.png');
        this.load.image('ground', 'platform.png');
        // this.load.spritesheet('dude', 'dude.png', {frameWidth: 32, frameHeight: 48});

        /**
         * BATTLE
         */
        // Battle backgrounds
        this.load.image('battle-background-1-back_land', 'battle/backgrounds/game_background_1/layers/back_land.png');
        this.load.image('battle-background-1-battleground', 'battle/backgrounds/game_background_1/layers/battleground.png');
        this.load.spritesheet('hexagon', 'battle/hexagon/hexagon3.png', {frameWidth: 95, frameHeight: 110});

        // Pink_Monster
        this.load.spritesheet('Pink_Monster_walk', 'creatures/Pink_Monster/walk.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Pink_Monster_attack1', 'creatures/Pink_Monster/attack1.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Pink_Monster_hurt', 'creatures/Pink_Monster/hurt.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Pink_Monster_death', 'creatures/Pink_Monster/death.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Pink_Monster_idle', 'creatures/Pink_Monster/idle.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('Pink_Monster_stand', 'creatures/Pink_Monster/stand.png');
        // Owlet_Monster
        this.load.spritesheet('Owlet_Monster_walk', 'creatures/Owlet_Monster/walk.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Owlet_Monster_attack1', 'creatures/Owlet_Monster/attack1.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Owlet_Monster_hurt', 'creatures/Owlet_Monster/hurt.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Owlet_Monster_death', 'creatures/Owlet_Monster/death.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Owlet_Monster_idle', 'creatures/Owlet_Monster/idle.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('Owlet_Monster_stand', 'creatures/Owlet_Monster/stand.png');
        // Dude_Monster
        this.load.spritesheet('Dude_Monster_walk', 'creatures/Dude_Monster/walk.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Dude_Monster_attack1', 'creatures/Dude_Monster/attack1.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Dude_Monster_hurt', 'creatures/Dude_Monster/hurt.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Dude_Monster_death', 'creatures/Dude_Monster/death.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('Dude_Monster_idle', 'creatures/Dude_Monster/idle.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('Dude_Monster_stand', 'creatures/Dude_Monster/stand.png');
        
        // Pokemons
        const pokemonList = [
            // 'Arcanine',
            // 'Cyndaquil',
            // // 'Cyndaquil', TODO слишком большой
            // 'Ninetales',
            // 'Torkoal',
            // 'Salandit',
            // 'Fletchling',
            // 'Fuecoco',
            // 'Chesnaught',
            'Decidueye',
            'Sandslash',
            'Ekans',
            'Hoppip',
            'Mudkip',
            'Oshawott',
            'Piplup',
            'Popplio',
            'Quaxly',
            'Rowlet',
            'Squirtle',
            'Totodile',
            'Treecko',
            'Turtwig',
            'Wingull',
        ];
        for (const pokemonName of pokemonList) {
            this.load.spritesheet(pokemonName + '_Pokemon_walk', 'creatures/' + pokemonName + '_Pokemon/walk.png', {
                frameWidth: 48,
                frameHeight: 32
            });
            this.load.spritesheet(pokemonName + '_Pokemon_attack1', 'creatures/' + pokemonName + '_Pokemon/attack1.png', {
                frameWidth: 48,
                frameHeight: 32
            });
            this.load.spritesheet(pokemonName + '_Pokemon_hurt', 'creatures/' + pokemonName + '_Pokemon/hurt.png', {
                frameWidth: 48,
                frameHeight: 32
            });
            this.load.spritesheet(pokemonName + '_Pokemon_death', 'creatures/' + pokemonName + '_Pokemon/sleep.png', {
                frameWidth: 32,
                frameHeight: 32
            });
            this.load.spritesheet(pokemonName + '_Pokemon_idle', 'creatures/' + pokemonName + '_Pokemon/idle.png', {
                frameWidth: 48,
                frameHeight: 32
            });
            this.load.image(pokemonName + '_Pokemon_stand', 'creatures/' + pokemonName + '_Pokemon/stand.png');
        }
        
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

        /**
         * Craft Game Crucible Of Souls
         */
        // this.load.image('craft-game-crucible-of-souls-background', 'craftGames/crucibleOfSouls/background.jpg');
        // this.load.image('craft-game-crucible-of-souls-hammer', 'craftGames/crucibleOfSouls/hammer.png');
        // this.load.spritesheet('craft-game-crucible-of-souls-shard', 'craftGames/crucibleOfSouls/shard.png', {
        //     frameWidth: 72,
        //     frameHeight: 72
        // });
        // this.load.image('craft-game-crucible-of-souls-temperatureBar', 'assets/temperature_bar.png');
        // this.load.image('craft-game-crucible-of-souls-temperatureIndicator', 'assets/temp_indicator.png');
        // this.load.audio('hammerHit', 'assets/hammer_hit.wav');
        // this.load.audio('success', 'assets/success.wav');
        // this.load.audio('overheat', 'assets/overheat.wav');

        // Исследование уровней

        // Загрузка текстур (заглушки)
        // Загружаем тайлы (временно - цветные прямоугольники)
        // this.load.image('grass', 'explorationLevel/1 Tiles/Tile_12.png');
        // this.load.image('floor', 'explorationLevel/1 Tiles/Tile_12.png');
        // this.load.image('tree', 'explorationLevel/3 Objects/Trees/1.png');
        // this.load.image('portal', 'explorationLevel/3 Objects/Ladders/1.png');
        // this.load.image('wall', 'explorationLevel/1 Tiles/Tile_31.png'); // Добавили текстуру стен
        //
        // this.load.image('chest', 'explorationLevel/3 Objects/Boxes/1.png');
        // this.load.image('reward', 'explorationLevel/3 Objects/Stones/5.png');
        // this.load.image('enemy', 'bomb.png');
        // this.load.image('boss', 'star.png');
        // this.load.image('trap', 'explorationLevel/3 Objects/Pointers/1.png');

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
