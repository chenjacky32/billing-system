<?php

namespace App\Helpers;

use App\Models\Apartment;
use Illuminate\Support\Facades\Cache;
use App\Models\ApartmentType;
use App\Models\ApartmentTower;

class LookupCache
{
    public static function apartmentTypeMap()
    {
        return Cache::remember('apartment_type_map', 3600, function () {
            return ApartmentType::pluck('name', 'id')->toArray();
        });
    }

    public static function apartmentTypeList()
    {
        return Cache::remember('apartment_types_data', 3600, function () {
            return ApartmentType::select('id', 'name')
                ->get()
                ->map(fn ($type) => ['label' => $type->name, 'value' => $type->id])
                ->values()
                ->toArray();
        });
    }

    public static function towerList(?int $apartmentId, String $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';

        return Cache::remember("tower_data_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}", 3600, function () use ($apartmentId, $isSuperAdmin) {
            return ApartmentTower::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                    $q->where('apartment_id', $apartmentId)
                )
                ->get()
                ->map(fn ($tower) => ['label' => $tower->tower_name, 'value' => $tower->id])
                ->values()
                ->toArray();
        });
    }

    public static function apartmentTowerMap(?int $apartmentId, String $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';

        return Cache::remember( "apartment_tower_map_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}", 3600, function () use ($apartmentId, $isSuperAdmin) {
            return ApartmentTower::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                        $q->where('apartment_id', $apartmentId)
                    )
                    ->select('id', 'tower_name') 
                    ->get()
                    ->keyBy('id'); 
            });
    }

    public static function apartmentMap(?int $apartmentId, string $role = 'ADMIN')
    {
        $isSuperAdmin = strtoupper($role) === 'SUPER ADMIN';

        return Cache::remember("apartment_map_" . ($apartmentId ?? 'all') . "_{$isSuperAdmin}", 3600, function () use ($apartmentId, $isSuperAdmin) {
            return Apartment::when(!$isSuperAdmin && $apartmentId, fn ($q) =>
                    $q->where('id', $apartmentId)
                )
                ->select('id', 'name')
                ->get()
                ->keyBy('id');
        });
    }
}
