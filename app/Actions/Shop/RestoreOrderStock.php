<?php

namespace App\Actions\Shop;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class RestoreOrderStock
{
    /**
     * Put the units of a cancelled order back on the shelf.
     *
     * Only products whose stock is tracked are touched, and items whose
     * product has since been deleted are skipped.
     */
    public function handle(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->loadMissing('items.product');

            foreach ($order->items as $item) {
                $product = $item->product;

                if ($product !== null && $product->tracksStock()) {
                    $product->increment('stock', $item->quantity);
                }
            }
        });
    }
}
