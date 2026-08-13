<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('iqf_logsheet_details', function (Blueprint $table) {
            $table->string('batch_number')->nullable()->after('iqf_logsheet_id');
        });

        // Migrate existing data: copy batch_number from parent logsheet to each detail row
        DB::statement('
            UPDATE iqf_logsheet_details d
            JOIN iqf_logsheets l ON d.iqf_logsheet_id = l.id
            SET d.batch_number = l.batch_number
            WHERE d.batch_number IS NULL AND l.batch_number IS NOT NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iqf_logsheet_details', function (Blueprint $table) {
            $table->dropColumn('batch_number');
        });
    }
};
