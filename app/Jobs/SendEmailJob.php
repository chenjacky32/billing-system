<?php

namespace App\Jobs;

use App\Mail\InvoiceMail;
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
    public $backoff = 60;

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
        
        try{
            // Send email with invoice
            Mail::to($email)->send(new InvoiceMail($billing, $pdfPath));
        
            // clean up pdf file in temp folder
            if(file_exists($this->details['pdfPath'])){
                unlink($this->details['pdfPath']);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send invoice email: ' . $e->getMessage());
            throw $e;
        }
    }

    public function failed(\Exception  $exception)
    {
          // Cleanup if the job fails
          if (file_exists($this->details['pdfPath'])) {
            unlink($this->details['pdfPath']);
        }
    }
}
