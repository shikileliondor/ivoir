<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display the product catalog, optionally filtered by category.
     */
    public function index(Request $request): Response
    {
        $categorySlug = $request->string('categorie')->toString();

        $products = Product::query()
            ->active()
            ->with(['category', 'activePricePeriod'])
            ->when($categorySlug !== '', fn ($query) => $query
                ->whereHas('category', fn ($q) => $q->where('slug', $categorySlug)))
            ->orderBy('name')
            ->get();

        return Inertia::render('shop/products/index', [
            'products' => static::toProductArray($products),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'activeCategory' => $categorySlug !== '' ? $categorySlug : null,
        ]);
    }

    /**
     * Display a single product page.
     */
    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load(['category', 'activePricePeriod']);

        $related = Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'activePricePeriod'])
            ->take(3)
            ->get();

        return Inertia::render('shop/products/show', [
            'product' => static::toProductArray(collect([$product]))[0],
            'relatedProducts' => static::toProductArray($related),
        ]);
    }

    /**
     * Shape products for the frontend.
     *
     * @param  Collection<int, Product>  $products
     * @return array<int, array<string, mixed>>
     */
    public static function toProductArray(Collection $products): array
    {
        return $products->map(fn (Product $product) => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'specs' => $product->specs,
            'price' => $product->currentPrice(),
            'originalPrice' => $product->activePricePeriod !== null ? $product->price : null,
            'promoLabel' => $product->activePricePeriod?->label,
            'promoEndsAt' => $product->activePricePeriod?->ends_at->toIso8601String(),
            'image' => $product->image,
            'isFeatured' => $product->is_featured,
            'inStock' => $product->hasStockFor(),
            // Null for made-to-order products, so the shop only shows a
            // countdown when the stock is actually being tracked.
            'stock' => $product->stock,
            'category' => [
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ],
        ])->values()->all();
    }
}
