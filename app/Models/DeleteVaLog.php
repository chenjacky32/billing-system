<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeleteVaLog extends Model
{
    use HasFactory;
    protected $table = 'deleteVaLog';
    protected $connection = 'okgo';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'billingTransactionId',
        'billingId',
        'virtualAccount',
        'responseMessage',
        'deletedBy',
        'deletedAt',
    ];

}
