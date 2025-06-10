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
        Schema::create('billing_pdf_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('billing_id')->nullable()->index();
            $table->string('pdf_path');
            $table->enum('status', ['GENERATED', 'FAILED'])->default('GENERATED');
            $table->string('file_type')->default('INVOICE');  
            $table->text(column: 'error_message')->nullable();
            $table->timestamp('generated_at')->nullable();
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
        Schema::dropIfExists('billing_pdf_logs');
    }
};
