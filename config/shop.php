<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Notification recipient
    |--------------------------------------------------------------------------
    |
    | Where the shop sends its internal alerts: new orders and new contact
    | messages. Set SHOP_NOTIFICATION_EMAIL in .env to route them to the
    | person actually handling the shop.
    |
    */

    'notification_email' => env('SHOP_NOTIFICATION_EMAIL', 'ivoircuisson@dym.ci'),

    /*
    |--------------------------------------------------------------------------
    | Order confirmation link lifetime
    |--------------------------------------------------------------------------
    |
    | The confirmation page is reachable through a signed link (also sent by
    | email), so an order's details are only readable by the person holding
    | the link. This is how many days that link stays valid.
    |
    */

    'confirmation_link_days' => 30,

];
