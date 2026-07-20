<?php

namespace Database\Seeders;

use App\Actions\Teams\CreateTeam;
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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@ivoircuisson.ci'],
            [
                'name' => 'Admin IvoirCuisson',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        $admin->forceFill(['is_admin' => true])->save();

        // Le starter suppose que chaque utilisateur a une team personnelle
        // (redirections post-login) : sans elle, la connexion plante.
        if ($admin->teams()->count() === 0) {
            app(CreateTeam::class)->handle($admin, "Admin's Team", isPersonal: true);
        }

        $this->call(ShopSeeder::class);
    }
}
