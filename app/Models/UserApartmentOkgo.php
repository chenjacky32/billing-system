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
        'apartmentType'
    ];

    protected $appends = ['apartmentTypeData'];

    public function user()
    {
        return $this->belongsTo(UserOkgo::class, 'userId', 'id');
    }

    public function getApartmentTypeDataAttribute()
    {
        return DB::table('apartment_types')
            ->where('id', $this->apartmentType)
            ->first();
    }
}
