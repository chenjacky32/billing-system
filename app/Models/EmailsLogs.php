<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailsLogs extends Model
{
    use HasFactory;

    protected $table = 'emails_logs';

    protected $fillable = ['recipient_email','subject','content_preview',
                            'status','email_type','billing_id','error_message',
                            'sent_at'
                        ];
}
