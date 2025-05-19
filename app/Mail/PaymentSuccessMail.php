<?php

namespace App\Mail;

use App\Models\Billing;
use Illuminate\Mail\Mailable;

class PaymentSuccessMail extends Mailable
{
    public $billing;
    public $pdfPath;
    
    public function __construct(Billing $billing)
    {
        $this->billing = $billing;
    }
    
    public function build()
    {
    return $this->subject('Pembayaran Diterima - Invoice #' . $this->billing->id)
                ->view('emails.payment_success');
    }
}