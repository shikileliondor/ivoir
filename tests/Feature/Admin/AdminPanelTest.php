<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\PricePeriod;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

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

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect(route('login'));
    }

    public function test_non_admin_users_are_forbidden(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admin_can_view_the_dashboard(): void
    {
        $this->actingAs($this->createAdmin())
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->has('stats')
                ->has('visitSeries', 14));
    }

    public function test_admin_can_create_a_product(): void
    {
        $category = Category::create(['name' => 'Fumoirs', 'slug' => 'fumoirs']);

        $this->actingAs($this->createAdmin())
            ->post(route('admin.products.store'), [
                'name' => 'Fumoir Géant',
                'category_id' => $category->id,
                'description' => 'Un fumoir très grand.',
                'price' => 250000,
                'is_featured' => 1,
                'is_active' => 1,
                'specs' => [['key' => 'Hauteur', 'value' => '180 cm']],
            ])
            ->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'name' => 'Fumoir Géant',
            'slug' => 'fumoir-geant',
            'price' => 250000,
        ]);

        $this->assertSame(
            ['Hauteur' => '180 cm'],
            Product::where('slug', 'fumoir-geant')->firstOrFail()->specs,
        );
    }

    public function test_category_with_products_cannot_be_deleted(): void
    {
        $product = $this->createProduct();

        $this->actingAs($this->createAdmin())
            ->from(route('admin.categories.index'))
            ->delete(route('admin.categories.destroy', $product->category))
            ->assertSessionHasErrors('category');

        $this->assertDatabaseHas('categories', ['id' => $product->category_id]);
    }

    public function test_admin_can_update_order_status(): void
    {
        $order = Order::create([
            'reference' => Order::generateReference(),
            'customer_name' => 'Client Test',
            'customer_phone' => '0700000000',
            'address' => 'Cocody',
            'city' => 'Abidjan',
            'status' => OrderStatus::Pending,
            'total' => 100000,
        ]);

        $this->actingAs($this->createAdmin())
            ->from(route('admin.orders.show', $order))
            ->put(route('admin.orders.update', $order), ['status' => 'delivered'])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertSame(OrderStatus::Delivered, $order->fresh()->status);
    }

    public function test_cancelling_an_order_puts_its_units_back_in_stock(): void
    {
        $product = $this->createProduct(['stock' => 3]);
        $order = $this->createOrderFor($product, quantity: 2);

        $this->actingAs($this->createAdmin())
            ->put(route('admin.orders.update', $order), ['status' => 'cancelled']);

        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_cancelling_an_already_cancelled_order_does_not_inflate_the_stock(): void
    {
        $product = $this->createProduct(['stock' => 3]);
        $order = $this->createOrderFor($product, quantity: 2);
        $admin = $this->createAdmin();

        $this->actingAs($admin)->put(route('admin.orders.update', $order), ['status' => 'cancelled']);
        $this->actingAs($admin)->put(route('admin.orders.update', $order), ['status' => 'cancelled']);

        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_cancelling_leaves_made_to_order_products_alone(): void
    {
        $product = $this->createProduct(['stock' => null]);
        $order = $this->createOrderFor($product, quantity: 2);

        $this->actingAs($this->createAdmin())
            ->put(route('admin.orders.update', $order), ['status' => 'cancelled']);

        $this->assertNull($product->fresh()->stock);
    }

    protected function createOrderFor(Product $product, int $quantity): Order
    {
        $order = Order::create([
            'reference' => Order::generateReference(),
            'customer_name' => 'Client Test',
            'customer_phone' => '0700000000',
            'address' => 'Cocody',
            'city' => 'Abidjan',
            'status' => OrderStatus::Pending,
            'total' => $product->price * $quantity,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => $quantity,
        ]);

        return $order;
    }

    public function test_active_price_period_changes_the_shop_price(): void
    {
        $product = $this->createProduct(['price' => 100000]);

        PricePeriod::create([
            'product_id' => $product->id,
            'label' => 'Promo test',
            'price' => 80000,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
        ]);

        $this->get(route('products.show', $product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/products/show')
                ->where('product.price', 80000)
                ->where('product.originalPrice', 100000)
                ->where('product.promoLabel', 'Promo test'));
    }

    public function test_expired_price_period_does_not_change_the_shop_price(): void
    {
        $product = $this->createProduct(['price' => 100000]);

        PricePeriod::create([
            'product_id' => $product->id,
            'price' => 80000,
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->subDay(),
        ]);

        $this->get(route('products.show', $product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('product.price', 100000)
                ->where('product.originalPrice', null));
    }

    public function test_orders_are_charged_at_the_promotional_price(): void
    {
        $product = $this->createProduct(['price' => 100000]);

        PricePeriod::create([
            'product_id' => $product->id,
            'price' => 80000,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
        ]);

        $this->post(route('orders.store'), [
            'customer_name' => 'Client Promo',
            'customer_phone' => '0700000000',
            'address' => 'Cocody',
            'city' => 'Abidjan',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Client Promo',
            'total' => 160000,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'unit_price' => 80000,
        ]);
    }

    public function test_overlapping_price_periods_are_rejected(): void
    {
        $product = $this->createProduct();

        PricePeriod::create([
            'product_id' => $product->id,
            'price' => 80000,
            'starts_at' => now(),
            'ends_at' => now()->addDays(10),
        ]);

        $this->actingAs($this->createAdmin())
            ->from(route('admin.pricing.index'))
            ->post(route('admin.pricing.store'), [
                'product_id' => $product->id,
                'price' => 70000,
                'starts_at' => now()->addDays(5)->format('Y-m-d H:i'),
                'ends_at' => now()->addDays(15)->format('Y-m-d H:i'),
            ])
            ->assertSessionHasErrors('starts_at');

        $this->assertSame(1, PricePeriod::count());
    }

    public function test_shop_visits_are_tracked(): void
    {
        $this->createProduct();

        $this->get(route('products.index'))->assertOk();

        $this->assertDatabaseHas('visits', ['path' => '/produits']);
    }

    public function test_admin_pages_are_not_tracked_as_visits(): void
    {
        $this->actingAs($this->createAdmin())->get('/admin')->assertOk();

        $this->assertDatabaseMissing('visits', ['path' => '/admin']);
    }
}
