<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CommunicationController as AdminCommunicationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PricePeriodController as AdminPricePeriodController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SiteImageController as AdminSiteImageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Shop\PageController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('produits', [ProductController::class, 'index'])->name('products.index');
Route::get('produits/{product}', [ProductController::class, 'show'])->name('products.show');

Route::get('a-propos', [PageController::class, 'about'])->name('about');
Route::get('environnement', [PageController::class, 'environment'])->name('environment');
Route::get('contact', [PageController::class, 'contact'])->name('contact');
Route::post('contact', [PageController::class, 'sendContact'])
    ->middleware('throttle:5,1')
    ->name('contact.send');
Route::post('newsletter', [PageController::class, 'subscribeNewsletter'])
    ->middleware('throttle:5,1')
    ->name('newsletter.subscribe');

Route::get('politique-de-confidentialite', [PageController::class, 'privacy'])->name('privacy');
Route::get('conditions-generales-de-vente', [PageController::class, 'terms'])->name('terms');
Route::get('mentions-legales', [PageController::class, 'legalNotice'])->name('legal');

Route::get('commande', [OrderController::class, 'checkout'])->name('orders.checkout');
Route::post('commande', [OrderController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('orders.store');
Route::get('commande/{order}/confirmation', [OrderController::class, 'confirmation'])
    ->middleware('signed')
    ->name('orders.confirmation');

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', EnsureUserIsAdmin::class])
    ->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');

        Route::get('produits', [AdminProductController::class, 'index'])->name('products.index');
        Route::get('produits/nouveau', [AdminProductController::class, 'create'])->name('products.create');
        Route::post('produits', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('produits/{product}/modifier', [AdminProductController::class, 'edit'])->name('products.edit');
        Route::put('produits/{product}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('produits/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

        Route::get('categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('commandes', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('commandes/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::put('commandes/{order}', [AdminOrderController::class, 'update'])->name('orders.update');

        Route::get('images', [AdminSiteImageController::class, 'index'])->name('site-images.index');
        Route::post('images/{key}', [AdminSiteImageController::class, 'update'])->name('site-images.update');
        Route::delete('images/{key}', [AdminSiteImageController::class, 'destroy'])->name('site-images.destroy');

        Route::get('communication', [AdminCommunicationController::class, 'index'])->name('communication.index');
        Route::put('communication/messages/{contactMessage}', [AdminCommunicationController::class, 'toggleRead'])->name('communication.messages.toggle-read');
        Route::delete('communication/messages/{contactMessage}', [AdminCommunicationController::class, 'destroyMessage'])->name('communication.messages.destroy');
        Route::get('communication/abonnes/export', [AdminCommunicationController::class, 'exportSubscribers'])->name('communication.subscribers.export');
        Route::delete('communication/abonnes/{newsletterSubscriber}', [AdminCommunicationController::class, 'destroySubscriber'])->name('communication.subscribers.destroy');

        Route::get('tarification', [AdminPricePeriodController::class, 'index'])->name('pricing.index');
        Route::post('tarification', [AdminPricePeriodController::class, 'store'])->name('pricing.store');
        Route::put('tarification/{pricePeriod}', [AdminPricePeriodController::class, 'update'])->name('pricing.update');
        Route::delete('tarification/{pricePeriod}', [AdminPricePeriodController::class, 'destroy'])->name('pricing.destroy');
    });

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
