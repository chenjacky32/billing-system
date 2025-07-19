<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingsCategory extends Model
{
    use HasFactory;
    protected $table = 'billings_category';
    protected $fillable = ['billing_type','apartment_id','category_name',
                            'unit_price','created_by','minimum_charge', 
                            'tower_id','power_capacity_value'
                        ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class, foreignKey:'apartment_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, foreignKey:'created_by');
    }

    public function tower()
    {
        return $this->belongsTo(ApartmentTower::class, foreignKey:'tower_id');
    }
}
