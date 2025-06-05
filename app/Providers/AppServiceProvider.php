<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

use App\Models\Apartment;
use App\Models\ApartmentType;
use App\Models\ApartmentTower;
use App\Models\BillingFineRules;
use App\Models\BillingsCategory;

use App\Observers\ApartmentObserver;
use App\Observers\ApartmentTypeObserver;
use App\Observers\ApartmentTowerObserver;
use App\Observers\BillingFineRulesObserver;
use App\Observers\BillingCategoryObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //Logging database queries
            DB::listen(function (QueryExecuted $query) {
            Log::info(
                $query->sql,
                [
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms',
                    'connection' => $query->connectionName
                ]
            );
        });

        // Observers for Clear Cache Master Data if have any changes
        Apartment::observe(ApartmentObserver::class);
        ApartmentType::observe(ApartmentTypeObserver::class);
        ApartmentTower::observe(ApartmentTowerObserver::class);
        BillingFineRules::observe(BillingFineRulesObserver::class);
        BillingsCategory::observe(BillingCategoryObserver::class);
    }
}
