<?php

namespace Tests\Feature\Shop;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\PricePeriod;
use App\Models\Product;
use App\Notifications\Shop\NewOrderReceived;
use App\Notifications\Shop\OrderConfirmation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected function createProduct(array $attributes = []): Product
    {
        $category = Category::create(['name' => 'Barbecues', 'slug' => 'barbecues-'.uniqid()]);

        return Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Barbecue Test',
            'slug' => 'barbecue-test-'.uniqid(),
            'description' => 'Un barbecue de test.',
            'price' => 100000,
        ], $attributes));
    }

    /**
     * @param  array<int, array{product_id: int, quantity: int}>  $items
     * @return array<string, mixed>
     */
    protected function payload(array $items, array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Awa Koné',
            'customer_phone' => '+225 07 00 00 00 00',
            'customer_email' => 'awa@test.ci',
            'address' => 'Cocody, rue des Jardins',
            'city' => 'Abidjan',
            'items' => $items,
        ], $overrides);
    }

    public function test_an_order_is_created_from_the_cart(): void
    {
        Notification::fake();
        $product = $this->createProduct(['price' => 150000]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 2],
        ]))->assertRedirect();

        $order = Order::sole();

        $this->assertSame('Awa Koné', $order->customer_name);
        $this->assertSame(OrderStatus::Pending, $order->status);
        $this->assertSame(300000, $order->total);
        $this->assertSame(1, $order->items()->count());
    }

    public function test_the_total_is_computed_server_side_and_ignores_the_client(): void
    {
        Notification::fake();
        $product = $this->createProduct(['price' => 150000]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 1],
        ], ['total' => 1]));

        $this->assertSame(150000, Order::sole()->total);
    }

    public function test_an_active_promotion_is_billed_instead_of_the_base_price(): void
    {
        Notification::fake();
        $product = $this->createProduct(['price' => 150000]);

        PricePeriod::create([
            'product_id' => $product->id,
            'label' => 'Soldes',
            'price' => 100000,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
        ]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 2],
        ]));

        $this->assertSame(200000, Order::sole()->total);
    }

    public function test_the_same_product_listed_twice_is_merged_into_one_line(): void
    {
        Notification::fake();
        $product = $this->createProduct(['price' => 100000]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
            ['product_id' => $product->id, 'quantity' => 2],
        ]));

        $order = Order::sole();

        $this->assertSame(1, $order->items()->count());
        $this->assertSame(3, $order->items()->sole()->quantity);
        $this->assertSame(300000, $order->total);
    }

    public function test_ordering_decrements_a_tracked_stock(): void
    {
        Notification::fake();
        $product = $this->createProduct(['stock' => 5]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 2],
        ]));

        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_a_made_to_order_product_has_no_stock_to_decrement(): void
    {
        Notification::fake();
        $product = $this->createProduct(['stock' => null]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 40],
        ]));

        $this->assertNull($product->fresh()->stock);
        $this->assertSame(1, Order::count());
    }

    public function test_an_out_of_stock_product_cannot_be_ordered(): void
    {
        Notification::fake();
        $product = $this->createProduct(['stock' => 0]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertSessionHasErrors('items');

        $this->assertSame(0, Order::count());
    }

    public function test_ordering_more_than_the_stock_is_refused_and_changes_nothing(): void
    {
        Notification::fake();
        $product = $this->createProduct(['stock' => 2]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 3],
        ]))->assertSessionHasErrors('items');

        $this->assertSame(0, Order::count());
        $this->assertSame(2, $product->fresh()->stock);
    }

    public function test_an_inactive_product_cannot_be_ordered(): void
    {
        Notification::fake();
        $product = $this->createProduct(['is_active' => false]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]))->assertSessionHasErrors('items');

        $this->assertSame(0, Order::count());
    }

    public function test_the_shop_and_the_customer_are_notified(): void
    {
        Notification::fake();
        $product = $this->createProduct();

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]));

        Notification::assertSentOnDemand(
            NewOrderReceived::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === config('shop.notification_email'),
        );

        Notification::assertSentOnDemand(
            OrderConfirmation::class,
            fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'awa@test.ci',
        );
    }

    public function test_a_customer_without_an_email_gets_no_confirmation(): void
    {
        Notification::fake();
        $product = $this->createProduct();

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ], ['customer_email' => null]));

        $this->assertSame(1, Order::count());

        Notification::assertSentOnDemand(NewOrderReceived::class);
        Notification::assertNotSentTo(new AnonymousNotifiable, OrderConfirmation::class);
    }

    /**
     * Notification::fake() never runs toMail(), so the templates are rendered
     * for real here: a broken email would otherwise sail through every other
     * test in this file.
     */
    public function test_the_customer_confirmation_email_renders_the_order(): void
    {
        Notification::fake();
        $product = $this->createProduct(['name' => 'Barbecue Vulkan', 'price' => 150000]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 2],
        ]));

        $order = Order::sole();
        $rendered = (string) (new OrderConfirmation($order))->toMail(new AnonymousNotifiable)->render();

        $this->assertStringContainsString($order->reference, $rendered);
        $this->assertStringContainsString('Barbecue Vulkan', $rendered);
        $this->assertStringContainsString('300 000 FCFA', $rendered);
        $this->assertStringContainsString('Awa Koné', $rendered);
    }

    public function test_the_shop_alert_email_renders_the_order(): void
    {
        Notification::fake();
        $product = $this->createProduct(['name' => 'Barbecue Vulkan', 'price' => 150000]);

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]));

        $order = Order::sole();
        $rendered = (string) (new NewOrderReceived($order))->toMail(new AnonymousNotifiable)->render();

        $this->assertStringContainsString($order->reference, $rendered);
        $this->assertStringContainsString('Barbecue Vulkan', $rendered);
        $this->assertStringContainsString('+225 07 00 00 00 00', $rendered);
    }

    public function test_the_confirmation_page_rejects_an_unsigned_link(): void
    {
        Notification::fake();
        $product = $this->createProduct();

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]));

        $order = Order::sole();

        $this->get("/commande/{$order->reference}/confirmation")->assertForbidden();
    }

    public function test_the_confirmation_page_accepts_the_signed_link(): void
    {
        Notification::fake();
        $product = $this->createProduct();

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ]));

        $this->get(Order::sole()->confirmationUrl())->assertOk();
    }

    public function test_checkout_validates_the_customer_details(): void
    {
        $product = $this->createProduct();

        $this->post('/commande', $this->payload([
            ['product_id' => $product->id, 'quantity' => 1],
        ], ['customer_name' => '', 'customer_phone' => '']))
            ->assertSessionHasErrors(['customer_name', 'customer_phone']);

        $this->assertSame(0, Order::count());
    }

    public function test_an_empty_cart_is_refused(): void
    {
        $this->post('/commande', $this->payload([]))
            ->assertSessionHasErrors('items');
    }
}
