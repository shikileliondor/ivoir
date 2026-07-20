<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * List all products for the admin.
     */
    public function index(): Response
    {
        $products = Product::query()
            ->with(['category', 'activePricePeriod'])
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'currentPrice' => $product->currentPrice(),
                'promoLabel' => $product->activePricePeriod?->label,
                'stock' => $product->stock,
                'image' => $product->image,
                'isFeatured' => $product->is_featured,
                'isActive' => $product->is_active,
                'category' => $product->category->name,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the product creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'product' => null,
        ]);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateProduct($request);

        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated['specs'] = $this->specsToMap($validated['specs'] ?? null);

        if ($request->hasFile('image')) {
            $validated['image'] = '/storage/'.$request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return redirect()->route('admin.products.index')->with('success', 'Produit créé.');
    }

    /**
     * Show the product edit form.
     */
    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'product' => [
                'id' => $product->id,
                'slug' => $product->slug,
                'name' => $product->name,
                'description' => $product->description,
                'specs' => $product->specs,
                'price' => $product->price,
                'stock' => $product->stock,
                'image' => $product->image,
                'isFeatured' => $product->is_featured,
                'isActive' => $product->is_active,
                'categoryId' => $product->category_id,
            ],
        ]);
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validateProduct($request);

        if ($validated['name'] !== $product->name) {
            $validated['slug'] = $this->uniqueSlug($validated['name'], $product->id);
        }

        $validated['specs'] = $this->specsToMap($validated['specs'] ?? null);

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($product);
            $validated['image'] = '/storage/'.$request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('admin.products.index')->with('success', 'Produit mis à jour.');
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->deleteUploadedImage($product);
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Produit supprimé.');
    }

    /**
     * Validate the shared product form fields.
     *
     * @return array<string, mixed>
     */
    protected function validateProduct(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'description' => ['required', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            // Left empty, the product is made to order and never runs out.
            'stock' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'image' => ['nullable', 'image', 'max:4096'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'specs' => ['nullable', 'array', 'max:20'],
            'specs.*.key' => ['required', 'string', 'max:100'],
            'specs.*.value' => ['required', 'string', 'max:255'],
        ]);
    }

    /**
     * Turn the submitted key/value rows into the stored specs map.
     *
     * @param  array<int, array{key: string, value: string}>|null  $rows
     * @return array<string, string>|null
     */
    protected function specsToMap(?array $rows): ?array
    {
        if ($rows === null || $rows === []) {
            return null;
        }

        $map = [];

        foreach ($rows as $row) {
            $map[$row['key']] = $row['value'];
        }

        return $map;
    }

    /**
     * Generate a unique slug from the product name.
     */
    protected function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (Product::query()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    /**
     * Delete the product image if it was uploaded through the admin.
     * Seeded images under /images are left alone.
     */
    protected function deleteUploadedImage(Product $product): void
    {
        if ($product->image !== null && str_starts_with($product->image, '/storage/')) {
            Storage::disk('public')->delete(Str::after($product->image, '/storage/'));
        }
    }
}
