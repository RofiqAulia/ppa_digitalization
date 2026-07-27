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
        Schema::create('prepare_product_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prepare_header_id')->constrained('prepare_headers')->onDelete('cascade');
            $table->enum('product_type', ['siomay', 'pentol', 'lumpia']);
            $table->decimal('recipe_plan', 12, 2);
            $table->decimal('recipe_real', 12, 2)->nullable();
            $table->decimal('dikichi', 12, 2)->nullable();
            $table->decimal('adonan_akhir_gr', 12, 2)->nullable();
            $table->decimal('adonan_masuk_gr', 12, 2)->nullable();
            $table->decimal('waste_gr', 12, 2)->nullable();
            $table->decimal('retur_gr', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepare_product_details');
    }
};
