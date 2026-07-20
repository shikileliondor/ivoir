<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $reference
 * @property string $customer_name
 * @property string $customer_phone
 * @property string|null $customer_email
 * @property string $address
 * @property string $city
 * @property OrderStatus $status
 * @property int $total
 * @property string|null $kkiapay_transaction_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, OrderItem> $items
 */
#[Fillable(['reference', 'customer_name', 'customer_phone', 'customer_email', 'address', 'city', 'status', 'total', 'kkiapay_transaction_id'])]
class Order extends Model
{
    /**
     * Generate a unique human-readable order reference.
     */
    public static function generateReference(): string
    {
        do {
            $reference = 'IVC-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (static::where('reference', $reference)->exists());

        return $reference;
    }

    /**
     * Get the items of this order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * A signed link to this order's confirmation page.
     *
     * References are short and readable, so they must not be enough on their
     * own to pull up a stranger's name, phone number and address. The
     * signature is what actually grants access; it is handed to the customer
     * on checkout and by email.
     */
    public function confirmationUrl(): string
    {
        return URL::temporarySignedRoute(
            'orders.confirmation',
            now()->addDays(config('shop.confirmation_link_days')),
            ['order' => $this],
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'total' => 'integer',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
