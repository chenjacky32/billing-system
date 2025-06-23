<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApartmentCorpCode extends Model
{
    use HasFactory;
    protected $table = 'apartment_corporate_codes';
    protected $fillable = [
        'apartmentId',
        'partnerServiceId',
        'description',
        'isActive',
        'created_at',
        'updated_at'
    ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class,'apartmentId', 'id');
    }
}
