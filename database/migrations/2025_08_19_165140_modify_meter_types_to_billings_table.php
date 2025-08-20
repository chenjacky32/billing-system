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
            $table->decimal('start_meter', 12, places: 3)->change();
            $table->decimal('end_meter', 12, 3)->change();
            $table->decimal('meter_reading', 12, 3)->change();
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
            $table->integer('start_meter')->change();
            $table->integer('end_meter')->change();
            $table->integer('meter_reading')->change();
        });
    }
};
