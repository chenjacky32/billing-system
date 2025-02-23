<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApartmentOwner extends Model
{
    use HasFactory;
    protected $fillable = [
        'owner_name', 'phone', 'email', 'identity_no', 'apartment_id', 'tower_id','room_no', 'created_by'
    ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tower(){
        return $this->belongsTo(ApartmentTower::class, 'tower_id');
    }
}
