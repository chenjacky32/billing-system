<?php

namespace Database\Seeders;

use App\Models\ApartmentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ApartmentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        ApartmentType::create([
            'name' => 'Studio',
        ]);

        ApartmentType::create([
            'name' => '2 Bedroom',
        ]);
    }
}
