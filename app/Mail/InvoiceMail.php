<?php

namespace App\Mail;

use App\Models\Billing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;

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
        Log::info('Mail/InvoiceMail', ['billing' => $this->billing, 'pdfPath' => $this->pdfPath, 'email' => $this->billing->residence->user->fullname]);
        return $this->subject('Invoice Billing for ' . $this->billing->residence->user->fullname)
            ->view('emails.invoice')
            ->attach($this->pdfPath, [
                'as' => "invoice_{$this->billing->id}.pdf",
                'mime' => 'application/pdf',
            ]);
    }
}