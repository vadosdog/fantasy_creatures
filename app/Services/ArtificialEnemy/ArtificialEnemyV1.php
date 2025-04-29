<?php

namespace app\Services\ArtificialEnemy;

use app\Models\Battle\BattleSide;
use app\Models\Creature\Creature;
use app\Services\Battle\BattleContainer;

class ArtificialEnemyV1
{
    private BattleSide $side;
    private Creature $creature;

    public function __construct(private BattleContainer $battleContainer)
    {
        $this->side = $battleContainer->getNextCreature();
        $this->creature = $this->side->creature;
    }

    /**
     * переделать на дто. Сейчас 0 - действие, 1 - цель
     */
    public function getTurn(): array
    {
        if ($this->side->position < 0) {
            return ['skip', []];
        }
        $opponents = $this->battleContainer->getQueue()
            ->filter(fn(BattleSide $queueItem) => $queueItem->side !== $this->side->side)
            ->filter(fn(BattleSide $queueItem) => $queueItem->position >= 0);
        /** @var BattleSide $target */
        $target = null;
        $targetDistance = null;
        $targetRoute = null;
        foreach ($opponents as $opponent) {
            /** @var BattleSide $opponent */
            $route = $this->battleContainer->getRoute($this->side, $opponent);
            $distance = count($route);

            if ($target === null) {
                $target = $opponent;
                $targetDistance = $distance;
                $targetRoute = $route;
                continue;
            }

            if ($distance < $targetDistance) {
                $target = $opponent;
                $targetDistance = $distance;
                $targetRoute = $route;
            }
        }

        // Если находятся на расстоянии атаки
        if ($targetDistance <= 2) {
            return ['attack', $targetRoute[1], $target];
        }

        return ['move', $targetRoute[1]];
    }
}
