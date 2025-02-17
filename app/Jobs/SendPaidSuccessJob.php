<?php

namespace App\Jobs;

use App\Mail\PaymentSuccessMail;
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
        $billing =  $this->details['billing'];
        $email = $this->details['email'];
        
        try{
            Mail::to($email)->send(new PaymentSuccessMail($billing));

        }catch(\Exception $exception){
            Log::error('Failed to send payment success email: ' . $exception->getMessage());
        }
    }
}
