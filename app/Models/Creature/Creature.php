<?php

namespace App\Models\Creature;

use App\Models\User;
use Barryvdh\LaravelIdeHelper\Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @mixin Eloquent
 *
 * @property string $name
 * @property int $health
 * @property int $health_limit
 * @property int $owner_id
 *
 * @property-read Collection $abilities
 * @property-read User $owner
 */
class Creature extends Model
{
    use HasFactory;

    public function abilities(): HasMany
    {
        return $this->hasMany(CreatureAbility::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
