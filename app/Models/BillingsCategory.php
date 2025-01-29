<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingsCategory extends Model
{
    use HasFactory;

    protected $table = 'billings_category';
    protected $fillable = ['billing_type','apartment_id','category_name','unit_price'];

}
