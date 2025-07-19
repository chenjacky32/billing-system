<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitPowerCapacities extends Model
{
    use HasFactory;
    protected $table = 'unit_power_capacities';
    protected $fillable = [
        'capacity_value',
    ];
}
