<?php

namespace App\Mail;

use App\Models\Billing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;

class InvoiceMail extends Mailable 
{
    public $billing;
    public $pdfPath;
    
    public function __construct(Billing $billing, $pdfPath)
    {
        $this->billing = $billing;
        $this->pdfPath = $pdfPath;
    }
    
    public function build()
    {
        return $this->subject('Invoice Billing for ' . $this->billing->owner->owner_name)
            ->view('emails.invoice')
            ->attach($this->pdfPath, [
                'as' => "invoice_{$this->billing->id}.pdf",
                'mime' => 'application/pdf',
            ]);
    }
}