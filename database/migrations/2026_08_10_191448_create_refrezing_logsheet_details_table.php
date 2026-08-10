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
        Schema::create('refrezing_logsheet_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('refrezing_logsheet_id')->constrained('refrezing_logsheets')->onDelete('cascade');
            $table->time('time');
            $table->string('rak')->nullable();
            $table->integer('tray_count');
            $table->string('suhu_panel')->nullable();
            $table->string('suhu_produk')->nullable();
            $table->string('pic')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refrezing_logsheet_details');
    }
};
