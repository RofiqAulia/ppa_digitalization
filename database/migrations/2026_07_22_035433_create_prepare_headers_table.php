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
        Schema::create('prepare_headers', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->enum('shift', ['1', '2', '3']);
            $table->enum('spv_name', ['IS', 'ROFI', 'JERE', 'IMAN', 'MUN', 'KA', 'ABDI', 'APRI']);
            $table->enum('status', ['planned', 'completed'])->default('planned');
            $table->decimal('total_recipe_plan', 12, 2);
            $table->decimal('total_recipe_real', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepare_headers');
    }
};
