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
        Schema::create('prepare_skin_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prepare_header_id')->constrained('prepare_headers')->onDelete('cascade');
            $table->enum('material_type', ['kulit_siomay', 'kulit_tahu']);
            $table->decimal('masuk', 12, 2)->nullable();
            $table->integer('sisa_pack')->nullable();
            $table->decimal('sisa_unit', 12, 2)->nullable();
            $table->decimal('waste_manual_gr', 12, 2)->nullable();
            $table->decimal('waste_tandon_gr', 12, 2)->nullable();
            $table->decimal('retur_pro_wh', 12, 2)->nullable();
            $table->decimal('retur_wh_pro', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepare_skin_materials');
    }
};
