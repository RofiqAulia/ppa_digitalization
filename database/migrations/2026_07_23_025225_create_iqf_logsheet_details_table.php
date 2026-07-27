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
        Schema::create('iqf_logsheet_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('iqf_logsheet_id')->constrained()->cascadeOnDelete();
            $table->time('time');
            $table->integer('tray_count');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iqf_logsheet_details');
    }
};
