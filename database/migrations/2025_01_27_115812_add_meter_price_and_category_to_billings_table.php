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
        Schema::table('billings', function (Blueprint $table) {
            $table->integer('start_meter')->nullable();
            $table->integer('end_meter')->nullable();
            $table->integer('unit_price')->nullable();
            $table->integer('minimum_charge')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('billings', function (Blueprint $table) {
            $table->dropColumn(['start_meter', 'end_meter', 'unit_price', 'minimum_charge']);
        });
    }
};
