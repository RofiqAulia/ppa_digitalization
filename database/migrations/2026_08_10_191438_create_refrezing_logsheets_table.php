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
        Schema::create('refrezing_logsheets', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('shift');
            $table->string('product_type');
            $table->string('machine');
            $table->string('batch_number')->nullable();
            $table->string('unplanned_stop')->nullable();
            $table->integer('planning_qty')->default(0);
            $table->string('status')->default('ongoing');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refrezing_logsheets');
    }
};
