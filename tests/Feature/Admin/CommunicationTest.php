<?php

namespace Tests\Feature\Admin;

use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use App\Notifications\Shop\NewContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CommunicationTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_visitors_can_subscribe_to_the_newsletter(): void
    {
        $this->post('/newsletter', ['email' => 'Client@Test.CI'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'client@test.ci']);
    }

    public function test_subscribing_twice_does_not_duplicate_or_fail(): void
    {
        $this->post('/newsletter', ['email' => 'client@test.ci']);
        $this->post('/newsletter', ['email' => 'CLIENT@test.ci'])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(1, NewsletterSubscriber::count());
    }

    public function test_newsletter_rejects_an_invalid_email(): void
    {
        $this->post('/newsletter', ['email' => 'pas-un-email'])
            ->assertSessionHasErrors('email');

        $this->assertSame(0, NewsletterSubscriber::count());
    }

    public function test_contact_messages_are_stored_and_alert_the_shop(): void
    {
        Notification::fake();

        $this->post('/contact', [
            'name' => 'Awa Koné',
            'email' => 'awa@test.ci',
            'phone' => '+225 07 00 00 00 00',
            'message' => 'Je voudrais 3 fourneaux.',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Awa Koné',
            'phone' => '+225 07 00 00 00 00',
            'read_at' => null,
        ]);

        Notification::assertSentOnDemand(
            NewContactMessage::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === config('shop.notification_email'),
        );
    }

    /**
     * Notification::fake() never runs toMail(), so the template is rendered
     * for real here rather than only asserted as "sent".
     */
    public function test_the_contact_alert_email_renders_the_message(): void
    {
        $contact = ContactMessage::create([
            'name' => 'Awa Koné',
            'email' => 'awa@test.ci',
            'phone' => '+225 07 00 00 00 00',
            'message' => 'Je voudrais 3 fourneaux pour mon maquis.',
        ]);

        $rendered = (string) (new NewContactMessage($contact))->toMail(new AnonymousNotifiable)->render();

        $this->assertStringContainsString('Awa Koné', $rendered);
        $this->assertStringContainsString('Je voudrais 3 fourneaux pour mon maquis.', $rendered);
        $this->assertStringContainsString('+225 07 00 00 00 00', $rendered);
    }

    public function test_non_admins_cannot_reach_the_communication_panel(): void
    {
        $this->get('/admin/communication')->assertRedirect('/login');

        $this->actingAs(User::factory()->create())
            ->get('/admin/communication')
            ->assertForbidden();
    }

    public function test_admin_sees_messages_subscribers_and_stats(): void
    {
        ContactMessage::create([
            'name' => 'Awa Koné',
            'phone' => '0700000000',
            'message' => 'Bonjour',
        ]);
        NewsletterSubscriber::create(['email' => 'client@test.ci']);

        $this->actingAs($this->createAdmin())
            ->get('/admin/communication')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/communication')
                ->has('messages.data', 1)
                ->where('messages.data.0.name', 'Awa Koné')
                ->where('messages.data.0.isRead', false)
                ->has('subscribers.data', 1)
                ->where('stats.unreadMessages', 1)
                ->where('stats.totalSubscribers', 1));
    }

    public function test_admin_can_filter_unread_messages_and_search(): void
    {
        ContactMessage::create([
            'name' => 'Awa Koné',
            'phone' => '0700000000',
            'message' => 'Bonjour',
            'read_at' => now(),
        ]);
        ContactMessage::create([
            'name' => 'Kouassi Yao',
            'phone' => '0500000000',
            'message' => 'Devis svp',
        ]);

        $admin = $this->createAdmin();

        $this->actingAs($admin)
            ->get('/admin/communication?non_lus=1')
            ->assertInertia(fn (Assert $page) => $page
                ->has('messages.data', 1)
                ->where('messages.data.0.name', 'Kouassi Yao'));

        $this->actingAs($admin)
            ->get('/admin/communication?q=Devis')
            ->assertInertia(fn (Assert $page) => $page
                ->has('messages.data', 1)
                ->where('messages.data.0.name', 'Kouassi Yao'));
    }

    public function test_admin_can_toggle_a_message_between_read_and_unread(): void
    {
        $message = ContactMessage::create([
            'name' => 'Awa Koné',
            'phone' => '0700000000',
            'message' => 'Bonjour',
        ]);
        $admin = $this->createAdmin();

        $this->actingAs($admin)->put("/admin/communication/messages/{$message->id}");
        $this->assertNotNull($message->fresh()->read_at);

        $this->actingAs($admin)->put("/admin/communication/messages/{$message->id}");
        $this->assertNull($message->fresh()->read_at);
    }

    public function test_admin_can_delete_a_message_and_a_subscriber(): void
    {
        $message = ContactMessage::create([
            'name' => 'Awa Koné',
            'phone' => '0700000000',
            'message' => 'Bonjour',
        ]);
        $subscriber = NewsletterSubscriber::create(['email' => 'client@test.ci']);
        $admin = $this->createAdmin();

        $this->actingAs($admin)->delete("/admin/communication/messages/{$message->id}");
        $this->actingAs($admin)->delete("/admin/communication/abonnes/{$subscriber->id}");

        $this->assertSame(0, ContactMessage::count());
        $this->assertSame(0, NewsletterSubscriber::count());
    }

    public function test_admin_can_export_subscribers_as_csv(): void
    {
        NewsletterSubscriber::create(['email' => 'client@test.ci']);

        $response = $this->actingAs($this->createAdmin())
            ->get('/admin/communication/abonnes/export')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $this->assertStringContainsString('client@test.ci', $response->streamedContent());
    }
}
