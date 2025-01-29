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
            $table->unsignedBigInteger('billing_category_id')->nullable()->after('billing_type');
            $table->foreign('billing_category_id')->references('id')->on('billings_category');
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
            $table->dropForeign(['billing_category_id']);
            $table->dropColumn('billing_category_id');
        });
    }
};
