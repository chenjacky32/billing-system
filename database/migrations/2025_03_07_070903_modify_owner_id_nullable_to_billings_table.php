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
            $table->dropForeign(['owner_id']);
            $table->unsignedBigInteger('owner_id')->nullable()->change();
            $table->foreign('owner_id')->references('id')->on('apartment_owners')->onDelete('cascade');
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
            $table->dropForeign(['owner_id']);
            $table->unsignedBigInteger('owner_id')->nullable(false)->change();
            $table->foreign('owner_id')->references('id')->on('apartment_owners')->onDelete('cascade');
        });
    }
};
