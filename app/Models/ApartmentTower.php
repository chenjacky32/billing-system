<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApartmentTower extends Model
{
    use HasFactory;
    protected $table = 'apartment_tower';
    protected $fillable = ['tower_name', 'apartment_id', 'total_room', 'created_by'];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class, 'apartment_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}


