<?php

namespace App\Jobs;

use App\Mail\PaymentSuccessMail;
use App\Models\EmailsLogs;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPaidSuccessJob implements ShouldQueue
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
        $billing =  $this->details['billing'];
        $email = $this->details['email'];
        
        try {
            Mail::to($email)->send(new PaymentSuccessMail($billing));
            EmailsLogs::create([
                'recipient_email' => $billing->residence->user->email,
                'subject' => "Pembayaran Diterima - Invoice #" . $billing->id,
                'content' => '',
                'status' => 'sent',
                'email_type' => 'payment_success',
                'billing_id' => $billing->id,
                'error_message' => '',
                'sent_at' => now()
                ]);


                
        } catch (\Exception $exception) {
            Log::error('Failed to send payment success email: ' . $exception->getMessage());
            EmailsLogs::create([
                'recipient_email' => $billing->residence->user->email ?? 'No Email',
                'subject' => "Pembayaran Diterima - Tagihan #" . $billing->id,
                'content' => '',
                'status' => 'failed',
                'email_type' => 'payment_success',
                'billing_id' => $billing->id,
                'error_message' => $exception->getMessage(),
                'sent_at' => now()
            ]);
        }
    }
}
