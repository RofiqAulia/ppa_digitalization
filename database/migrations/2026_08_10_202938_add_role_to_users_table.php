<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('operator')->after('email'); // 'admin' or 'operator'
        });

        // Mark existing users as admin if they have email_verified_at (seeded admins)
        // and set the known admin emails
        DB::table('users')
            ->whereIn('email', ['admin@example.com', 'mrofiqaulia@gmail.com'])
            ->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
