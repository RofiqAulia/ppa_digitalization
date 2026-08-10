<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * 
     * Akun Admin Panel (login via /login dengan password):
     *   - admin@example.com      / password
     *   - mrofiqaulia@gmail.com  / password123
     * 
     * Akun Terminal Operator (login via /operator/login dengan email saja):
     *   - budi@operator.com      → Budi Santoso
     *   - siti@operator.com      → Siti Aminah
     *   - agus@operator.com      → Agus Pratama
     *   - rudi@operator.com      → Rudi Hermawan
     *   - dewi@operator.com      → Dewi Lestari
     */
    public function run(): void
    {
        // ─── AKUN ADMIN PANEL ──────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'              => 'Admin',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'mrofiqaulia@gmail.com'],
            [
                'name'              => 'M. Rofiq Aulia',
                'password'          => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // ─── AKUN OPERATOR TERMINAL ────────────────────────────────────
        $operators = [
            ['name' => 'Budi Santoso',   'email' => 'budi@operator.com'],
            ['name' => 'Siti Aminah',    'email' => 'siti@operator.com'],
            ['name' => 'Agus Pratama',   'email' => 'agus@operator.com'],
            ['name' => 'Rudi Hermawan',  'email' => 'rudi@operator.com'],
            ['name' => 'Dewi Lestari',   'email' => 'dewi@operator.com'],
        ];

        foreach ($operators as $op) {
            User::updateOrCreate(
                ['email' => $op['email']],
                [
                    'name'              => $op['name'],
                    'password'          => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->call([
            PrepareProductionSeeder::class,
        ]);
    }
}
