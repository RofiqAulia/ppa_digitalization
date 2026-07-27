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
            $table->string('unplanned_stop')->nullable()->after('planning_qty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iqf_logsheets', function (Blueprint $table) {
            $table->dropColumn('unplanned_stop');
        });
    }
};
