<?php

namespace App\Observers;

use App\Models\ApartmentTower;
use App\Helpers\CacheManager;

class ApartmentTowerObserver
{
    public function saved(ApartmentTower $model)
    {
        CacheManager::forgetByTag('apartment_tower');
        CacheManager::forgetByTag("apartment_{$model->apartment_id}");
    }

    public function deleted(ApartmentTower $model)
    {
        $this->saved($model);
    }
}