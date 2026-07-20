<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $featured = Product::query()
            ->active()
            ->where('is_featured', true)
            ->with(['category', 'activePricePeriod'])
            ->take(4)
            ->get();

        return Inertia::render('shop/home', [
            'featuredProducts' => ProductController::toProductArray($featured),
        ]);
    }
}
