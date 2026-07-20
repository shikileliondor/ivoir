<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PricePeriod;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $monthStart = now()->startOfMonth();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'ordersToday' => Order::query()->whereDate('created_at', today())->count(),
                'ordersMonth' => Order::query()->where('created_at', '>=', $monthStart)->count(),
                'revenueMonth' => (int) Order::query()
                    ->where('created_at', '>=', $monthStart)
                    ->where('status', '!=', OrderStatus::Cancelled)
                    ->sum('total'),
                'pendingOrders' => Order::query()->where('status', OrderStatus::Pending)->count(),
                'visitorsToday' => Visit::query()->whereDate('visited_on', today())->distinct()->count('session_hash'),
                'activePromos' => PricePeriod::query()->current()->count(),
            ],
            'visitSeries' => $this->visitSeries(),
            'topProducts' => $this->topProducts(),
            'recentOrders' => Order::query()
                ->latest()
                ->take(8)
                ->get()
                ->map(fn (Order $order) => [
                    'reference' => $order->reference,
                    'customerName' => $order->customer_name,
                    'city' => $order->city,
                    'status' => $order->status->value,
                    'total' => $order->total,
                    'createdAt' => $order->created_at?->toIso8601String(),
                ]),
        ]);
    }

    /**
     * Daily visitors and page views for the last 14 days,
     * with missing days filled in as zero.
     *
     * @return array<int, array{date: string, visitors: int, pageViews: int}>
     */
    protected function visitSeries(): array
    {
        $rows = Visit::query()
            ->where('visited_on', '>=', today()->subDays(13))
            ->groupBy('visited_on')
            ->select('visited_on')
            ->selectRaw('COUNT(DISTINCT session_hash) as visitors')
            ->selectRaw('COUNT(*) as page_views')
            ->get()
            ->keyBy(fn (Visit $visit) => $visit->visited_on->toDateString());

        $series = [];

        for ($i = 13; $i >= 0; $i--) {
            $date = today()->subDays($i)->toDateString();
            $row = $rows->get($date);

            $series[] = [
                'date' => $date,
                'visitors' => (int) ($row->visitors ?? 0),
                'pageViews' => (int) ($row->page_views ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Best selling products (all time, cancelled orders excluded).
     *
     * @return array<int, array{name: string, quantity: int, revenue: int}>
     */
    protected function topProducts(): array
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->groupBy('order_items.product_name')
            ->select('order_items.product_name')
            ->selectRaw('SUM(order_items.quantity) as quantity')
            ->selectRaw('SUM(order_items.quantity * order_items.unit_price) as revenue')
            ->orderByDesc(DB::raw('SUM(order_items.quantity)'))
            ->take(5)
            ->get()
            ->map(fn ($row) => [
                'name' => (string) $row->product_name,
                'quantity' => (int) $row->quantity,
                'revenue' => (int) $row->revenue,
            ])
            ->all();
    }
}
