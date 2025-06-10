<?php

namespace App\Listeners;

use App\Events\GenerateInvoiceRequested;
use App\Jobs\GenerateInvoiceJob;


class GenerateInvoicePDF
{
    public function __construct()
    {
        // 
    }

    public function handle(GenerateInvoiceRequested $event)
    {
        $billing = $event->billing;
        
        GenerateInvoiceJob::dispatch($billing)
            ->onQueue('billing_generate_pdf');
    }
}
