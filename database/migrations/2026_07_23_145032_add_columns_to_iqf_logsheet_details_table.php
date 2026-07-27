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
        Schema::table('iqf_logsheet_details', function (Blueprint $table) {
            $table->string('suhu_panel')->nullable()->after('time');
            $table->string('suhu_produk')->nullable()->after('suhu_panel');
            $table->integer('rak')->nullable()->after('suhu_produk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iqf_logsheet_details', function (Blueprint $table) {
            $table->dropColumn(['suhu_panel', 'suhu_produk', 'rak']);
        });
    }
};
