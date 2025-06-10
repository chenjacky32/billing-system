<?php

namespace App\Providers;

use App\Events\GenerateInvoiceRequested;
use App\Events\BillingCreated;
use App\Events\BillingPaid;
use App\Listeners\GenerateInvoicePDF;
use App\Listeners\SendInvoiceEmail;
use App\Listeners\SendPaymentSuccessEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        GenerateInvoiceRequested::class => [
            GenerateInvoicePDF::class
        ],
        BillingCreated::class => [
            SendInvoiceEmail::class,
        ],
        BillingPaid::class => [
            SendPaymentSuccessEmail::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     *
     * @return bool
     */
    public function shouldDiscoverEvents()
    {
        return false;
    }
}
