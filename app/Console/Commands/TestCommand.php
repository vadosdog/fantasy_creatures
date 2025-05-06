<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Battle\Battle;
use App\Models\Creature\Creature;
use App\Models\User;
use App\Services\ArtificialEnemy\ArtificialEnemyV1;
use App\Services\Battle\BattleContainer;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

class TestCommand extends Command
{
    protected $signature = 'testing';

    public function handle(): void
    {
        /** @var Battle $battle */
        $battle = Battle::where('finished_at')->first();
        $battleContainer = null;
        if ($battle === null) {
            /** @var User $user */
            $user = User::first();
            /** @var Collection<Creature> $opponents */
            $opponents = Creature::whereNull('owner_id')->get();
            foreach ($user->creatures as $creature) {
                $creature->health = $creature->health_limit;
                $creature->save();
            }
            foreach ($opponents as $creature) {
                $creature->health = $creature->health_limit;
                $creature->save();
            }
            $battleContainer = BattleContainer::createPvEBattle($user, $opponents);
        } else {
            $battleContainer = new BattleContainer($battle);
        }

        $i = 0;
        $this->printMap($battleContainer);
        $this->confirm('Next?');
        while ($i++ < 100 && !$battleContainer->isFinished()) {
            $currentCreature = $battleContainer->getInfo()['nextCreature']['name'];
            $this->info("Round $i. Ход " . $currentCreature);
            $this->printMap($battleContainer);
            $ai = new ArtificialEnemyV1($battleContainer);
            $turn = $ai->getTurn();
            if ($turn[0] === 'attack') {
                $this->info("$currentCreature атакует " . $turn[2]->creature->name);
            } if ($turn[0] === 'skip') {
                $this->info("$currentCreature пропускает ");
            }
            $log = $battleContainer->turn($battleContainer->getNextCreature(), ...$turn);
            $this->info($log);
            $this->confirm('Next?');
        }

        $this->info("Битва окончена");
    }

    protected function printMap(BattleContainer $container): void
    {
        $rows = $container->getMapArray();
        foreach ($rows as $i => &$row) {
            array_unshift($row, $i);
        }
        $this->table(['', 0, 1, 2, 3, 4, 5, 6, 7], $rows);
    }

    public function testBattle(): void
    {
        //
        $creatures = Creature::all();
        /** @var Creature $creature1 */
        /** @var Creature $creature2 */
        $creature1 = $creatures->first();
        $creature2 = $creatures->last();
        $currentRound = 0;
        while ($creature1->health > 0 and $creature2->health > 0 and $currentRound++ < 100) {
            $this->info("Round $currentRound");
            $currentCreature = $currentRound % 2 === 1 ? $creature1 : $creature2;
            $opponents = $currentRound % 2 === 1 ? $creature2 : $creature1;
            $this->info("Ходит {$currentCreature->name}");
            $currentAttacks = $currentCreature->abilities[random_int(0, count($creature1->abilities) - 1)];
            $this->info("Атака: " . $currentAttacks->name . ". Порог: " . $currentAttacks->chance);
            $dice = random_int(1, 100);
            $success = $dice < $currentAttacks->chance;
            $this->info("Dice: " . $dice . ". " . ($success ? "Успех" : "Провал"));
            if ($success) {
                $opponents->health -= $currentAttacks->power;
            }
            $this->info("Урон: " . $currentAttacks->power . ". Здоровье (" . $opponents->name . "):" . $opponents->health);
            $this->info("=====");
        }

        if ($creature1->health <= 0) {
            $this->info("Выиграл " . $creature2->name);
        } else if ($creature2->health <= 0) {
            $this->info("Выиграл " . $creature1->name);
        } else {
            $this->info("Ничья");
        }
    }
}
