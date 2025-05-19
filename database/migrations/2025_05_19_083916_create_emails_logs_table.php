<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('emails_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_email');
            $table->string('subject')->nullable();
            $table->text('content_preview')->nullable();
            $table->string(column: 'status')->default('sent'); // 'sent' | 'failed'
            $table->string('email_type'); // 'invoice_attachment' | 'payment_success'    
            $table->unsignedBigInteger('billing_id')->nullable()->index();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('emails_logs');
    }
};
