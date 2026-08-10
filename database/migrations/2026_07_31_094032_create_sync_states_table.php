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
        if (!Schema::hasTable('sync_states')) {
            Schema::create('sync_states', function (Blueprint $table) {
                $table->id();
                $table->string('entity')->unique(); // e.g., 'iqf_logsheets'
                $table->unsignedBigInteger('last_synced_id')->default(0);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_states');
    }
};
