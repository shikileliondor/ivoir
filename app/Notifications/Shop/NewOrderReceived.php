<?php

namespace App\Notifications\Shop;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification implements ShouldQueue
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
            ->subject("Nouvelle commande {$order->reference} — ".number_format($order->total, 0, ',', ' ').' FCFA')
            ->greeting('Nouvelle commande !')
            ->line("**{$order->customer_name}** vient de commander sur le site.")
            ->line("Téléphone : {$order->customer_phone}")
            ->line('Email : '.($order->customer_email ?? 'non renseigné'))
            ->line("Livraison : {$order->address}, {$order->city}")
            ->line('---');

        foreach ($order->items as $item) {
            $message->line("- {$item->quantity} × {$item->product_name}");
        }

        return $message
            ->line('**Total : '.number_format($order->total, 0, ',', ' ').' FCFA**')
            ->action('Ouvrir dans l\'administration', route('admin.orders.show', $order));
    }
}
