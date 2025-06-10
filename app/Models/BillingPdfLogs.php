<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingPdfLogs extends Model
{
    use HasFactory;

    protected $table = 'billing_pdf_logs';

    protected $fillable = ['billing_id', 'pdf_path','status',
                            'file_type','error_message',
                            'generated_at'];
}
