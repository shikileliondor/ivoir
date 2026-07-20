<?php

namespace App\Notifications\Shop;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewContactMessage extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ContactMessage $contactMessage) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $contact = $this->contactMessage;

        $message = (new MailMessage)
            ->subject("Nouveau message de {$contact->name} — IvoirCuisson")
            ->greeting('Nouveau message de contact')
            ->line("**{$contact->name}** vous a écrit depuis le site.")
            ->line("Téléphone : {$contact->phone}")
            ->line('Email : '.($contact->email ?? 'non renseigné'))
            ->line('---')
            ->line($contact->message)
            ->action('Répondre depuis l\'administration', route('admin.communication.index'));

        // Let the manager hit reply and land on the customer.
        if ($contact->email !== null) {
            $message->replyTo($contact->email, $contact->name);
        }

        return $message;
    }
}
