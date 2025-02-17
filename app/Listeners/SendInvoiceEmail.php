<?php

namespace App\Listeners;

use App\Events\BillingCreated;
use App\Jobs\SendEmailJob;

class SendInvoiceEmail  
{
    public function handle(BillingCreated $event): void
    {
        $billing = $event->billing;
        $pdfPath = $event->pdfPath;
        $email = $billing->owner->email;

        SendEmailJob::dispatch([
            'email' => $email,
            'billing' => $billing,
            'pdfPath' => $pdfPath
    ])->onQueue(queue: 'billing_emails');
    }
}
