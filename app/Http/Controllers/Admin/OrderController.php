<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Shop\RestoreOrderStock;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * List orders, filterable by status and searchable by
     * reference, customer name or phone.
     */
    public function index(Request $request): Response
    {
        $status = $request->string('statut')->toString();
        $search = $request->string('q')->toString();

        $orders = Order::query()
            ->withCount('items')
            ->when(OrderStatus::tryFrom($status) !== null, fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(fn ($q) => $q
                ->where('reference', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_phone', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $order) => [
                'reference' => $order->reference,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
                'city' => $order->city,
                'status' => $order->status->value,
                'total' => $order->total,
                'itemsCount' => $order->items_count,
                'createdAt' => $order->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'statut' => $status !== '' ? $status : null,
                'q' => $search !== '' ? $search : null,
            ],
        ]);
    }

    /**
     * Show one order in full.
     */
    public function show(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('admin/orders/show', [
            'order' => [
                'reference' => $order->reference,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
                'customerEmail' => $order->customer_email,
                'address' => $order->address,
                'city' => $order->city,
                'status' => $order->status->value,
                'total' => $order->total,
                'createdAt' => $order->created_at?->toIso8601String(),
                'items' => $order->items->map(fn ($item) => [
                    'productName' => $item->product_name,
                    'unitPrice' => $item->unit_price,
                    'quantity' => $item->quantity,
                ])->values()->all(),
            ],
        ]);
    }

    /**
     * Update the status of an order. Cancelling puts the reserved units back
     * on the shelf, but only on the way into "cancelled", so cancelling an
     * already-cancelled order cannot inflate the stock.
     */
    public function update(Request $request, Order $order, RestoreOrderStock $restoreStock): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $status = OrderStatus::from($validated['status']);
        $wasCancelled = $order->status === OrderStatus::Cancelled;

        $order->update(['status' => $status]);

        if ($status === OrderStatus::Cancelled && ! $wasCancelled) {
            $restoreStock->handle($order);

            return back()->with('success', 'Commande annulée, stock remis à jour.');
        }

        return back()->with('success', 'Statut mis à jour.');
    }
}
