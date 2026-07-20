<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PricePeriod;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PricePeriodController extends Controller
{
    /**
     * List all price periods with their status.
     */
    public function index(): Response
    {
        $periods = PricePeriod::query()
            ->with('product:id,name,price')
            ->orderByDesc('starts_at')
            ->get()
            ->map(fn (PricePeriod $period) => [
                'id' => $period->id,
                'label' => $period->label,
                'price' => $period->price,
                'startsAt' => $period->starts_at->toIso8601String(),
                'endsAt' => $period->ends_at->toIso8601String(),
                'status' => $this->status($period),
                'product' => [
                    'id' => $period->product->id,
                    'name' => $period->product->name,
                    'basePrice' => $period->product->price,
                ],
            ]);

        return Inertia::render('admin/pricing', [
            'periods' => $periods,
            'products' => Product::query()->orderBy('name')->get(['id', 'name', 'price']),
        ]);
    }

    /**
     * Create a price period.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePeriod($request);

        $this->ensureNoOverlap($validated);

        PricePeriod::create($validated);

        return redirect()->route('admin.pricing.index')->with('success', 'Période tarifaire créée.');
    }

    /**
     * Update a price period.
     */
    public function update(Request $request, PricePeriod $pricePeriod): RedirectResponse
    {
        $validated = $this->validatePeriod($request);

        $this->ensureNoOverlap($validated, ignoreId: $pricePeriod->id);

        $pricePeriod->update($validated);

        return redirect()->route('admin.pricing.index')->with('success', 'Période tarifaire mise à jour.');
    }

    /**
     * Delete a price period. The product falls back to its base price.
     */
    public function destroy(PricePeriod $pricePeriod): RedirectResponse
    {
        $pricePeriod->delete();

        return redirect()->route('admin.pricing.index')->with('success', 'Période tarifaire supprimée.');
    }

    /**
     * Validate the shared price period form fields.
     *
     * @return array{product_id: int, label: string|null, price: int, starts_at: string, ends_at: string}
     */
    protected function validatePeriod(Request $request): array
    {
        return $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'label' => ['nullable', 'string', 'max:100'],
            'price' => ['required', 'integer', 'min:1', 'max:100000000'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
        ]);
    }

    /**
     * Two periods for the same product must never overlap, otherwise
     * the price shown to customers would be ambiguous.
     *
     * @param  array{product_id: int, starts_at: string, ends_at: string}  $validated
     */
    protected function ensureNoOverlap(array $validated, ?int $ignoreId = null): void
    {
        $overlaps = PricePeriod::query()
            ->where('product_id', $validated['product_id'])
            ->where('starts_at', '<=', $validated['ends_at'])
            ->where('ends_at', '>=', $validated['starts_at'])
            ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists();

        if ($overlaps) {
            throw ValidationException::withMessages([
                'starts_at' => 'Une autre période tarifaire chevauche ces dates pour ce produit.',
            ]);
        }
    }

    /**
     * Whether the period is upcoming, active or expired.
     */
    protected function status(PricePeriod $period): string
    {
        if ($period->ends_at->isPast()) {
            return 'expired';
        }

        return $period->starts_at->isFuture() ? 'upcoming' : 'active';
    }
}
