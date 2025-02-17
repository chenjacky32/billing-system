<?php

namespace App\Listeners;

use App\Events\BillingPaid;
use App\Jobs\SendPaidSuccessJob;


class SendPaymentSuccessEmail
{
    public function handle(BillingPaid $event)
    {
        $billing = $event->billing;
        $email = $billing->owner->email;
    
        SendPaidSuccessJob::dispatch([
        'billing' => $billing,
        'email' => $email
    ])->onQueue(queue: 'success_payment_emails');
    }
}