<?php

namespace App\Listeners;

use App\Events\BillingCreated;
use App\Jobs\SendEmailJob;
use App\Helpers\LookupCache;
use Illuminate\Support\Facades\Log;

class SendInvoiceEmail  
{
    public function handle(BillingCreated $event): void
    {
        $billing = $event->billing;
        $pdfPath = $event->pdfPath;
        
        $email = $billing->residence->user->email;
        Log::info('sendInvoiceEmail', ['email' => $email, 'billing' => $billing, 'pdfPath' => $pdfPath]);

        SendEmailJob::dispatch([
            'email' => $email,
            'billing' => $billing,
            'pdfPath' => $pdfPath
        ])->onQueue(queue: 'billing_emails');
    }
}
