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
        Schema::create('iqf_logsheets', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('shift'); // 1, 2, 3
            $table->string('product_type'); // siomay, pentol, lumpia, adonan_pangsit
            $table->string('machine'); // IQF 1, IQF 2
            $table->integer('planning_qty')->default(0); // Input from SPV
            $table->string('status')->default('ongoing'); // ongoing, completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iqf_logsheets');
    }
};
