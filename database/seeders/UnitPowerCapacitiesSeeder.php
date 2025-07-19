<?php

namespace Database\Seeders;

use App\Models\UnitPowerCapacities;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitPowerCapacitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $capacity = ['1300', '2200', '3200'];

        foreach($capacity as $value){
            UnitPowerCapacities::create([
                'capacity_value' => $value,
            ]);
        }
    }
}
