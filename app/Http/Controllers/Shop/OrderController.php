<?php

namespace App\Http\Controllers\Shop;

use App\Actions\Shop\CreateOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\StoreOrderRequest;
use App\Models\Order;
use App\Notifications\Shop\NewOrderReceived;
use App\Notifications\Shop\OrderConfirmation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display the checkout page.
     */
    public function checkout(): Response
    {
        return Inertia::render('shop/checkout');
    }

    /**
     * Create an order from the submitted cart.
     */
    public function store(StoreOrderRequest $request, CreateOrder $createOrder): RedirectResponse
    {
        $order = $createOrder->handle($request->customer(), $request->quantities());

        $this->notify($order);

        return redirect()->to($order->confirmationUrl());
    }

    /**
     * Display the order confirmation page. Reached through a signed link,
     * so the reference alone is not enough to read a customer's details.
     */
    public function confirmation(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('shop/order-confirmation', [
            'order' => [
                'reference' => $order->reference,
                'customerName' => $order->customer_name,
                'customerPhone' => $order->customer_phone,
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
     * Tell the shop about the order, and the customer if they left an email.
     *
     * Both notifications are queued, so a slow or unreachable mail server
     * cannot hold up — or fail — a checkout whose order is already stored.
     * This means a queue worker has to be running for anything to actually
     * leave the building.
     */
    protected function notify(Order $order): void
    {
        Notification::route('mail', config('shop.notification_email'))
            ->notify(new NewOrderReceived($order));

        if ($order->customer_email !== null) {
            Notification::route('mail', $order->customer_email)
                ->notify(new OrderConfirmation($order));
        }
    }
}
