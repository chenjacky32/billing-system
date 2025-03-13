<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserOkgo extends Model
{
    use HasFactory;
    protected $table = 'user';
    protected $connection = 'okgo';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $hidden = [
        'refferalCode', 'supervisor', 'merchantId', 'balance', 'xtBalance', 
        'limitBalance', 'point', 'password', 'regid', 'posRegid', 'deleted', 
        'login','loginTime','token','isSpender','createdBy','createdAt',
        'updatedAt','browserId'
    ];

    public function userApartments()
    {
        return $this->hasMany(UserApartmentOkgo::class, 'userId', 'id');
    }
}
