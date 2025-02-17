<?php
namespace App\Events;
use App\Models\Billing;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BillingCreated
{
    use Dispatchable, SerializesModels;
    
    public $billing;
    public $pdfPath;
    
    public function __construct(Billing $billing, $pdfPath)
    {
        $this->billing = $billing;
        $this->pdfPath = $pdfPath;
    }
}