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
        Schema::create('va_Payment', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('billingId')->nullable();
            $table->string('trxId')->unique;
            $table->integer('partnerServiceId');
            $table->integer('customerNo');
            $table->integer('virtualAccountNo'); 
            $table->string('virtualAccountName');
            $table->integer('totalAmount');
            $table->enum('currency',['IDR','USD']);
            $table->date('expiredDate');
            $table->text('description');
            $table->timestamps();
            $table->foreign('billingId')->references('id')->on('billings')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('va_payment');
    }
};
