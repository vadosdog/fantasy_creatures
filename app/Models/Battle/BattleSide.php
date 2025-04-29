<?php

namespace app\Models\Battle;

use app\Models\Creature\Creature;
use Barryvdh\LaravelIdeHelper\Eloquent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin Eloquent
 *
 * @property int $battle_id
 * @property int $creature_id
 * @property-read int $side
 * @property int $position
 *
 * @property-read Battle $battle
 * @property-read Creature $creature
 */
class BattleSide extends Model
{
    use HasFactory;

    public function battle(): BelongsTo
    {
        return $this->belongsTo(Battle::class);
    }

    public function creature(): BelongsTo
    {
        return $this->belongsTo(Creature::class);
    }
}
