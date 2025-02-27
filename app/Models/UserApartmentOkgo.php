<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserApartmentOkgo extends Model
{
    use HasFactory;

    protected $table = 'userApartment';
    protected $connection = 'okgo';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'active',
    ];

    public function user()
    {
        return $this->belongsTo(UserOkgo::class, 'userId', 'id');
    }
}
