<?php

namespace App\Observers;

use App\Models\BillingFineRules;
use App\Helpers\CacheManager;

class BillingFineRulesObserver
{
    public function saved(BillingFineRules $model)
    {
        CacheManager::forgetByTag('billing_fine_rules');
        CacheManager::forgetByTag("apartment_{$model->apartment_id}");
    }

    public function deleted(BillingFineRules $model)
    {
        $this->saved($model);
    }
}