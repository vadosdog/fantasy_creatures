<?php

namespace app\Models\Creature;

use Barryvdh\LaravelIdeHelper\Eloquent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin Eloquent
 *
 * @property int $creature_id
 * @property string $name
 * @property int $power
 * @property int $chance
 *
 * @property-read Creature $creature
 */
class CreatureAbility extends Model
{
    use HasFactory;

    public function ability(): BelongsTo
    {
        return $this->belongsTo(Creature::class);
    }
}
