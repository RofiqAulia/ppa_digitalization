<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default test user
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name'  => 'Test User', 'password' => \Illuminate\Support\Facades\Hash::make('password')]
        );

        // Admin user
        User::updateOrCreate(
            ['email' => 'mrofiqaulia@gmail.com'],
            [
                'name'              => 'M. Rofiq Aulia',
                'password'          => \Illuminate\Support\Facades\Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            PrepareProductionSeeder::class,
        ]);
    }
}
