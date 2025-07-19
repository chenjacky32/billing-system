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
        Schema::table('billings_category', function (Blueprint $table) {
            $table->integer('power_capacity_value')->nullable()->after('category_name');
            $table->unsignedBigInteger('tower_id')->nullable()->after('power_capacity_value');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('billings_category', function (Blueprint $table) {
            $table->dropColumn(['power_capacity_value', 'tower_id']);
        });
    }
};
