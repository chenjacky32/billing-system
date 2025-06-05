<?php

namespace App\Observers;

use App\Models\ApartmentType;
use App\Helpers\CacheManager;

class ApartmentTypeObserver
{
    public function saved(ApartmentType $model)
    {
        CacheManager::forgetByTag('apartment_type');
    }

    public function deleted(ApartmentType $model)
    {
        $this->saved($model);
    }
}
