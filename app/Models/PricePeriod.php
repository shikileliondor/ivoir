<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A promotional price applied to a product between two dates.
 *
 * @property int $id
 * @property int $product_id
 * @property string|null $label
 * @property int $price
 * @property Carbon $starts_at
 * @property Carbon $ends_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 */
#[Fillable(['product_id', 'label', 'price', 'starts_at', 'ends_at'])]
class PricePeriod extends Model
{
    /**
     * Get the product this price period applies to.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope the query to periods currently in effect.
     *
     * @param  Builder<PricePeriod>  $query
     */
    public function scopeCurrent(Builder $query): void
    {
        $query->where('starts_at', '<=', now())->where('ends_at', '>=', now());
    }

    /**
     * Whether this period is in effect right now.
     */
    public function isCurrent(): bool
    {
        return $this->starts_at->lte(now()) && $this->ends_at->gte(now());
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }
}
