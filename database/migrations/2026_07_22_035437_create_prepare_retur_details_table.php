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
        Schema::create('prepare_retur_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prepare_header_id')->constrained('prepare_headers')->onDelete('cascade');
            $table->enum('product_type', ['siomay', 'pentol', 'lumpia']);
            $table->decimal('serah_terima_retur_gr', 12, 2)->nullable();
            $table->decimal('retur_prepare_to_produksi_gr', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepare_retur_details');
    }
};
