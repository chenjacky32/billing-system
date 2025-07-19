<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserApartmentOkgo extends Model
{
    use HasFactory;

    protected $table = 'userApartment';
    protected $connection = 'okgo';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'apartmentTowerId',
        'apartmentId',
        'roomNo',
        'active',
        'apartmentType',
        'powerCapacityId',
    ];

    // protected $appends = ['apartmentTypeData'];

    public function getConnectionName()
    {
        return app()->environment('testing') ? 'okgo_testing' : 'okgo';
    }

    public function user()
    {
        return $this->belongsTo(UserOkgo::class, 'userId', 'id');
    }

    public function apartmentType()
    {
        return $this->belongsTo(ApartmentType::class, 'apartmentType', 'id');
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class,'apartmentId','id');
    }
}
