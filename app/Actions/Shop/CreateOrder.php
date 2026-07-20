<?php

namespace App\Actions\Shop;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateOrder
{
    /**
     * Turn a validated cart into an order.
     *
     * Prices are always resolved from the database and never trusted from the
     * client. Stock is checked and decremented inside the same transaction,
     * with the product rows locked, so two customers racing for the last unit
     * cannot both get it.
     *
     * @param  array{customer_name: string, customer_phone: string, customer_email?: string|null, address: string, city: string}  $customer
     * @param  array<int, int>  $quantities  product id => quantity
     *
     * @throws ValidationException
     */
    public function handle(array $customer, array $quantities): Order
    {
        return DB::transaction(function () use ($customer, $quantities) {
            $products = $this->lockProducts(array_keys($quantities));

            $this->assertAvailable($products, $quantities);

            $order = Order::create([
                'reference' => Order::generateReference(),
                'customer_name' => $customer['customer_name'],
                'customer_phone' => $customer['customer_phone'],
                'customer_email' => $customer['customer_email'] ?? null,
                'address' => $customer['address'],
                'city' => $customer['city'],
                'status' => OrderStatus::Pending,
                'total' => $this->total($products, $quantities),
            ]);

            foreach ($quantities as $productId => $quantity) {
                /** @var Product $product */
                $product = $products[$productId];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->currentPrice(),
                    'quantity' => $quantity,
                ]);

                if ($product->tracksStock()) {
                    $product->decrement('stock', $quantity);
                }
            }

            return $order->load('items');
        });
    }

    /**
     * Load the ordered products, locked for the rest of the transaction.
     *
     * @param  array<int, int>  $productIds
     * @return Collection<int, Product>
     */
    protected function lockProducts(array $productIds): Collection
    {
        /** @var Collection<int, Product> $products */
        $products = Product::query()
            ->active()
            ->whereIn('id', $productIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        // Promotions are read after the lock: they only affect the price,
        // not whether the order can go through.
        $products->load('activePricePeriod');

        return $products;
    }

    /**
     * Refuse the whole order if anything in the cart went away or ran out
     * while the customer was filling in the form.
     *
     * @param  Collection<int, Product>  $products
     * @param  array<int, int>  $quantities
     *
     * @throws ValidationException
     */
    protected function assertAvailable(Collection $products, array $quantities): void
    {
        foreach ($quantities as $productId => $quantity) {
            if (! $products->has($productId)) {
                throw ValidationException::withMessages([
                    'items' => "Un produit de votre panier n'est plus disponible. Merci de le retirer et de réessayer.",
                ]);
            }

            /** @var Product $product */
            $product = $products[$productId];

            if (! $product->hasStockFor($quantity)) {
                throw ValidationException::withMessages([
                    'items' => $product->stock === 0
                        ? "« {$product->name} » est en rupture de stock."
                        : "Il ne reste que {$product->stock} exemplaire(s) de « {$product->name} ».",
                ]);
            }
        }
    }

    /**
     * Total of the cart, in CFA francs.
     *
     * @param  Collection<int, Product>  $products
     * @param  array<int, int>  $quantities
     */
    protected function total(Collection $products, array $quantities): int
    {
        $total = 0;

        foreach ($quantities as $productId => $quantity) {
            /** @var Product $product */
            $product = $products[$productId];
            $total += $product->currentPrice() * $quantity;
        }

        return $total;
    }
}
