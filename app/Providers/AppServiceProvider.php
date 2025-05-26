<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

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
    }
}
