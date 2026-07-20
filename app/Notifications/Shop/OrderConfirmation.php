<?php

namespace App\Notifications\Shop;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Order $order) {}

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
        $order = $this->order->loadMissing('items');

        $message = (new MailMessage)
            ->subject("Votre commande {$order->reference} — IvoirCuisson")
            ->greeting("Bonjour {$order->customer_name},")
            ->line('Merci pour votre commande ! Nous l\'avons bien reçue et nous vous contacterons très vite au '.$order->customer_phone.' pour organiser la livraison.')
            ->line("**Référence : {$order->reference}**");

        foreach ($order->items as $item) {
            $message->line("- {$item->quantity} × {$item->product_name} — ".$this->fcfa($item->unit_price * $item->quantity));
        }

        return $message
            ->line('**Total : '.$this->fcfa($order->total).'** (paiement à la livraison)')
            ->line("Livraison à : {$order->address}, {$order->city}")
            ->action('Voir ma commande', $order->confirmationUrl())
            ->line('À très bientôt,')
            ->salutation('L\'équipe IvoirCuisson');
    }

    /**
     * Format an amount the way the shop displays it.
     */
    protected function fcfa(int $amount): string
    {
        return number_format($amount, 0, ',', ' ').' FCFA';
    }
}
