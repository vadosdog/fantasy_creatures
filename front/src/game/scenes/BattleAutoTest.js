import {Scene} from 'phaser';
import {
    BATTLE_STATE_BATTLE_OVER_LOSE,
    BATTLE_STATE_BATTLE_OVER_WIN, useBattleStore
} from "../../store/battle.js";

export class BattleAutoTest extends Scene {
    constructor() {
        super('BattleAutoTest');
        this.store = useBattleStore();
        this.testResults = [];
        this.currentTest = 0;
        this.totalTests = 1000;
        this.creatureStats = new Map();
        this.creatueActionStats = new Map();
        this.actionStats = new Map()
    }

    create() {
        this.store.load();

        // Создаем UI для отображения прогресса
        this.createProgressUI();

        // Запускаем тесты
        this.runTests();
    }

    createProgressUI() {
        // Панель прогресса
        this.progressBar = this.add.rectangle(
            this.cameras.main.width / 2,
            50,
            this.cameras.main.width * 0.8,
            30,
            0x333333
        ).setOrigin(0.5);

        this.progressFill = this.add.rectangle(
            this.progressBar.x - this.progressBar.width / 2,
            this.progressBar.y,
            0,
            this.progressBar.height,
            0x4CAF50
        ).setOrigin(0, 0.5);

        this.progressText = this.add.text(
            this.progressBar.x,
            this.progressBar.y,
            `0/${this.totalTests}`,
            {fontSize: '18px', fill: '#ffffff'}
        ).setOrigin(0.5);

        // Кнопка запуска тестов
        this.startButton = this.add.text(
            this.cameras.main.width / 2,
            100,
            'Запустить тесты',
            {fontSize: '24px', fill: '#ffffff', backgroundColor: '#3e5a4d', padding: 10}
        )
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.runTests());

        // Область для вывода результатов
        this.resultsText = this.add.text(
            20,
            150,
            'Результаты будут отображены здесь после завершения тестов.\n\n' +
            'Для копирования статистики откройте консоль разработчика (F12).',
            {fontSize: '16px', fill: '#ffffff', wordWrap: {width: this.cameras.main.width - 40}}
        );
    }

    runTests() {
        this.startButton.setVisible(false);
        this.currentTest = 0;
        this.testResults = [];
        this.creatureStats.clear();
        this.creatueActionStats.clear();
        this.actionStats.clear();

        // Запускаем первый тест
        this.runNextTest();
    }

    runNextTest() {
        if (this.currentTest >= this.totalTests) {
            this.showFinalResults();
            return;
        }

        this.currentTest++;
        this.updateProgress();

        // Сбрасываем состояние боя
        this.store.resetBattle();

        // Запускаем тестовый бой
        this.simulateBattle();
    }

    simulateBattle() {
        // Запускаем цикл боя
        this.store.handleRound();

        // Используем setTimeout для избежания переполнения стека
        setTimeout(() => {
            if (this.store.round > 1000) {
                const result = {
                    winner: null,
                    turns: this.store.round,
                    leftTeam: this.store.leftTeam.map(c => c.id),
                    rightTeam: this.store.rightTeam.map(c => c.id),
                    survivors: this.store.creatures.filter(c => c.health > 0).map(c => c.id)
                };

                this.testResults.push(result);

                // Обновляем статистику по существам
                this.updateCreatureStats(result);

                // Запускаем следующий тест
                this.runNextTest();
            } else if (this.store.battleState === BATTLE_STATE_BATTLE_OVER_WIN ||
                this.store.battleState === BATTLE_STATE_BATTLE_OVER_LOSE) {

                // Записываем результат боя
                const result = {
                    winner: this.store.battleState === BATTLE_STATE_BATTLE_OVER_WIN ? 'left' : 'right',
                    turns: this.store.round,
                    leftTeam: this.store.leftTeam.map(c => c.id),
                    rightTeam: this.store.rightTeam.map(c => c.id),
                    survivors: this.store.creatures.filter(c => c.health > 0).map(c => c.id)
                };

                this.testResults.push(result);

                // Обновляем статистику по существам
                this.updateCreatureStats(result);

                // Запускаем следующий тест
                this.runNextTest();
            } else {
                // Продолжаем бой
                let {activeCreature, availableActions} = this.store.getTurn()

                if (activeCreature.health > 0 && availableActions.length > 0) {

                    // Автоматический выбор действия для ИИ
                    const randomAction = availableActions[0];
                    this.handleAction(randomAction, randomAction.targets);
                }


                this.store.endTurn();
                this.simulateBattle();
            }
        }, 0);
    }
    
    pushCreatureActionStat(creature, updateKey, value = 1) {
        if (!this.creatueActionStats.has(creature.id)) {
            this.creatueActionStats.set(creature.id, {
                kills: 0,
                damageDealt: 0,
                damagePotentialTaken: 0,
                damageTaken: 0,
                healingDone: 0,
                attacks: 0,
                moves: 0,
                treats: 0,
                defenses: 0,
                skips: 0,
                addedEffects: 0,
            });
        }
        const stats = this.creatueActionStats.get(creature.id);

        stats[updateKey] += value
    }
    
    pushActionStat(action, updateKey, value = 1) {
        if (!this.actionStats.has(action)) {
            this.actionStats.set(action, {
                name: action,
                kills: 0,
                damageDealt: 0,
                healingDone: 0,
                attacks: 0,
                treats: 0,
                addedEffects: 0,
            });
        }
        const stats = this.actionStats.get(action);

        stats[updateKey] += value
    }

    handleAction(action, position) {
        if (action.action === 'skip') {
            this.store.playerActionDefense()
            this.pushCreatureActionStat(this.store.activeCreature, 'skips')
        }

        let path = []
        let result
        switch (action.action) {
            case 'move':
                // Получаем путь от текущей позиции персонажа до выбранной клетки
                path = this.store.findPath(this.store.activeCreature.position, position);
                if (!path || path.length === 0) return;

                this.store.playerActionMoveTo(path)
                this.pushCreatureActionStat(this.store.activeCreature, 'moves')
                break
            case 'attack':
                const targetCreature = this.store.getCreatureByCoords(position)
                this.pushCreatureActionStat(this.store.activeCreature, 'attacks')
                this.pushActionStat(action.actionObject.name, 'attacks')
                result = this.store.playerActionAttack(position, action.actionObject)
                if (result.success) {
                    if (result.health === 0) {
                        this.pushCreatureActionStat(this.store.activeCreature, 'kills')
                        this.pushActionStat(action.actionObject.name, 'kills')
                    }

                    this.pushCreatureActionStat(this.store.activeCreature, 'damageDealt', result.damage)
                    this.pushCreatureActionStat(this.store.activeCreature, 'addedEffects', result.effects.length)
                    this.pushActionStat(action.actionObject.name, 'damageDealt', result.damage)
                    this.pushActionStat(action.actionObject.name, 'addedEffects', result.effects.length)
                    this.pushCreatureActionStat(targetCreature, 'damageTaken', result.damage)
                    this.pushCreatureActionStat(targetCreature, 'damagePotentialTaken', result.potentialDamage)
                }
                break
            case 'treat':
                this.pushCreatureActionStat(this.store.activeCreature, 'treats')
                this.pushActionStat(action.actionObject.name, 'treats')
                result = this.store.playerActionTreat(position, action.actionObject)
                if (result.success) {
                    this.pushCreatureActionStat(this.store.activeCreature, 'healingDone', result.damage)
                    this.pushCreatureActionStat(this.store.activeCreature, 'addedEffects', result.effects.length)
                    this.pushActionStat(action.actionObject.name, 'healingDone', result.damage)
                    this.pushActionStat(action.actionObject.name, 'addedEffects', result.effects.length)
                }
                break;
            case 'skip':
                this.store.playerActionDefense()
                break
            default:
                // неизвестное действие
                return
        }
    }


    updateCreatureStats(result) {
        // Обновляем статистику для каждого существа
        const allCreatures = [...this.store.leftTeam, ...this.store.rightTeam];

        allCreatures.forEach(creature => {
            if (!this.creatureStats.has(creature.id)) {
                this.creatureStats.set(creature.id, {
                    name: creature.name,
                    id: creature.id,
                    maxHealth: creature.maxHealthStat,
                    team: this.store.leftTeam.includes(creature) ? 'left' : 'right',
                    battles: 0,
                    wins: 0,
                    survived: 0,
                    kills: 0,
                    damageDealt: 0,
                    damageTaken: 0,
                    healingDone: 0,
                    attacks: 0,
                    moves: 0,
                    treats: 0,
                    defenses: 0,
                    skip: 0,
                });
            }

            const stats = this.creatureStats.get(creature.id);
            stats.battles++;

            // Проверяем, выжило ли существо
            if (result.survivors.includes(creature.id)) {
                stats.survived++;
            }

            // Проверяем, победила ли команда существа
            if ((stats.team === 'left' && result.winner === 'left') ||
                (stats.team === 'right' && result.winner === 'right')) {
                stats.wins++;
            }

            // Добавляем статистику по действиям (можно расширить)
            // ...
        });
    }

    updateProgress() {
        const progress = this.currentTest / this.totalTests;
        this.progressFill.width = this.progressBar.width * progress;
        this.progressText.setText(`${this.currentTest}/${this.totalTests}`);
    }

    showFinalResults() {
        // Рассчитываем общую статистику
        const leftWins = this.testResults.filter(r => r.winner === 'left').length;
        const rightWins = this.testResults.filter(r => r.winner === 'right').length;
        const leftWinRate = (leftWins / this.totalTests * 100).toFixed(1);
        const rightWinRate = (rightWins / this.totalTests * 100).toFixed(1);
        const avgTurns = (this.testResults.reduce((sum, r) => sum + r.turns, 0) / this.totalTests).toFixed(1);

        // Формируем текст результатов
        let resultsText = `=== ОБЩАЯ СТАТИСТИКА ===\n`;
        resultsText += `Побед левой команды: ${leftWins} (${leftWinRate}%)\n`;
        resultsText += `Побед правой команды: ${rightWins} (${rightWinRate}%)\n`;
        resultsText += `Средняя продолжительность боя: ${avgTurns} ходов\n\n`;

        resultsText += `=== СТАТИСТИКА ПО СУЩЕСТВАМ ===\n`;

        // Группируем существа по командам
        const leftTeamStats = [];
        const rightTeamStats = [];

        this.creatureStats.forEach(stats => {
            if (stats.team === 'left') {
                leftTeamStats.push(stats);
            } else {
                rightTeamStats.push(stats);
            }
        });

        // Добавляем статистику для левой команды
        resultsText += `ЛЕВАЯ КОМАНДА:\n`;
        leftTeamStats.sort((a,b) => a.name.localeCompare(b.name)).forEach(stats => {
            const winRate = (stats.wins / stats.battles * 100).toFixed(1);
            const survivalRate = (stats.survived / stats.battles * 100).toFixed(1);

            resultsText += `${stats.name} (${stats.id}) | `;
            resultsText += `  ${stats.wins}/${stats.battles} (${winRate}%) | `;
            resultsText += `  ${stats.survived}/${stats.battles} (${survivalRate}%)\n`;
            // resultsText += `  Средний урон: ${(stats.damageDealt / stats.battles).toFixed(1)}\n`;
            // resultsText += `  Среднее лечение: ${(stats.healingDone / stats.battles).toFixed(1)}\n\n`;
        });

        // Добавляем статистику для правой команды
        resultsText += `ПРАВАЯ КОМАНДА:\n`;
        rightTeamStats.sort((a,b) => a.name.localeCompare(b.name)).forEach(stats => {
            const winRate = (stats.wins / stats.battles * 100).toFixed(1);
            const survivalRate = (stats.survived / stats.battles * 100).toFixed(1);

            resultsText += `${stats.name} (${stats.id}) | `;
            resultsText += `  ${stats.wins}/${stats.battles} (${winRate}%) | `;
            resultsText += `  ${stats.survived}/${stats.battles} (${survivalRate}%)\n`;
            // resultsText += `  Средний урон: ${(stats.damageDealt / stats.battles).toFixed(1)}\n`;
            // resultsText += `  Среднее лечение: ${(stats.healingDone / stats.battles).toFixed(1)}\n\n`;
        });

        // Отображаем результаты на экране
        this.resultsText.setText(resultsText);

        // Выводим результаты в консоль для удобного копирования
        console.log('=== РЕЗУЛЬТАТЫ АВТОТЕСТОВ БОЕВ ===');
        console.log(resultsText);
        console.log('=== ЭФФЕКТИВНОСТЬ ===')
        console.log('ЛЕВАЯ КОМАНДА')
        leftTeamStats.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
            const stat = this.creatueActionStats.get(c.id)
            const batles = c.battles
            if (!stat) {
                return
            }
            let resultText = `${c.name} (${c.id})`;
            resultText += ' | K: ' + (stat.kills / c.battles).toFixed(2) ;
            resultText += ' | DD: ' + (stat.damageDealt / c.battles / c.maxHealth).toFixed(2) ;
            resultText += ' | DPT: ' + (stat.damagePotentialTaken / c.battles / c.maxHealth).toFixed(2);
            resultText += ' | DT: ' + (stat.damageTaken / c.battles / c.maxHealth).toFixed(2);
            resultText += ' | HD: ' + (stat.healingDone / c.battles / c.maxHealth).toFixed(2);
            resultText += ' | A: ' + (stat.attacks / c.battles).toFixed(2);
            resultText += ' | M: ' + (stat.moves / c.battles).toFixed(2);
            resultText += ' | T: ' + (stat.treats / c.battles).toFixed(2);
            resultText += ' | D: ' + (stat.defenses / c.battles).toFixed(2);
            resultText += ' | S: ' + (stat.skips / c.battles).toFixed(2);
            resultText += ' | E: ' + (stat.addedEffects / c.battles).toFixed(2);
            console.log(resultText)
        })
        console.log('ПРАВА КОМАНДА')
        rightTeamStats.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
            const stat = this.creatueActionStats.get(c.id)
            if (!stat) {
                return
            }
            let resultText = `${c.name} (${c.id})`;
            resultText += ' | K: ' + (stat.kills / c.battles).toFixed(2) ;
            resultText += ' | DD: ' + (stat.damageDealt / c.battles).toFixed(2) ;
            resultText += ' | DPT: ' + (stat.damagePotentialTaken / c.battles).toFixed(2);
            resultText += ' | DT: ' + (stat.damageTaken / c.battles).toFixed(2);
            resultText += ' | HD: ' + (stat.healingDone / c.battles).toFixed(2);
            resultText += ' | A: ' + (stat.attacks / c.battles).toFixed(2);
            resultText += ' | M: ' + (stat.moves / c.battles).toFixed(2);
            resultText += ' | T: ' + (stat.treats / c.battles).toFixed(2);
            resultText += ' | D: ' + (stat.defenses / c.battles).toFixed(2);
            resultText += ' | S: ' + (stat.skips / c.battles).toFixed(2);
            resultText += ' | E: ' + (stat.addedEffects / c.battles).toFixed(2);
            console.log(resultText)
        })
        
        console.log('Эффективность навыков')
        this.actionStats.forEach(s => {
            console.log(s)
            if (s.kills) {
                console.log(s.attacks / s.kills)
            }
        })

        // Показываем кнопку для повторного запуска тестов
        this.startButton.setVisible(true).setText('Запустить тесты снова');
    }
}