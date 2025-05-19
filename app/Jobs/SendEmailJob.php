<?php

namespace App\Jobs;

use App\Mail\InvoiceMail;
use App\Models\EmailsLogs;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $details;
    public $tries = 3;
    // public $backoff = 60;

    public function backoff()
    {
        return [60, 300, 600]; // Retry after 1m, 5m, then 10m
    }

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($details)
    {
        //
        $this->details = $details;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $billing = $this->details['billing'];
        $pdfPath = $this->details['pdfPath'];
        $email = $this->details['email'];
        
        try {
            // Send email with invoice
            Mail::to($email)->send(new InvoiceMail($billing, $pdfPath));
        
            // clean up pdf file in temp folder
            if(file_exists($this->details['pdfPath'])){
                unlink($this->details['pdfPath']);
            }

            EmailsLogs::create([
                'recipient_email' => $email,
                'subject' => "Tagihan Apartemen " . ($billing->residence->user->fullname ?? '') . "- Invoice ID:" . $billing->id,
                'content' => '',
                'status' => 'sent',
                'email_type' => 'invoice_attachment',
                'billing_id' => $billing->id,
                'error_message' => null,
                'sent_at' => now()
            ]);
        } catch (\Exception $e) {
            EmailsLogs::create([
                'recipient_email' => $billing->residence->user->email ?? 'No Email',
                'subject' => "Tagihan Apartemen " . ($billing->residence->user->fullname ?? ''),
                'content' => '',
                'status' => 'failed',
                'email_type' => 'invoice_attachment',
                'billing_id' => $billing->id,
                'error_message' => $e->getMessage(),
                'sent_at' => now()
            ]);
            
            throw $e;
        }
    }

    public function failed(\Exception  $exception)
    {
        $billing = $this->details['billing'] ?? null;

        EmailsLogs::create([
            'recipient_email' => $billing?->residence?->user?->email ?? 'No Email',
            'subject' => "Tagihan Apartemen " . ($billing->residence->user->fullname ?? ''),
            'content' => '',
            'status' => 'failed',
            'email_type' => 'invoice_attachment',
            'billing_id' => $billing?->id,
            'error_message' => $exception->getMessage(),
            'sent_at' => now()
        ]);


        // Cleanup if the job fails
        if (file_exists($this->details['pdfPath'])) {
            unlink($this->details['pdfPath']);
        }
    }
}
