<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailFines extends Model
{
    use HasFactory;
    protected $table = 'detail_fines';
    protected $fillable = [
        'billing_id',
        'days_late',
        'fine_rate_per_day',
        'calculated_fine',
        'max_fine',
        'applied_fine',
        'created_by',
    ];

    public function billing(){
        return $this->belongsTo(Billing::class, 'billing_id');
    }

    public function createdBy(){
        return $this->belongsTo(User::class, 'created_by');
    }
}
