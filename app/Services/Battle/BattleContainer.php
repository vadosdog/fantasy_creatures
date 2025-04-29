<?php

namespace app\Services\Battle;

use app\Models\Battle\Battle;
use app\Models\Battle\BattleSide;
use App\Models\User;
use Illuminate\Support\Collection;

class BattleContainer
{
    private \Illuminate\Database\Eloquent\Collection $queue;
    private array $map;

    public function __construct(protected Battle $battle)
    {
        $this->queue = $this->battle->sides->load('creature.abilities')->sortBy('queue');
        $this->map = $this->battle->map;
    }

    public static function createPvPBattle(User $user1, User $user2): Battle
    {
        return new Battle([]);
    }

    public static function createPvEBattle(User $user1, Collection $against): self
    {
        $battle = new Battle([
            'player1_id' => $user1->id,
            'map' => self::createMap(),
        ]);
        $battle->save();
        $queue = [];
        $mapSize = count($battle->map);
        foreach ($user1->creatures as $i => $creature) {
            $queue[] = [
                'creature_id' => $creature->id,
                'position' => $i,
                'side' => 1,
                'battle_id' => $battle->id,
            ];
        }

        foreach ($against as $i => $creature) {
            $queue[] = [
                'creature_id' => $creature->id,
                'position' => $mapSize - 1 - $i,
                'side' => 2,
                'battle_id' => $battle->id,
            ];
        }

        // определение инициативы
        shuffle($queue);

        foreach ($queue as $i => &$queueItem) {
            $queueItem['queue'] = $i;
        }
        BattleSide::insert($queue);

        $battle = Battle::find($battle->id); // гомосятина
        return new self($battle);
    }

    private static function createMap(int $x = 8, int $y = 8): array
    {
        $map = [];
        for ($i = 0; $i < $x; $i++) {
            for ($j = 0; $j < $y; $j++) {
                $map[] = [
                    'x' => $i,
                    'y' => $j,
                    'type' => 0, // Тут может храниться тип поля
                ];
            }
        }
        return $map;
    }

    public function getInfo(): array
    {
        $orderIndex = $this->battle->round % $this->queue->count();
        return [
            'battle_id' => $this->battle->id,
            'round' => $this->battle->round,
            'map' => $this->getMapArray(),
            'queue' => $this->queue->toArray(),
            'nextCreature' => $this->queue[$orderIndex]->creature,
        ];
    }

    public function getMapArray(): array
    {
        $rows = [];
        $map = $this->map;
        foreach ($this->queue as $item) {
            if ($item['position'] < 0) {
                continue;
            }
            $map[$item['position']]['creature'] = $item['creature'];
        }
        foreach ($map as $item) {
            $string = '';
            if (isset($item['creature'])) {
                $string = $item['creature']['name'];
            }
            $rows[$item['x']][$item['y']] = $string;
        }
        return $rows;
    }

    public function isFinished(): bool
    {
        if (!$this->battle->finished_at && $this->checkWinner()) {
            $this->battle->finished_at = now();
            $this->battle->save();

        }
        return $this->battle->finished_at !== null;
    }

    public function getNextCreature(): BattleSide
    {
        $orderIndex = $this->battle->round % $this->queue->count();
        return $this->queue[$orderIndex];
    }

    public function getQueue(): Collection
    {
        return $this->queue;
    }

    public function getRoute(BattleSide $side1, BattleSide $side2): array
    {
        $start = [$this->map[$side1->position]['x'], $this->map[$side1->position]['y']];
        $end = [$this->map[$side2->position]['x'], $this->map[$side2->position]['y']];
        $grid = $this->getMapArray();
        // Определяем размеры массива
        $rows = count($grid);
        $cols = count($grid[0]);

        // Если начальная или конечная точка не найдены
        if (!$start || !$end) {
            throw new \Exception("Start or end point not found.");
        }

        // Определяем направления движения (включая диагонали)
        $directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        // BFS для поиска пути
        $queue = [];
        $queue[] = [$start[0], $start[1], []]; // [x, y, путь]
        $visited = [];

        while (!empty($queue)) {
            list($x, $y, $path) = array_shift($queue);
            $visited["$x,$y"] = true;
            $path[] = [$x, $y];

            // Если достигли целевой точки
            if ($x === $end[0] && $y === $end[1]) {
                return $path;
            }

            // Проверяем все направления
            foreach ($directions as [$dx, $dy]) {
                $newX = $x + $dx;
                $newY = $y + $dy;

                // Проверка границ и препятствий
                if ($newX >= 0 && $newX < $rows &&
                    $newY >= 0 && $newY < $cols &&
                    !isset($visited["$newX,$newY"]) &&
                    ($grid[$newX][$newY] === '' || ($newX === $end[0] && $newY === $end[1]))) {

                    // Добавляем новую позицию в очередь
                    $queue[] = [$newX, $newY, $path];
                }
            }
        }

        throw new \Exception("No path found.");
    }

    public function turn(BattleSide $getNextCreature, $action, array $target): string //переделать на лог
    {
        if ($action === 'skip') {
            $log = '';
        }
        if ($action === 'attack') {
            $log = $this->attack($getNextCreature, $target);
        }
        if ($action === 'move') {
            $log = $this->move($getNextCreature, $target);
        }

        if ($this->checkWinner()) {
            $this->battle->finished_at = now();
            $log .= "Бой Закончен!";
        } else {
            $this->battle->round++;
        }
        $this->battle->save();
        return $log;
    }

    private function attack(BattleSide $currentCreature, array $target): string
    {
        $position = null;
        foreach ($this->map as $i => $mapItem) {
            if ($mapItem['x'] === $target[0] && $mapItem['y'] === $target[1]) {
                $position = $i;
            }
        }

        /** @var BattleSide $target */
        $target = $this->queue->filter(fn(BattleSide $side) => $side->position === $position)->first();
        $currentAttacks = $currentCreature->creature->abilities[random_int(0, count($currentCreature->creature->abilities) - 1)];
        $log = "Атака: " . $currentAttacks->name . ". Шанс: " . $currentAttacks->chance . "\n";
        $dice = random_int(1, 100);
        $log .= "Dice: " . $dice . "\n";
        $success = $dice < $currentAttacks->chance;
        if ($success) {
            $log .= "Попал! Урон: " . $currentAttacks->power . "\n";
            $target->creature->health -= $currentAttacks->power;
            $log .= "Здоровье " . $target->creature->name . ": " . $target->creature->health . "\n";
        } else {
            $log .= "Промах\n";
        }

        if ($target->creature->health <= 0) {
            $target->position = -1;
            $log .= $target->creature->name . " выбывает!" . "\n";
        }
        $target->creature->save();
        $target->save();
        return $log;
    }

    private function move(BattleSide $getNextCreature, array $target): string
    {
        foreach ($this->map as $position => $mapItem) {
            if ($mapItem['x'] === $target[0] && $mapItem['y'] === $target[1]) {
                $getNextCreature->position = $position;
                $getNextCreature->save();
            }
        }
        return "Перемещение";
    }

    public function checkWinner(): bool
    {
        $sideA = collect([]);
        $sideB = collect([]);
        $firstSide = $this->battle->sides->first()->side;
        foreach ($this->battle->sides->filter(fn(BattleSide $side) => $side->creature->health > 0) as $side) {
            /** @var BattleSide $side */
            if ($side->side === $firstSide) {
                $sideA->push($side);
            } else {
                $sideB->push($side);
            }
        }

        return $sideA->isEmpty() || $sideB->isEmpty();
    }
}
