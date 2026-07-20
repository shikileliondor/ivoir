<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CommunicationController extends Controller
{
    /**
     * Show contact messages and newsletter subscribers side by side.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('q')->toString();
        $unreadOnly = $request->boolean('non_lus');

        $messages = ContactMessage::query()
            ->when($unreadOnly, fn ($query) => $query->whereNull('read_at'))
            ->when($search !== '', fn ($query) => $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('message', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15, pageName: 'messages')
            ->withQueryString()
            ->through(fn (ContactMessage $message) => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'phone' => $message->phone,
                'message' => $message->message,
                'isRead' => $message->read_at !== null,
                'createdAt' => $message->created_at?->toIso8601String(),
            ]);

        $subscribers = NewsletterSubscriber::query()
            ->when($search !== '', fn ($query) => $query->where('email', 'like', "%{$search}%"))
            ->latest()
            ->paginate(20, pageName: 'abonnes')
            ->withQueryString()
            ->through(fn (NewsletterSubscriber $subscriber) => [
                'id' => $subscriber->id,
                'email' => $subscriber->email,
                'createdAt' => $subscriber->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/communication', [
            'messages' => $messages,
            'subscribers' => $subscribers,
            'stats' => [
                'unreadMessages' => ContactMessage::whereNull('read_at')->count(),
                'totalMessages' => ContactMessage::count(),
                'totalSubscribers' => NewsletterSubscriber::count(),
            ],
            'filters' => [
                'q' => $search !== '' ? $search : null,
                'non_lus' => $unreadOnly,
            ],
        ]);
    }

    /**
     * Flip a message between read and unread.
     */
    public function toggleRead(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->update([
            'read_at' => $contactMessage->read_at === null ? now() : null,
        ]);

        return back()->with('success', $contactMessage->read_at !== null
            ? 'Message marqué comme lu.'
            : 'Message marqué comme non lu.');
    }

    /**
     * Delete a contact message.
     */
    public function destroyMessage(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        return back()->with('success', 'Message supprimé.');
    }

    /**
     * Remove an email from the newsletter list.
     */
    public function destroySubscriber(NewsletterSubscriber $newsletterSubscriber): RedirectResponse
    {
        $newsletterSubscriber->delete();

        return back()->with('success', 'Abonné supprimé.');
    }

    /**
     * Download the newsletter list as CSV for use in a mailing tool.
     */
    public function exportSubscribers(): StreamedResponse
    {
        $filename = 'abonnes-newsletter-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            // BOM so Excel opens the accented columns correctly.
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Email', 'Inscrit le']);

            NewsletterSubscriber::query()
                ->latest()
                ->chunk(500, function ($subscribers) use ($handle) {
                    foreach ($subscribers as $subscriber) {
                        fputcsv($handle, [
                            $subscriber->email,
                            $subscriber->created_at?->format('d/m/Y H:i'),
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
