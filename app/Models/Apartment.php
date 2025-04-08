<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Apartment extends Model
{
    protected $fillable = ['name', 'address', 'created_by', 'total_room', 'logo_company'];

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function owners()
    {
        return $this->hasMany(ApartmentOwner::class, 'apartment_id');
    }

    public function towers()
    {
        return $this->hasMany(ApartmentTower::class, 'apartment_id');
    }

    public function userApartments()
    {
        return $this->hasMany(UserApartmentOkgo::class, 'apartmentId', 'id');
    }

    use HasFactory;
}
