<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    use HasFactory;
    protected $fillable = [
        'billing_type','billing_category_id', 'billing_fee','start_meter', 
        'end_meter', 'unit_price', 'minimum_charge', 'billing_date', 'period', 'owner_id', 
        'meter_reading', 'is_paid', 'paid_date', 'status', 'created_by', 'fine', 
        'due_date', 'apartment_id','residence_id', 'tower_id'
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function owner()
    {
        return $this->belongsTo(ApartmentOwner::class, 'owner_id');
    }

    public function billingCategory()
    {
        return $this->belongsTo(BillingsCategory::class, 'billing_category_id');
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class, 'apartment_id');
    }

    public function tower(){
        return $this->belongsTo(ApartmentTower::class, 'tower_id');
    }

    public function residence()
{
    return $this->belongsTo(UserApartmentOkgo::class, 'residence_id', 'id')
        ->withDefault(); 
}

}
