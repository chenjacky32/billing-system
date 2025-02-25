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
        Schema::create('billing_fine_rules', function (Blueprint $table) {
            $table->id();
            $table->enum('billing_type', ['Air', 'Listrik', 'Maintenance', 'Parkir']);
            $table->unsignedBigInteger('apartment_id')->nullable();
            $table->foreign('apartment_id')->references('id')->on('apartments')->onDelete('cascade');
            $table->integer('fine_rate_per_day');
            $table->integer('max_fine');
            $table->decimal('percentage', 5, 2)->default(0);
            $table->integer('due_date')->default(10); 
            $table->unsignedBigInteger('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
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
        Schema::dropIfExists('billing_fine_rules');
    }
};
