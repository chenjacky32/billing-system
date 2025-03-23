<?php

namespace App\Listeners;

use App\Events\BillingPaid;
use App\Jobs\SendPaidSuccessJob;
use Illuminate\Support\Facades\Log;

class SendPaymentSuccessEmail
{
    public function handle(BillingPaid $event)
    {
        $billing = $event->billing;
        // $email = $billing->owner->email;
        $email = $billing->residence->user->email;
        Log::info('sendPaymentSuccessEmail', ['email' => $email, 'billing' => $billing]);
    
        SendPaidSuccessJob::dispatch([
        'billing' => $billing,
        'email' => $email
    ])->onQueue(queue: 'success_payment_emails');
    }
}