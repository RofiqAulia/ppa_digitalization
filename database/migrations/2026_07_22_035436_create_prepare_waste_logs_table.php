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
        Schema::create('prepare_waste_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prepare_header_id')->constrained('prepare_headers')->onDelete('cascade');
            $table->enum('waste_type', ['plastik', 'ham_adonan', 'bowlcutter_dimsum']);
            $table->decimal('weight_gr', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepare_waste_logs');
    }
};
