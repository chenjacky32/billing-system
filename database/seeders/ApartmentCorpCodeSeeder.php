<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ApartmentCorpCode;

class ApartmentCorpCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ApartmentCorpCode::create([
            'apartmentId' => 5,
            'partnerServiceId' => '   19097',
            'description' => 'BRIVA WS',
            'isActive' => true
        ]);

        ApartmentCorpCode::create([
            'apartmentId' => 5,
            'partnerServiceId' => '   22129',
            'description' => 'BRIVA WS',
            'isActive' => true
        ]);
    }
}
