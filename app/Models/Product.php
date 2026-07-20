<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property array<string, string>|null $specs
 * @property int $price
 * @property int|null $stock
 * @property string|null $image
 * @property bool $is_featured
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read Collection<int, PricePeriod> $pricePeriods
 * @property-read PricePeriod|null $activePricePeriod
 */
#[Fillable(['category_id', 'name', 'slug', 'description', 'specs', 'price', 'stock', 'image', 'is_featured', 'is_active'])]
class Product extends Model
{
    /**
     * Get the category this product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all price periods of this product.
     *
     * @return HasMany<PricePeriod, $this>
     */
    public function pricePeriods(): HasMany
    {
        return $this->hasMany(PricePeriod::class);
    }

    /**
     * Get the price period currently in effect, if any.
     *
     * @return HasOne<PricePeriod, $this>
     */
    public function activePricePeriod(): HasOne
    {
        return $this->hasOne(PricePeriod::class)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->orderByDesc('starts_at');
    }

    /**
     * The price to charge right now: the active promotional
     * price if one exists, otherwise the base price.
     */
    public function currentPrice(): int
    {
        return $this->activePricePeriod->price ?? $this->price;
    }

    /**
     * Whether this product's stock is counted. Products left at null are
     * made to order and never run out.
     */
    public function tracksStock(): bool
    {
        return $this->stock !== null;
    }

    /**
     * Whether the given quantity can be ordered right now.
     */
    public function hasStockFor(int $quantity = 1): bool
    {
        return ! $this->tracksStock() || $this->stock >= $quantity;
    }

    /**
     * Scope the query to active products.
     *
     * @param  Builder<Product>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'price' => 'integer',
            'stock' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
