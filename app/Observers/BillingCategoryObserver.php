<?php

namespace App\Observers;

use App\Models\BillingsCategory;
use App\Helpers\CacheManager;

class BillingCategoryObserver 
{
    public function saved(BillingsCategory $model)
    {
        CacheManager::forgetByTag('billing_category');
        CacheManager::forgetByTag("apartment_{$model->apartment_id}");
    }

    public function deleted(BillingsCategory $model)
    {
        $this->saved($model);
    }
}