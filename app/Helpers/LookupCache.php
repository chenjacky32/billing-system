<?php

namespace App\Helpers;

use App\Models\Apartment;
use App\Models\BillingFineRules;
use App\Models\BillingsCategory;
use App\Models\UnitPowerCapacities;
use Illuminate\Support\Facades\Cache;
use App\Models\ApartmentType;
use App\Models\ApartmentTower;

class LookupCache
{   
    public static function unitPowerCapacitiesMap()
    {
        return CacheManager::remember('unit_power_capacities', 3600, function () {
            return UnitPowerCapacities::pluck('capacity_value', 'id')->toArray();
        }, ['unit_power_capacities']);
    }

    public static function apartmentTypeMap()
    {
        return CacheManager::remember('apartment_type_map', 3600, function () {
            return ApartmentType::pluck('name', 'id')->toArray();
        }, ['apartment_type']);
    }

    public static function apartmentTypeList()
    {
        return CacheManager::remember('apartment_types_data', 3600, function () {
            return ApartmentType::select('id', 'name')
                ->get()
                ->map(fn ($type) => ['label' => $type->name, 'value' => $type->id])
                ->values()
                ->toArray();
        }, ['apartment_type']);
    }

    public static function towerList(?int $apartmentId, String $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';
        $cacheKey = "tower_data_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}";

        return CacheManager::remember($cacheKey, 3600, function () use ($apartmentId, $isSuperAdmin) {
            return ApartmentTower::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                    $q->where('apartment_id', $apartmentId)
                )
                ->get()
                ->map(fn ($tower) => ['label' => $tower->tower_name, 'value' => $tower->id])
                ->values()
                ->toArray();
        }, ['apartment_tower', "apartment_{$apartmentId}"]);
    }

    public static function apartmentTowerMap(?int $apartmentId, String $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';
        $cacheKey = "apartment_tower_map_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}";

        return CacheManager::remember($cacheKey, 3600, function () use ($apartmentId, $isSuperAdmin) {
            return ApartmentTower::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                        $q->where('apartment_id', $apartmentId)
                    )
                    ->select('id', 'tower_name') 
                    ->get()
                    ->keyBy('id'); 
        }, ['apartment_tower', "apartment_{$apartmentId}"]);
    }

    public static function apartmentMap(?int $apartmentId, string $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';
        $cacheKey = "apartment_map_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}";

        return CacheManager::remember($cacheKey, 3600, function () use ($apartmentId, $isSuperAdmin) {
            return Apartment::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                    $q->where('id', $apartmentId)
                )
                ->select('id', 'name')
                ->get()
                ->keyBy('id');
        }, ['apartment', "apartment_{$apartmentId}"]);
    }

    public static function billingCategory(?int $apartmentId, string $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';
        $cacheKey = "billing_category_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}";

        return CacheManager::remember($cacheKey, 3600, function () use ($apartmentId, $isSuperAdmin) {
            return BillingsCategory::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                        $q->where('apartment_id', $apartmentId)
                    )->get(['id','billing_type','category_name','apartment_id','tower_id','power_capacity_value','unit_price','minimum_charge']);
        }, ['billing_category', "apartment_{$apartmentId}"]);
    }

    public static function billingFineRules(?int $apartmentId, string $role = 'ADMIN')
    {   
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';
        $cacheKey = "billing_fine_rules_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}";

        return CacheManager::remember($cacheKey, 3600, function () use ($apartmentId, $isSuperAdmin) {
            return BillingFineRules::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                        $q->where('apartment_id', $apartmentId)
                    )->get();
        }, ['billing_fine_rules', "apartment_{$apartmentId}"]);
    }
}
