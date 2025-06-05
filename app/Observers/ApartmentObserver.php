<?php

namespace App\Observers;

use App\Models\Apartment;
use App\Helpers\CacheManager;

class ApartmentObserver
{
    public function saved(Apartment $model)
    {
        CacheManager::forgetByTag('apartment');
        CacheManager::forgetByTag("apartment_{$model->id}");
    }

    public function deleted(Apartment $model)
    {
        $this->saved($model);
    }
}
