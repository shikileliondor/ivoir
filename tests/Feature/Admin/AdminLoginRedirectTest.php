<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLoginRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_admin_lands_on_the_admin_panel_after_login(): void
    {
        $admin = $this->createAdmin();

        $this->post(route('login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect('/admin');
    }

    public function test_logged_in_admin_visiting_login_is_sent_to_the_admin_panel(): void
    {
        $this->actingAs($this->createAdmin())
            ->get(route('login'))
            ->assertRedirect('/admin');
    }

    public function test_logged_in_admin_without_any_team_does_not_crash_on_login_page(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true, 'current_team_id' => null])->save();
        $admin->teams()->detach();
        $admin->ownedTeams()->delete();

        $this->actingAs($admin->fresh())
            ->get(route('login'))
            ->assertRedirect('/admin');
    }

    public function test_logged_in_user_without_any_team_does_not_crash_on_login_page(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['current_team_id' => null])->save();
        $user->teams()->detach();
        $user->ownedTeams()->delete();

        $this->actingAs($user->fresh())
            ->get(route('login'))
            ->assertRedirect('/');
    }
}
