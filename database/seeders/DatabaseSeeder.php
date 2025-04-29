<?php

namespace Database\Seeders;

use app\Models\Creature\Creature;
use app\Models\Creature\CreatureAbility;
use App\Models\User;
use Illuminate\Database\Seeder;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        /** @var User $user */
        $user = User::first();
//        User::factory()->create([
//            'name' => 'Test User',
//            'email' => 'test@example.com',
//        ]);

        // Два существа
        $flameky = Creature::create([
            'name' => 'Flameky',
            'health' => 100,
            'health_limit' => 100,
            'owner_id' => $user->id,
        ]);
        CreatureAbility::create([
            'creature_id' => $flameky->id,
            'name' => 'Искры',
            'chance' => 90,
            'power' => 1,
        ]);
        CreatureAbility::create([
            'creature_id' => $flameky->id,
            'name' => 'Fireball',
            'chance' => 50,
            'power' => 5,
        ]);

        $bubbly = Creature::create([
            'name' => 'Bubbly',
            'health' => 100,
            'health_limit' => 100,
            'owner_id' => $user->id,
        ]);
        CreatureAbility::create([
            'creature_id' => $bubbly->id,
            'name' => 'Брызги',
            'chance' => 80,
            'power' => 2,
        ]);
        CreatureAbility::create([
            'creature_id' => $bubbly->id,
            'name' => 'Водомет',
            'chance' => 40,
            'power' => 8,
        ]);

        //Два диких существа
        $flameky = Creature::create([
            'name' => 'Droplet',
            'health' => 100,
            'health_limit' => 100,
        ]);
        CreatureAbility::create([
            'creature_id' => $flameky->id,
            'name' => 'Искры',
            'chance' => 90,
            'power' => 1,
        ]);
        CreatureAbility::create([
            'creature_id' => $flameky->id,
            'name' => 'Fireball',
            'chance' => 50,
            'power' => 5,
        ]);

        $bubbly = Creature::create([
            'name' => 'Bulbik',
            'health' => 100,
            'health_limit' => 100,
        ]);
        CreatureAbility::create([
            'creature_id' => $bubbly->id,
            'name' => 'Брызги',
            'chance' => 80,
            'power' => 2,
        ]);
        CreatureAbility::create([
            'creature_id' => $bubbly->id,
            'name' => 'Водомет',
            'chance' => 40,
            'power' => 8,
        ]);
    }
}
