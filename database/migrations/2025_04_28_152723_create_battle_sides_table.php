<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('battle_sides', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('battle_id');
            $table->unsignedBigInteger('creature_id');
            $table->tinyInteger('side');
            $table->integer('position');
            $table->integer('queue');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battle_sides');
    }
};
