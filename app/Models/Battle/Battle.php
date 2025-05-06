<?php

namespace App\Models\Battle;

use App\Models\User;
use Barryvdh\LaravelIdeHelper\Eloquent;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @mixin Eloquent
 *
 * @property int $id
 * @property int $player1_id
 * @property int|null $player2_id
 * @property integer $round
 * @property array $map
 * @property Carbon $finished_at
 *
 * @property-read User $player1
 * @property-read Collection $sides
 */
class Battle extends Model
{
    use HasFactory;

    protected $casts = [
        'map' => 'array',
        'finished_at' => 'timestamp',
    ];

    protected $fillable = [
        'player1_id',
        'player2_id',
        'round',
        'map',
    ];

    public function player1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    public function player2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    public function sides(): HasMany
    {
        return $this->hasMany(BattleSide::class);
    }
}
