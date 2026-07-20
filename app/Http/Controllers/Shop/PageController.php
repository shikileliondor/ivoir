<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\SendContactRequest;
use App\Http\Requests\Shop\SubscribeNewsletterRequest;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use App\Notifications\Shop\NewContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('shop/about');
    }

    public function environment(): Response
    {
        return Inertia::render('shop/environment');
    }

    public function contact(): Response
    {
        return Inertia::render('shop/contact');
    }

    public function privacy(): Response
    {
        return Inertia::render('shop/legal/privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('shop/legal/terms');
    }

    public function legalNotice(): Response
    {
        return Inertia::render('shop/legal/legal-notice');
    }

    /**
     * Store a contact message and alert the shop.
     */
    public function sendContact(SendContactRequest $request): RedirectResponse
    {
        $message = ContactMessage::create($request->validated());

        Notification::route('mail', config('shop.notification_email'))
            ->notify(new NewContactMessage($message));

        return back()->with('success', 'Votre message a bien été envoyé. Nous vous répondrons rapidement.');
    }

    /**
     * Add an email to the newsletter list. Re-subscribing with a known
     * address is a no-op so the visitor never sees a validation error.
     */
    public function subscribeNewsletter(SubscribeNewsletterRequest $request): RedirectResponse
    {
        NewsletterSubscriber::firstOrCreate($request->validated());

        return back()->with('success', 'Merci ! Vous êtes inscrit à nos actualités.');
    }
}
