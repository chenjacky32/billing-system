<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingTransaction extends Model
{
    use HasFactory;
    protected $table = 'billingTransaction';
    protected $connection = 'okgo';
    protected $primaryKey = 'id';
    public $timestamps = false;

}
