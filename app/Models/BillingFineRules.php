<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingFineRules extends Model
{
    use HasFactory;
    protected $table = 'billing_fine_rules';
    protected $fillable = [
        'billing_type',
        'fine_rate_per_day',
        'apartment_id',
        'max_fine',
        'percentage',
        'due_date',
        'created_by',
    ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class, 'apartment_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
