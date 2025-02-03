<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(UserSeeder::class);
        $this->call(ApartmentSeeder::class);
        $this->call(AdminSeeder::class);
        $this->call(ApartmentOwnerSeeder::class);
        $this->call(BillingsTableSeeder::class);
        $this->call(BillingsCategorySeeder::class);
    }
}
