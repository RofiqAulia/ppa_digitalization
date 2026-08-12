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
        Schema::table('iqf_logsheets', function (Blueprint $table) {
            $table->string('refrezing')->nullable()->after('status');
            $table->string('spv')->nullable()->after('machine');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iqf_logsheets', function (Blueprint $table) {
            $table->dropColumn(['refrezing', 'spv']);
        });
    }
};
