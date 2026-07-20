<?php

namespace Tests\Feature\Admin;

use App\Models\SiteImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SiteImageTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_non_admin_users_are_forbidden(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.site-images.index'))
            ->assertForbidden();
    }

    public function test_admin_sees_all_slots_with_defaults(): void
    {
        $this->actingAs($this->createAdmin())
            ->get(route('admin.site-images.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/site-images')
                ->has('slots', count(SiteImage::SLOTS))
                ->where('slots.0.key', 'logo')
                ->where('slots.0.isCustom', false));
    }

    public function test_admin_can_replace_a_site_image(): void
    {
        Storage::fake('public');

        $this->actingAs($this->createAdmin())
            ->post(route('admin.site-images.update', 'logo'), [
                'image' => UploadedFile::fake()->image('logo.png', 400, 400),
            ])
            ->assertRedirect(route('admin.site-images.index'));

        $override = SiteImage::query()->where('key', 'logo')->firstOrFail();

        $this->assertStringStartsWith('/storage/site/', $override->path);
        Storage::disk('public')->assertExists(substr($override->path, strlen('/storage/')));

        // Le site public reçoit la nouvelle image via les props partagées.
        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('siteImages.logo', $override->path)
                ->where('siteImages.home_hero', SiteImage::SLOTS['home_hero']['default']));
    }

    public function test_replacing_again_deletes_the_previous_upload(): void
    {
        Storage::fake('public');
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.site-images.update', 'logo'), [
            'image' => UploadedFile::fake()->image('first.png'),
        ]);

        $firstPath = SiteImage::query()->where('key', 'logo')->firstOrFail()->path;

        $this->actingAs($admin)->post(route('admin.site-images.update', 'logo'), [
            'image' => UploadedFile::fake()->image('second.png'),
        ]);

        Storage::disk('public')->assertMissing(substr($firstPath, strlen('/storage/')));
        $this->assertSame(1, SiteImage::query()->where('key', 'logo')->count());
    }

    public function test_admin_can_restore_the_default_image(): void
    {
        Storage::fake('public');
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.site-images.update', 'home_hero'), [
            'image' => UploadedFile::fake()->image('hero.jpg'),
        ]);

        $path = SiteImage::query()->where('key', 'home_hero')->firstOrFail()->path;

        $this->actingAs($admin)
            ->delete(route('admin.site-images.destroy', 'home_hero'))
            ->assertRedirect(route('admin.site-images.index'));

        $this->assertDatabaseMissing('site_images', ['key' => 'home_hero']);
        Storage::disk('public')->assertMissing(substr($path, strlen('/storage/')));

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('siteImages.home_hero', SiteImage::SLOTS['home_hero']['default']));
    }

    public function test_about_slot_has_no_default_until_an_upload(): void
    {
        Storage::fake('public');
        $admin = $this->createAdmin();

        // Sans upload, la page À propos garde son placeholder (null).
        $this->get(route('about'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('siteImages.about', null));

        $this->actingAs($admin)->post(route('admin.site-images.update', 'about'), [
            'image' => UploadedFile::fake()->image('atelier.jpg'),
        ])->assertRedirect(route('admin.site-images.index'));

        $path = SiteImage::query()->where('key', 'about')->firstOrFail()->path;

        $this->get(route('about'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('siteImages.about', $path));

        // Retirer l'image ramène au placeholder, pas à un fichier.
        $this->actingAs($admin)->delete(route('admin.site-images.destroy', 'about'));

        $this->get(route('about'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('siteImages.about', null));
    }

    public function test_unknown_slot_is_rejected(): void
    {
        $this->actingAs($this->createAdmin())
            ->post(route('admin.site-images.update', 'inconnu'), [
                'image' => UploadedFile::fake()->image('x.png'),
            ])
            ->assertNotFound();
    }
}
