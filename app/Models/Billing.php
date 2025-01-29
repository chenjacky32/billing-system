<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    use HasFactory;
    protected $fillable = [
        'billing_type','billing_category_id', 'billing_fee','start_meter', 
        'end_meter', 'unit_price', 'minimum_charge', 'billing_date', 'owner_id', 
        'meter_reading', 'is_paid', 'paid_date', 'status', 'created_by', 'fine', 
        'due_date', 'apartment_id'
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function owner()
    {
        return $this->belongsTo(ApartmentOwner::class, 'owner_id');
    }
}
